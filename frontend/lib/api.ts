const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to get CSRF token from cookie
function getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/csrf_token=([^;]+)/);
    return match ? match[1] : null;
}

export class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private getHeaders(requiresCsrf: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Add CSRF token for state-changing requests
        if (requiresCsrf) {
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }
        }

        return headers;
    }

    private async refreshCsrfToken(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/csrf-token`, {
                method: 'GET',
                credentials: 'include',
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    private async handleErrorResponse(response: Response): Promise<never> {
        let message = `Erro HTTP! Status: ${response.status}`;
        try {
            const errorText = await response.text();
            if (errorText) {
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson && errorJson.message) {
                        message = Array.isArray(errorJson.message)
                            ? errorJson.message.join(', ')
                            : errorJson.message;
                    }
                } catch {
                    // Not JSON, use raw text
                    message = errorText;
                }
            }
        } catch {
            // Ignore body read errors
        }
        throw new Error(message);
    }

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
            credentials: 'include',
        });

        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized - redirecting to login');
        }

        if (!response.ok) {
            await this.handleErrorResponse(response);
        }

        return response.json();
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        let response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        // Auto-refresh CSRF token if forbidden (CSRF missing/invalid)
        if (response.status === 403) {
            const refreshed = await this.refreshCsrfToken();
            if (refreshed) {
                response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'POST',
                    headers: this.getHeaders(true),
                    credentials: 'include',
                    body: JSON.stringify(data),
                });
            }
        }

        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized - redirecting to login');
        }

        if (!response.ok) {
            await this.handleErrorResponse(response);
        }

        return response.json();
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        let response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        // Auto-refresh CSRF token if forbidden (CSRF missing/invalid)
        if (response.status === 403) {
            const refreshed = await this.refreshCsrfToken();
            if (refreshed) {
                response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'PUT',
                    headers: this.getHeaders(true),
                    credentials: 'include',
                    body: JSON.stringify(data),
                });
            }
        }

        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized - redirecting to login');
        }

        if (!response.ok) {
            await this.handleErrorResponse(response);
        }

        return response.json();
    }

    async delete(endpoint: string): Promise<void> {
        let response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
            credentials: 'include',
        });

        // Auto-refresh CSRF token if forbidden (CSRF missing/invalid)
        if (response.status === 403) {
            const refreshed = await this.refreshCsrfToken();
            if (refreshed) {
                response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'DELETE',
                    headers: this.getHeaders(true),
                    credentials: 'include',
                });
            }
        }

        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized - redirecting to login');
        }

        if (!response.ok) {
            await this.handleErrorResponse(response);
        }
    }

    // Auth-specific methods
    async checkAuth(): Promise<{ authenticated: boolean; username?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/me`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                return { authenticated: false };
            }

            const data = await response.json();

            // Sincroniza o token CSRF caso o cookie tenha expirado/sido apagado
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                await this.refreshCsrfToken();
            }

            return { authenticated: true, username: data.username };
        } catch {
            return { authenticated: false };
        }
    }

    async logout(): Promise<void> {
        await fetch(`${this.baseUrl}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    }
}

export const api = new ApiClient();

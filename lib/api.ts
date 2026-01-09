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

    private getHeaders(includeBody: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Add CSRF token for state-changing requests
        if (includeBody) {
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }
        }

        return headers;
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized - redirecting to login');
        }

        if (!response.ok) {
            const errorText = await response.text();
            let errorDetail = errorText;
            try {
                const errorJson = JSON.parse(errorText);
                errorDetail = JSON.stringify(errorJson, null, 2);
            } catch {
                // Error is not JSON
            }
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetail}`);
        }

        return response.json();
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized - redirecting to login');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async delete(endpoint: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
            credentials: 'include',
        });

        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized - redirecting to login');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
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

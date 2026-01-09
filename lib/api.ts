const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        console.log(`[API] POST ${endpoint}`);
        console.log(`[API] Request data:`, JSON.stringify(data, null, 2));

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API] POST ${endpoint} failed with status ${response.status}`);
            console.error(`[API] Error response:`, errorText);

            let errorDetail = errorText;
            try {
                const errorJson = JSON.parse(errorText);
                errorDetail = JSON.stringify(errorJson, null, 2);
                console.error(`[API] Error details:`, errorJson);
            } catch (e) {
                // Error is not JSON
            }

            throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetail}`);
        }

        const result = await response.json();
        console.log(`[API] POST ${endpoint} succeeded`);
        return result;
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async delete(endpoint: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }
}

export const api = new ApiClient();

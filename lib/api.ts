const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Configuração de logs de diagnóstico
const ENABLE_PERFORMANCE_LOGS = true;

function logPerformance(method: string, endpoint: string, startTime: number, success: boolean = true) {
    if (!ENABLE_PERFORMANCE_LOGS) return;

    const duration = performance.now() - startTime;
    const status = success ? '✅' : '❌';
    const color = duration > 1000 ? 'color: red; font-weight: bold' :
        duration > 500 ? 'color: orange' :
            'color: green';

    console.log(
        `%c[API ${status}] ${method} ${endpoint} - ${duration.toFixed(2)}ms`,
        color
    );

    if (duration > 1000) {
        console.warn(`⚠️ Requisição lenta detectada: ${method} ${endpoint} levou ${duration.toFixed(2)}ms`);
    }
}

export class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
        if (ENABLE_PERFORMANCE_LOGS) {
            console.log(`[API] Cliente inicializado. Base URL: ${API_URL}`);
        }
    }

    async get<T>(endpoint: string): Promise<T> {
        const startTime = performance.now();
        if (ENABLE_PERFORMANCE_LOGS) {
            console.log(`[API] 🚀 Iniciando GET ${endpoint}`);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                logPerformance('GET', endpoint, startTime, false);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            logPerformance('GET', endpoint, startTime, true);

            if (ENABLE_PERFORMANCE_LOGS && Array.isArray(data)) {
                console.log(`[API] 📦 GET ${endpoint} retornou ${data.length} itens`);
            }

            return data;
        } catch (error) {
            logPerformance('GET', endpoint, startTime, false);
            throw error;
        }
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
        const startTime = performance.now();
        if (ENABLE_PERFORMANCE_LOGS) {
            console.log(`[API] 🚀 Iniciando PUT ${endpoint}`);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                logPerformance('PUT', endpoint, startTime, false);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            logPerformance('PUT', endpoint, startTime, true);
            return result;
        } catch (error) {
            logPerformance('PUT', endpoint, startTime, false);
            throw error;
        }
    }

    async delete(endpoint: string): Promise<void> {
        const startTime = performance.now();
        if (ENABLE_PERFORMANCE_LOGS) {
            console.log(`[API] 🚀 Iniciando DELETE ${endpoint}`);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                logPerformance('DELETE', endpoint, startTime, false);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            logPerformance('DELETE', endpoint, startTime, true);
        } catch (error) {
            logPerformance('DELETE', endpoint, startTime, false);
            throw error;
        }
    }
}

export const api = new ApiClient();

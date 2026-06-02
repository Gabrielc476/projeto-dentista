import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('SecurityAudit');

    // Track failed attempts per IP for rate limiting detection
    private failedAttempts = new Map<string, { count: number; firstAttempt: number }>();

    // Suspicious patterns to detect
    private readonly suspiciousPatterns = [
        /[<>]/,                              // XSS attempt
        /javascript:/i,                       // XSS via javascript: URI
        /on\w+\s*=/i,                         // Event handler injection
        /union\s+select/i,                    // SQL injection
        /;\s*drop\s+table/i,                  // SQL injection
        /'\s*or\s+'1'\s*=\s*'1/i,             // SQL injection
        /--\s*$/,                             // SQL comment injection
        /\.\.\//,                             // Path traversal
        /%00/,                                // Null byte injection
    ];

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const ip = this.getClientIp(request);
        const startTime = Date.now();

        // Check for suspicious patterns in request
        this.checkForSuspiciousPatterns(request, ip);

        return next.handle().pipe(
            tap(() => {
                // Clear failed attempts on success
                this.failedAttempts.delete(ip);
            }),
            catchError((error) => {
                this.handleError(error, request, ip, startTime);
                throw error;
            }),
        );
    }

    private getClientIp(request: Request): string {
        return request.headers['x-forwarded-for']?.toString().split(',')[0] ||
            request.ip ||
            'unknown';
    }

    private checkForSuspiciousPatterns(request: Request, ip: string) {
        const checkValue = (value: unknown, location: string) => {
            if (typeof value === 'string') {
                for (const pattern of this.suspiciousPatterns) {
                    if (pattern.test(value)) {
                        this.logSecurityEvent('SUSPICIOUS_INPUT', request, ip, {
                            location,
                            pattern: pattern.toString(),
                            value: value.substring(0, 100), // Truncate for log
                        });
                        break;
                    }
                }
            } else if (typeof value === 'object' && value !== null) {
                Object.values(value).forEach(v => checkValue(v, location));
            }
        };

        // Check request body
        if (request.body) {
            checkValue(request.body, 'body');
        }

        // Check query parameters
        if (request.query) {
            checkValue(request.query, 'query');
        }

        // Check URL parameters
        if (request.params) {
            checkValue(request.params, 'params');
        }
    }

    private handleError(error: any, request: Request, ip: string, startTime: number) {
        const statusCode = error?.status || error?.statusCode || 500;
        const duration = Date.now() - startTime;

        // Track failed auth attempts
        if (statusCode === 401 || statusCode === 403) {
            this.trackFailedAttempt(ip, request);
        }

        // Log security-relevant errors
        if (statusCode === 401 || statusCode === 403 || statusCode === 429) {
            this.logSecurityEvent('AUTH_FAILURE', request, ip, {
                statusCode,
                error: error?.message,
                duration,
            });
        }
    }

    private trackFailedAttempt(ip: string, request: Request) {
        const now = Date.now();
        const attempts = this.failedAttempts.get(ip);

        if (!attempts) {
            this.failedAttempts.set(ip, { count: 1, firstAttempt: now });
            return;
        }

        // Reset if window expired (5 minutes)
        if (now - attempts.firstAttempt > 5 * 60 * 1000) {
            this.failedAttempts.set(ip, { count: 1, firstAttempt: now });
            return;
        }

        attempts.count++;

        // Alert on potential brute force (10+ failures in 5 minutes)
        if (attempts.count >= 10) {
            this.logSecurityEvent('BRUTE_FORCE_DETECTED', request, ip, {
                attempts: attempts.count,
                windowMinutes: 5,
            });
        }
    }

    private logSecurityEvent(
        eventType: string,
        request: Request,
        ip: string,
        details: Record<string, unknown> = {}
    ) {
        this.logger.warn({
            event: eventType,
            ip,
            userAgent: request.headers['user-agent'] || 'unknown',
            method: request.method,
            path: request.path,
            timestamp: new Date().toISOString(),
            ...details,
        });
    }
}

import {
    Injectable,
    NestMiddleware,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    private readonly logger = new Logger('SecurityAudit');

    use(req: Request, res: Response, next: NextFunction) {
        // Skip CSRF validation for safe methods
        const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
        if (safeMethods.includes(req.method)) {
            return next();
        }

        // Only validate CSRF for API routes
        if (!req.path.startsWith('/api/')) {
            return next();
        }

        // Skip CSRF for all auth endpoints
        if (req.path.startsWith('/auth')) {
            return next();
        }

        // Skip if no JWT cookie (will be caught by JwtAuthGuard)
        if (!req.cookies?.jwt) {
            return next();
        }

        // Get CSRF token from header and cookie
        const csrfHeader = req.headers['x-csrf-token'] as string;
        const csrfCookie = req.cookies.csrf_token;

        if (!csrfHeader || !csrfCookie) {
            this.logSecurityEvent('CSRF_MISSING', req, 'CSRF token missing from request');
            throw new ForbiddenException('CSRF token missing');
        }

        if (csrfHeader !== csrfCookie) {
            this.logSecurityEvent('CSRF_MISMATCH', req, 'CSRF token mismatch - possible attack');
            throw new ForbiddenException('Invalid CSRF token');
        }

        next();
    }

    private logSecurityEvent(eventType: string, req: Request, message: string) {
        const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip;
        const userAgent = req.headers['user-agent'] || 'unknown';

        this.logger.warn({
            event: eventType,
            message,
            ip,
            userAgent,
            method: req.method,
            path: req.path,
            timestamp: new Date().toISOString(),
        });
    }
}

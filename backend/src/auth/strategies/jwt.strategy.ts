import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger('SecurityAudit');

    constructor(private configService: ConfigService) {
        const options: StrategyOptionsWithRequest = {
            // Extract JWT from HttpOnly cookie instead of Authorization header
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    const cookies = (req as any)?.cookies;
                    return cookies?.jwt || null;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret-change-in-production',
            passReqToCallback: true,
        };
        super(options);
    }

    async validate(req: Request, payload: any) {
        // Validate fingerprint to prevent token replay attacks
        const currentFingerprint = this.generateFingerprint(req);

        if (payload.fingerprint !== currentFingerprint) {
            this.logger.warn(`Fingerprint mismatch detected for user: ${payload.username}`);
            throw new UnauthorizedException('Invalid request fingerprint');
        }

        // JWT validated successfully

        return {
            userId: payload.sub,
            username: payload.username,
        };
    }

    private generateFingerprint(req: Request): string {
        const userAgent = req.headers['user-agent'] || '';
        const acceptLanguage = req.headers['accept-language'] || '';
        const acceptEncoding = req.headers['accept-encoding'] || '';
        const xForwardedFor = req.headers['x-forwarded-for'];
        const ip = (typeof xForwardedFor === 'string' ? xForwardedFor.split(',')[0] : '') || req.ip || '';

        const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ip}`;

        return crypto.createHash('sha256').update(fingerprintData).digest('hex');
    }
}

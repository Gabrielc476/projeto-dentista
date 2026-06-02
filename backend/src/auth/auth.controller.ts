import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    Req,
    HttpCode,
    HttpStatus,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { IsString, IsNotEmpty } from 'class-validator';
import * as crypto from 'crypto';

class LoginDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger('SecurityAudit');

    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const fingerprint = this.generateFingerprint(req);

        const { accessToken, csrfToken } = await this.authService.login(
            loginDto.username,
            loginDto.password,
            fingerprint,
        );

        // Set JWT in HttpOnly cookie
        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

        res.cookie('jwt', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
        });

        // Set CSRF token in a separate cookie (readable by JS)
        res.cookie('csrf_token', csrfToken, {
            httpOnly: false,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'strict',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });

        // Login successful

        return {
            message: 'Login successful',
            user: { username: loginDto.username },
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('jwt', { path: '/' });
        res.clearCookie('csrf_token', { path: '/' });

        // User logged out

        return { message: 'Logout successful' };
    }

    @Get('csrf-token')
    getCsrfToken(@Res({ passthrough: true }) res: Response) {
        const csrfToken = this.authService.generateCsrfToken();

        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

        res.cookie('csrf_token', csrfToken, {
            httpOnly: false,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'strict',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });

        return { csrfToken };
    }

    @Get('me')
    async getMe(@Req() req: Request) {
        const cookies = (req as any).cookies;
        const jwt = cookies?.jwt;

        if (!jwt) {
            throw new UnauthorizedException('Not authenticated');
        }

        try {
            const jwtService = (this.authService as any).jwtService;
            const payload = await jwtService.verifyAsync(jwt);
            return {
                username: payload.username,
                authenticated: true,
            };
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    private generateFingerprint(req: Request): string {
        const userAgent = req.headers['user-agent'] || '';
        const acceptLanguage = req.headers['accept-language'] || '';
        const acceptEncoding = req.headers['accept-encoding'] || '';
        // Use X-Forwarded-For for proxied requests, fallback to direct IP
        const xForwardedFor = req.headers['x-forwarded-for'];
        const ip = (typeof xForwardedFor === 'string' ? xForwardedFor.split(',')[0] : '') || req.ip || '';

        const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ip}`;

        // Create a hash of the fingerprint data
        return crypto.createHash('sha256').update(fingerprintData).digest('hex');
    }
}

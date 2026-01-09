import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface UserPayload {
    sub: string;
    username: string;
    fingerprint: string;
}

export interface TokenPayload {
    accessToken: string;
    csrfToken: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger('SecurityAudit');

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async validateUser(username: string, password: string): Promise<{ username: string } | null> {
        const adminUsername = this.configService.get<string>('ADMIN_USERNAME') || '';
        const adminPasswordHash = this.configService.get<string>('ADMIN_PASSWORD_HASH') || '';

        if (username !== adminUsername) {
            this.logger.warn(`Login attempt with invalid username: ${username}`);
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
        if (!isPasswordValid) {
            this.logger.warn(`Login attempt with invalid password for user: ${username}`);
            return null;
        }

        // Successful auth - no log needed (reduces noise)
        return { username };
    }

    async login(username: string, password: string, fingerprint: string): Promise<TokenPayload> {
        const user = await this.validateUser(username, password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const csrfToken = crypto.randomBytes(32).toString('hex');

        const payload: UserPayload = {
            sub: user.username,
            username: user.username,
            fingerprint: fingerprint,
        };

        const accessToken = this.jwtService.sign(payload);

        // Token generated successfully

        return {
            accessToken,
            csrfToken,
        };
    }

    generateCsrfToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    validateFingerprint(tokenFingerprint: string, requestFingerprint: string): boolean {
        return tokenFingerprint === requestFingerprint;
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }
}

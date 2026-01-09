import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        // Check if JWT cookie exists
        if (!request.cookies?.jwt) {
            this.logger.warn('Access attempt without JWT token');
            throw new UnauthorizedException('Authentication required');
        }

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            this.logger.warn(`JWT validation failed: ${info?.message || err?.message || 'Unknown error'}`);
            throw err || new UnauthorizedException('Invalid or expired token');
        }
        return user;
    }
}

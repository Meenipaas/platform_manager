import { ILogger, InjectLogger, Logger } from '@ddboot/log4js';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { BaseException } from '~/exceptions';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger: Logger;

  constructor(
    private jwtService: JwtService,
    @InjectLogger() private log: ILogger,
  ) {
    this.logger = log.getLogger(AuthGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    this.logger.debug('current token is ', token);
    if (!token) {
      this.logger.error('error', 'token is not founded');
      throw new BaseException('U10002', HttpStatus.UNAUTHORIZED);
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch (e) {
      this.logger.error('error', e);
      throw new BaseException('U10003', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

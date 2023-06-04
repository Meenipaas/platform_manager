import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  Injectable,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { NestLoggerService } from '@ddboot/log4js';
import { toJSON } from '../utils';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  constructor(private log: NestLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const call$ = next.handle();
    const request = context.switchToHttp().getRequest<Request>();
    const content = `${request.ip} ${request.method} -> ${request.url} `;
    //替换password 为 ****
    const jsonStr = toJSON(request.body).replace(
      /"password":"(.*)"/g,
      '"password":"****"',
    );
    const requestStart = `${request.ip} ${request.method} <- ${request.url} body: ${jsonStr}`;
    const now = Date.now();
    this.log.log('req: ' + requestStart, 'interface');
    return call$.pipe(
      tap(() =>
        this.log.log('res:' + content + `${Date.now() - now}ms`, 'interface'),
      ),
    );
  }
}

import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { BaseException } from '../exceptions/base.exception';
import { ErrorCode } from './base.code';

/**
 *  重写 BaseExceptionFilter
 */
@Catch(BaseException)
export class BaseErrorExceptionFilter extends BaseExceptionFilter {
  catch(exception: BaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    console.error('BaseErrorExceptionFilter enter');
    const response = ctx.getResponse<Response>();
    if (ErrorCode[exception.message]) {
      const message = ErrorCode[exception.message];
      const status = HttpStatus.BAD_REQUEST;
      return response.status(status).json({
        message: message,
        code: exception.message,
        stack: exception?.stack,
      });
    } else {
      super.catch(exception, host);
    }
  }
}

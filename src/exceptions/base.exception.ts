import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(errorCode: string, status?: HttpStatus) {
    super(errorCode, status || HttpStatus.BAD_REQUEST);
  }
}

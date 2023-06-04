import { Injectable } from '@nestjs/common';
import { Logger, InjectLogger, ILogger } from '@ddboot/log4js';
import { BaseException } from '~/exceptions';
@Injectable()
export class AppService {
  private logger: Logger;

  constructor(@InjectLogger() log: ILogger) {
    this.logger = log.getLogger(AppService.name);
  }

  async getHello() {
    throw new BaseException('A1s000');
  }
}

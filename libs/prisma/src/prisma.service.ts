import { ILogger, InjectLogger, Logger } from '@ddboot/log4js';
import {
  INestApplication,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  PrismaPerformanceLogMiddleware,
  PrismaUpdateOptionMiddleware,
} from './prisma.middleware';
import { PRISMA_OPTIONS } from './prisma.constant';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error'>
  implements OnModuleInit
{
  private readonly LOG: Logger;
  private logList: any;
  private logListFlag: boolean;

  constructor(
    @Inject(PRISMA_OPTIONS) private readonly database: any,
    @InjectLogger() private readonly logger: ILogger,
  ) {
    super({
      log: [{ emit: 'event', level: 'query' }],
      errorFormat: 'colorless',
    });

    this.LOG = this.logger.getLogger(PrismaService.name);
    this.initDataBase();
  }

  initDataBase() {
    process.env.DATABASE_URL = this.generateDatabaseUrl(this.database);
  }

  async onModuleInit() {
    this.LOG.debug('db connect url =', process.env.DATABASE_URL);
    await this.$connect();
    const performanceMiddleware = PrismaPerformanceLogMiddleware(this.LOG);
    this.$use(PrismaUpdateOptionMiddleware);
    this.$use(performanceMiddleware);
    this.$on('query', this.toLogger);
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  generateDatabaseUrl(dataBase: any) {
    const { host, user, password, type, port, database } = dataBase;
    if (type === 'postgresql') {
      return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
    }
    if (type === 'mysql') {
      return `mysql://${user}:${password}@${host}:${port}/${database}`;
    }
    return `file:./${database}`;
  }

  toLogger({ query }) {
    if (query === 'BEGIN') {
      this.logList = [];
      this.logListFlag = true;
    }
    if (!this.logListFlag) {
      this.LOG.debug('[prisma:query]  ', query);
    } else {
      this.logList.push(query);
    }
    if (query === 'COMMIT') {
      this.logListFlag = false;
      this.LOG.debug('[prisma:query]', this.logList);
    }
  }
}

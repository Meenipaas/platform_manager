import {
  HttpExceptionFilter,
  HttpLoggerInterceptor,
  ResponseTransformInterceptor,
} from '@ddboot/core';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from '@ddboot/prisma';
import { NestLoggerService } from '@ddboot/log4js';
import { ValidationPipe } from '@nestjs/common';
import { BaseErrorExceptionFilter, BaseException } from '~/exceptions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);
  const log4jService = app.get(NestLoggerService);
  app.useLogger(log4jService);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        log4jService.error(errors);
        throw new BaseException('T10000');
      },
    }),
  );
  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(),
    new HttpLoggerInterceptor(log4jService),
  );
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter),
    new BaseErrorExceptionFilter(httpAdapter),
    // new HttpExceptionFilter(httpAdapter),
  );

  await app.listen(3000);
}
bootstrap();

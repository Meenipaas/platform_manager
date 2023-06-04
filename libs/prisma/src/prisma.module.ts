import { CONFIG, ConfigService } from '@ddboot/config';
import { DynamicModule, Module } from '@nestjs/common';
import { PRISMA_CONFIG_KEY, PRISMA_OPTIONS } from './prisma.constant';
import { PrismaHelper } from './prisma.helper';
import { DBOption } from './prisma.interface';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {
  static forRootAsync(options: DBOption): DynamicModule {
    const inject = options.inject || [];
    const optionsProvider = {
      provide: PRISMA_OPTIONS,
      useFactory: (...params: any[]) => {
        const registerOptions = options;
        const configService: ConfigService = params[inject.indexOf(CONFIG)];
        if (configService) {
          options = configService.get(PRISMA_CONFIG_KEY);
        }
        return Object.assign(registerOptions, options);
      },
      inject,
    };
    return {
      global: true,
      module: PrismaModule,
      providers: [optionsProvider, PrismaService, PrismaHelper],
      exports: [optionsProvider, PrismaService, PrismaHelper],
    };
  }
}

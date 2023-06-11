import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SshModule } from './modules/ssh';
import { CONFIG, ConfigModule } from '@ddboot/config';
import { ConfigService, LoggerModule } from '@ddboot/log4js';
import { PrismaModule } from '@ddboot/prisma';
import { UserModule } from '~/modules/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth.guard';
import { VirtualMachineModule } from './modules/virtualMachine/virtual-machine.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SshModule,
    ConfigModule.forRoot({}),
    LoggerModule.forRootAsync({
      inject: [CONFIG],
    }),
    UserModule,
    PrismaModule.forRootAsync({
      inject: [CONFIG],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    VirtualMachineModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class AppModule {}

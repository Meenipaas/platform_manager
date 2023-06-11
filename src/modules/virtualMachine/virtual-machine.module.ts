import { Module } from '@nestjs/common';
import { VirtualMachineService } from './virtual-machine.service';
import { VirtualMachineController } from './virtual-machine.controller';
import { VirtualMachineDao } from './virtual-machine.dao';
import { HelperModule } from '~/common/helper.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@ddboot/log4js';
import { CONFIG } from '@ddboot/config';

@Module({
  imports: [
    HelperModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.key');
        return {
          secret,
        };
      },
      inject: [CONFIG],
    }),
  ],
  controllers: [VirtualMachineController],
  providers: [VirtualMachineService, VirtualMachineDao],
})
export class VirtualMachineModule {}

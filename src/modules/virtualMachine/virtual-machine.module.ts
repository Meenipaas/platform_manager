import { Module } from '@nestjs/common';
import { VirtualMachineService } from './virtual-machine.service';
import { VirtualMachineController } from './virtual-machine.controller';
import { VirtualMachineDao } from './virtual-machine.dao';
import { HelperModule } from '~/common/helper.module';

@Module({
  imports: [HelperModule],
  controllers: [VirtualMachineController],
  providers: [VirtualMachineService, VirtualMachineDao],
})
export class VirtualMachineModule {}

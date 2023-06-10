import { VirtualMachineService } from './virtual-machine.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DeleteVirtualDto, VirtualDto } from './virtual.dto';
import { Message, Pagination } from '@ddboot/core';
import { QueryParam } from '~/models/queryParam.dto';
import { AuthGuard } from '~/guard/auth.guard';

@Controller('vm')
export class VirtualMachineController {
  constructor(private readonly virtualMachineService: VirtualMachineService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Message('add virtual machine success')
  addVirtualMachine(@Body() vm: VirtualDto) {
    return this.virtualMachineService.addVirtualMachine(vm);
  }

  @Post('connect')
  @UseGuards(AuthGuard)
  @Message('test vm connect success')
  testVmConnect(@Body() vm: VirtualDto) {
    return this.virtualMachineService.testVmConnect(vm);
  }

  @Get()
  @Pagination()
  @UseGuards(AuthGuard)
  @Message('query vm list')
  listVM(
    @Query() queryParam: QueryParam,
    @Query('hostname') hostname: string,
    @Query('id') id: string,
  ) {
    return this.virtualMachineService.listVirtualMachine(
      queryParam,
      hostname,
      id,
    );
  }

  @Delete()
  @Message('delete vm success')
  deleteVM(@Body() vms: DeleteVirtualDto[]) {
    return this.virtualMachineService.deleteVM(vms);
  }
}

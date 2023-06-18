import { VirtualMachineService } from './virtual-machine.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  DeleteVirtualDto,
  UpdateBasicVirtualDto,
  VirtualDto,
} from './virtual.dto';
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

  @Put('basic_info')
  @UseGuards(AuthGuard)
  @Message('update virtual machine basic info success')
  updateVirtualMachineBasicInfo(@Body() vm: UpdateBasicVirtualDto) {
    return this.virtualMachineService.updateVirtualMachineBasicInfo(vm);
  }

  @Get('connect')
  @UseGuards(AuthGuard)
  @Message('test vm connect success')
  testVmConnect(@Query('ip') vmIP: string) {
    return this.virtualMachineService.testVmConnect(vmIP);
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
  deleteVM(@Body() vms: DeleteVirtualDto) {
    return this.virtualMachineService.deleteVM(vms.ids);
  }
}

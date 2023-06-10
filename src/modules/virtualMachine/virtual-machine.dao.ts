import { Injectable } from '@nestjs/common';
import { DeleteVirtualDto, VirtualDto } from './virtual.dto';
import { PaginationParam, PrismaHelper, PrismaService } from '@ddboot/prisma';
import { VirtualMachine } from '@prisma/client';

@Injectable()
export class VirtualMachineDao {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly prismaHelper: PrismaHelper,
  ) {}

  addVirtualMachine(vm: VirtualDto) {
    return this.prismaService.virtualMachine.create({
      data: {
        ip: vm.ip,
        rootPassword: vm.rootPassword,
      },
    });
  }

  listVirtual(pagination: PaginationParam, keyWord?: string) {
    const containName = this.prismaHelper.likeQuery<VirtualMachine>(
      keyWord,
      'hostname',
    );
    const pageParams = this.prismaHelper.paginationParams(pagination);
    const data = this.prismaService.virtualMachine.findMany({
      ...pageParams,
      where: {
        ...containName,
      },
    });
    const count = this.prismaService.virtualMachine.count({
      where: {
        ...containName,
      },
    });
    return this.prismaService.$transaction([data, count]);
  }

  deleteVM(vms: DeleteVirtualDto[]): any {
    return this.prismaService.virtualMachine.deleteMany({
      where: {
        id: {
          in: vms.map((item) => item.id),
        },
      },
    });
  }
}

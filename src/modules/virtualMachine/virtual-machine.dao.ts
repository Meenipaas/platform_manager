import { Injectable } from '@nestjs/common';
import { UpdateBasicVirtualDto, VirtualDto } from './virtual.dto';
import { PaginationParam, PrismaHelper, PrismaService } from '@ddboot/prisma';
import { VirtualMachine } from '@prisma/client';

@Injectable()
export class VirtualMachineDao {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly prismaHelper: PrismaHelper,
  ) {}

  getVMByIP(vmIP: string) {
    return this.prismaService.virtualMachine.findUnique({
      where: {
        ip: vmIP,
      },
    });
  }
  addVirtualMachine(vm: VirtualDto) {
    return this.prismaService.virtualMachine.create({
      data: {
        ip: vm.ip,
        rootPassword: vm.rootPassword,
      },
    });
  }

  getVMInfoById(vmId: string) {
    return this.prismaService.virtualMachine.findUnique({
      select: {
        id: true,
        hostname: true,
        ip: true,
        created_at: true,
        updated_at: true,
        virtualMachineDisks: {
          select: {
            id: true,
            fileSystem: true,
            size: true,
            mountedOn: true,
            used: true,
            avail: true,
          },
        },
        metrics: {
          select: {
            id: true,
            time: true,
            metricsCPU: true,
            metricsBandwidth: true,
            MetricsMemory: true,
          },
        },
      },
      where: {
        id: vmId,
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
      select: {
        id: true,
        hostname: true,
        ip: true,
        created_at: true,
        updated_at: true,
        agentId: true,
      },
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

  updateVirtualMachineBasicInfo(vm: UpdateBasicVirtualDto) {
    return this.prismaService.virtualMachine.update({
      where: {
        id: vm.id,
      },
      data: {
        ip: vm.ip,
        rootPassword: vm.rootPassword,
      },
    });
  }

  deleteVM(vmIds: string[]): any {
    return this.prismaService.virtualMachine.deleteMany({
      where: {
        id: {
          in: vmIds,
        },
      },
    });
  }
}

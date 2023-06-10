import { Injectable } from '@nestjs/common';
import { DeleteVirtualDto, VirtualDto } from './virtual.dto';
import { VirtualMachineDao } from './virtual-machine.dao';
import { Log4j, Logger } from '@ddboot/log4js';
import { catchError, concatMap, from, map } from 'rxjs';
import { InjectSSH } from '../ssh';
import { NodeSSH } from 'node-ssh';
import { HelperService } from '~/common/helper.service';
import { BaseException } from '~/exceptions';
import { encrypt } from '@ddboot/core';
import { Value } from '@ddboot/config';
import { QueryParam } from '~/models/queryParam.dto';

@Injectable()
export class VirtualMachineService {
  @Log4j()
  private log: Logger;

  @Value('crypto.saltKey')
  private passSaltKey: string;

  constructor(
    private readonly virtualMachineDao: VirtualMachineDao,
    private readonly helperService: HelperService,
    @InjectSSH() private ssh: NodeSSH,
  ) {}

  addVirtualMachine(vm: VirtualDto) {
    this.log.info('begin to add virtual machine');
    const encryPass = encrypt(this.passSaltKey, vm.rootPassword);
    vm.rootPassword = encryPass;
    return from(this.virtualMachineDao.addVirtualMachine(vm)).pipe(
      map(() => {
        return {
          done: true,
        };
      }),
    );
  }
  /**
   * 测试虚拟机
   * @param vm
   * @returns
   */
  testVmConnect(vm: VirtualDto) {
    this.log.info('begin to test Vm Connected');
    this.log.debug('testAgentConnected vm info  =', vm);
    this.log.info('begin test ip ping, the ip is ', vm.ip);
    return from(
      this.helperService.executeCommand('ping', vm.ip, '-c', '4'),
    ).pipe(
      catchError((error) => {
        this.log.error('ping ip error = ', error);
        throw error;
      }),
      concatMap(() => {
        return from(
          this.ssh.connect({
            host: vm.ip,
            username: 'root',
            password: vm.rootPassword,
          }),
        ).pipe(
          catchError((error) => {
            this.log.error('ssh connect error = ', error);
            throw error;
          }),
        );
      }),
      catchError(() => {
        throw new BaseException('U10004');
      }),
    );
  }

  listVirtualMachine(queryParam: QueryParam, keyWord: string, id?: string) {
    this.log.info('begin to list virtual machine');
    this.log.debug('listVirtualMachine query params  =  ', queryParam);
    this.log.debug('listVirtualMachine keyWord  =  ', keyWord);
    this.log.debug('listVirtualMachine id  =  ', id);
    if (id) {
      return null;
    }
    return from(this.virtualMachineDao.listVirtual(queryParam, keyWord)).pipe(
      map(([data, count]) => {
        return {
          data,
          total: count,
          current: queryParam.current,
          pageSize: queryParam.pageSize,
        };
      }),
    );
  }

  deleteVM(vms: DeleteVirtualDto[]) {
    this.log.info('begin to delete vm');
    return from(this.virtualMachineDao.deleteVM(vms)).pipe(map(() => ({})));
  }
}

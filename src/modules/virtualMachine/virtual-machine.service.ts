import { Injectable } from '@nestjs/common';
import { DeleteVirtualDto, VirtualDto } from './virtual.dto';
import { VirtualMachineDao } from './virtual-machine.dao';
import { Log4j, Logger } from '@ddboot/log4js';
import { catchError, concatMap, from, map } from 'rxjs';
import { InjectSSH } from '../ssh';
import { NodeSSH } from 'node-ssh';
import { HelperService } from '~/common/helper.service';
import { BaseException } from '~/exceptions';
import { decrypt, encrypt } from '@ddboot/core';
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
    const encryptPass = encrypt(this.passSaltKey, vm.rootPassword);
    vm.rootPassword = encryptPass;
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
  testVmConnect(vmIP: string) {
    this.log.info('begin to test Vm Connected ,the vm ip is ', vmIP);
    if (!vmIP) {
      this.log.error('vm ip is null');
      throw new BaseException('U10005');
    }
    return from(this.virtualMachineDao.getVMByIP(vmIP)).pipe(
      concatMap((vmInfo) => {
        if (!vmInfo) {
          this.log.error('vm not exist');
          throw new Error('vm not exist');
        }
        return from(
          this.helperService.executeCommand('ping', vmInfo.ip, '-t', '2'),
        ).pipe(
          catchError((error) => {
            this.log.error('ping ip error = ', error);
            throw error;
          }),
          concatMap(() => {
            const decryPass = decrypt(this.passSaltKey, vmInfo.rootPassword);
            return from(
              this.ssh.connect({
                host: vmInfo.ip,
                username: 'root',
                password: decryPass,
              }),
            ).pipe(
              catchError((error) => {
                this.log.error('ssh connect error = ', error);
                throw error;
              }),
              map(() => {
                return {
                  done: true,
                };
              }),
            );
          }),
          catchError(() => {
            throw new BaseException('U10004');
          }),
        );
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

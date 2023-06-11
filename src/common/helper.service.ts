import { Log4j, Logger } from '@ddboot/log4js';
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as util from 'util';
const execPromise = util.promisify(exec);

@Injectable()
export class HelperService {
  @Log4j()
  private log: Logger;

  async executeCommand(...cmd: string[]) {
    this.log.info('begin to execute command = ', cmd);
    if (!cmd) {
      this.log.error('command is null');
      throw new Error('command is null');
    }
    const controller = new AbortController();
    const { signal } = controller;
    const { stdout, stderr } = await execPromise(cmd.toString(), { signal });
    if (stderr) {
      this.log.error('execute command error = ', stderr);
      controller.abort();
      throw new Error('execute command error');
    }
    this.log.info('end to execute command');
    return stdout;
  }
}

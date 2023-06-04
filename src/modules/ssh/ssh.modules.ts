import { Module, Global, Provider } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';
import { SSH } from './ssh.constant';

const SshProvider: Provider = {
  provide: SSH,
  useValue: new NodeSSH(),
};

@Global()
@Module({
  providers: [SshProvider],
  exports: [SshProvider],
})
export class SshModule {}

import { Inject } from '@nestjs/common';

export const SSH = 'SSH';
export const InjectSSH = () => Inject(SSH);

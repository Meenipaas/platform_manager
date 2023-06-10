import { IsIP, IsString } from 'class-validator';

export class VirtualDto {
  @IsString()
  @IsIP()
  ip: string;
  @IsString()
  rootPassword: string;
}

export class DeleteVirtualDto {
  @IsString()
  id: string;
}

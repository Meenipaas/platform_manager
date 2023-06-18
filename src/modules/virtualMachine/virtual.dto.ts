import { IsArray, IsIP, IsOptional, IsString } from 'class-validator';

export class VirtualDto {
  @IsString()
  @IsIP()
  ip: string;
  @IsString()
  rootPassword: string;
}

export class UpdateBasicVirtualDto {
  @IsString()
  @IsIP()
  @IsOptional()
  ip?: string;

  @IsString()
  @IsOptional()
  rootPassword?: string;

  @IsString()
  id: string;
}

export class DeleteVirtualDto {
  @IsArray({})
  ids: string[];
}

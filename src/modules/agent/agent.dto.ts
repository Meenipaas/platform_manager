import { IsIP, IsNotEmpty, IsString } from 'class-validator';

export class TestConnectDTO {
  @IsString()
  @IsNotEmpty()
  ip: string;

  @IsString()
  @IsNotEmpty()
  ssh_usr: string;

  @IsString()
  @IsNotEmpty()
  ssh_password: string;
}

export class AgentDTO {
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  client_secret: string;

  @IsString()
  @IsNotEmpty()
  home_path: string;

  @IsString()
  @IsNotEmpty()
  @IsIP()
  ip: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIP()
  platform_ip: string;
  @IsString()
  @IsNotEmpty()
  ssh_password: string;
  @IsString()
  @IsNotEmpty()
  ssh_usr: string;
}

export class AgentIdDTO {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class PrepareDTO {
  @IsString()
  @IsNotEmpty()
  agent_id: string;

  @IsString()
  @IsNotEmpty()
  config: string;
}

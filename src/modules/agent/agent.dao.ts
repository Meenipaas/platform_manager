import { PaginationParam, PrismaHelper, PrismaService } from '@ddboot/prisma';
import { Injectable } from '@nestjs/common';
import { Agent, Status } from '@prisma/client';
@Injectable()
export class AgentDAO {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly prismaHelper: PrismaHelper,
  ) {}

  getAgentList(pagination: PaginationParam, keyWord?: string) {
    const containName = this.prismaHelper.likeQuery<Agent>(keyWord, 'name');
    const pageParams = this.prismaHelper.paginationParams(pagination);
    const data = this.prismaService.agent.findMany({
      ...pageParams,
      where: {
        ...containName,
      },
    });
    const count = this.prismaService.agent.count({
      where: {
        ...containName,
      },
    });
    return this.prismaService.$transaction([data, count]);
  }

  getAgentDetail(agentId: string) {
    return this.prismaService.agent.findFirst({
      where: {
        id: agentId,
      },
    });
  }

  addAgent(agent: Partial<Agent>) {
    return this.prismaService.agent.create({
      data: {
        name: agent.name,
        home_path: agent.home_path,
        ssh_usr: agent.ssh_usr,
        ssh_password: agent.ssh_password,
        status: Status.INIT,
        client_id: agent.client_id,
        client_secret: agent.client_secret,
        platform_ip: agent.platform_ip,
        ip: agent.ip,
      },
      select: {
        id: true,
      },
    });
  }

  updateAgent(agentId: string, status: Status) {
    return this.prismaService.agent.update({
      data: {
        status,
      },
      where: {
        id: agentId,
      },
    });
  }
}

import { Message, Pagination } from '@ddboot/core';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QueryParam } from '~/models/queryParam.dto';
import { AgentDTO, AgentIdDTO, PrepareDTO, TestConnectDTO } from './agent.dto';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  @Pagination()
  @Message('query agent list')
  getAgent(
    @Query() queryParam: QueryParam,
    @Query('name') name: string,
    @Query('id') id: string,
  ) {
    return this.agentService.getAgent(queryParam, name, id);
  }

  @Post('test')
  @Message('test agent connect success')
  testConnect(@Body() testAgentInfo: TestConnectDTO) {
    return this.agentService.testAgentConnected(testAgentInfo);
  }

  @Post()
  @Message('add agent info success')
  addAgent(@Body() agent: AgentDTO) {
    return this.agentService.addAgent(agent);
  }

  @Post('push-script')
  @Message('push agent success')
  pushAgent(@Body() agent: AgentIdDTO) {
    return this.agentService.pushAgent(agent);
  }

  @Post('exec-push-script')
  @Message('exec push_agent.sh successfully')
  execPushScript(@Body() agent: AgentIdDTO) {
    return this.agentService.execPushAgentScript(agent.id);
  }

  // agent/app/prepare
  @Post('app/prepare')
  prepare(@Body() prepareDTO: PrepareDTO) {
    return this.agentService.prepare('', '');
  }
}

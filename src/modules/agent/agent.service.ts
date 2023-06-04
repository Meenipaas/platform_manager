import { Status } from '@prisma/client';
import { map, concatMap, from, catchError } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { QueryParam } from '~/models/queryParam.dto';
import { AgentDAO } from './agent.dao';
import { AgentDTO, AgentIdDTO, TestConnectDTO } from './agent.dto';
import { InjectSSH } from '../ssh';
import { NodeSSH } from 'node-ssh';
import { AGENT_PORT } from './agent.constant';
import { HttpService } from '@nestjs/axios';
import { ILogger, InjectLogger, Logger } from '@ddboot/log4js';
import { ConfigService, InjectConfig } from '@ddboot/config';

@Injectable()
export class AgentService {
  private log: Logger;
  constructor(
    @InjectLogger() private readonly logger: ILogger,
    @InjectSSH() private ssh: NodeSSH,
    private readonly agentDAO: AgentDAO,
    private readonly httpService: HttpService,
    @InjectConfig() private readonly configService: ConfigService,
  ) {
    this.log = this.logger.getLogger(AgentService.name);
  }
  getAgent(queryParam: QueryParam, keyWord: string, id?: string) {
    this.log.debug('query_Param is ', queryParam);
    if (id) {
      return from(this.agentDAO.getAgentDetail(id));
    }
    return from(this.agentDAO.getAgentList(queryParam, keyWord)).pipe(
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

  testAgentConnected(testAgentInfo: TestConnectDTO) {
    this.log.debug('testAgentConnected testAgentInfo =', testAgentInfo);
    this.log.info('testAgentConnected enter');
    const sshClient = this.ssh.connect({
      host: testAgentInfo.ip,
      username: testAgentInfo.ssh_usr,
      password: testAgentInfo.ssh_password,
    });

    return from(sshClient);
  }
  addAgent(agent: AgentDTO) {
    return from(
      this.agentDAO.addAgent({
        name: agent.name,
        home_path: agent.home_path,
        ssh_usr: agent.ssh_usr,
        ssh_password: agent.ssh_password,
        client_id: agent.client_id,
        client_secret: agent.client_secret,
        platform_ip: agent.platform_ip,
        ip: agent.ip,
      }),
    ).pipe(
      map((item) => {
        return {
          agent_id: item.id,
        };
      }),
    );
  }

  pushAgent(agent: AgentIdDTO) {
    return from(this.agentDAO.updateAgent(agent.id, Status.PUSH_AGENT)).pipe(
      concatMap(() => {
        return from(this.agentDAO.getAgentDetail(agent.id)).pipe(
          concatMap((item) => {
            const sshPromise = this.ssh.connect({
              host: item.ip,
              username: item.ssh_usr,
              password: item.ssh_password,
            });
            return from(sshPromise);
          }),
          catchError((error) => {
            this.log.error('ssh connect failed', error);
            return from(
              this.agentDAO.updateAgent(agent.id, Status.PUSH_AGENT_FAILED),
            );
          }),
          concatMap(() => {
            return from(this.ssh.putFile('bin/push_agent.sh', '/tmp/'));
          }),
          catchError((error) => {
            this.log.error('ssh push failed', error);
            return from(
              this.agentDAO.updateAgent(agent.id, Status.PUSH_AGENT_FAILED),
            );
          }),
          concatMap(() => {
            return from(
              this.agentDAO.updateAgent(agent.id, Status.PUSH_AGENT_DONE),
            );
          }),
        );
      }),
    );
  }
  /**
   * 执行push_agent.sh
   * @param agentId
   * @returns
   */
  execPushAgentScript(agentId: string) {
    this.log.info('begin exec push_agent.sh');
    from(this.agentDAO.getAgentDetail(agentId))
      .pipe(
        concatMap((item) => {
          const sshPromise = this.ssh.connect({
            host: item.ip,
            username: item.ssh_usr,
            password: item.ssh_password,
          });
          return from(sshPromise).pipe(map(() => item.ip));
        }),
        concatMap((platformIP) => {
          return from(
            this.ssh.exec('bash /tmp/push_agent.sh', [
              platformIP,
              this.configService.get('port'),
            ]),
          );
        }),
      )
      .subscribe(() => {
        this.log.info('exec agent push_agent.sh done');
      });
    return {
      done: true,
    };
  }

  prepare(agentId: string, config: string) {
    this.log.info('prepare agent id is ', agentId);
    const agent = this.agentDAO.getAgentDetail(agentId);
    from(agent).pipe(
      concatMap((agentResult) => {
        const { ip } = agentResult;
        const url = `${ip}:${AGENT_PORT}/prepare`;
        return this.httpService.post(url, {
          download_url: '',
          update_url: '',
          config,
        });
      }),
    );
    throw new Error('Method not implemented.');
  }
}

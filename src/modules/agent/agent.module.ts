import { CONFIG, ConfigService } from '@ddboot/config';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentDAO } from './agent.dao';
import { AgentService } from './agent.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [CONFIG],
      useFactory(config: ConfigService) {
        const axiosConfig = (config.get('axios') as Record<string, any>) || {};
        return {
          ...axiosConfig,
          maxRedirects: 5,
          timeout: 30,
        };
      },
    }),
  ],
  providers: [AgentService, AgentDAO],
  controllers: [AgentController],
  exports: [AgentDAO],
})
export class AgentModule {}

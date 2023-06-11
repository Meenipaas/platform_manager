import { Module } from '@nestjs/common';
import { UserController } from '~/modules/user/user.controller';
import { UserService } from '~/modules/user/user.service';
import { UserDao } from '~/modules/user/user.dao';
import { JwtModule } from '@nestjs/jwt';
import { CONFIG, ConfigService } from '@ddboot/config';

@Module({
  controllers: [UserController],
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.key');
        return {
          secret,
        };
      },
      inject: [CONFIG],
    }),
  ],
  providers: [UserService, UserDao],
})
export class UserModule {}

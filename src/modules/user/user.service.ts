import { HttpStatus, Injectable } from '@nestjs/common';
import { Log4j, Logger } from '@ddboot/log4js';
import { UserDao } from '~/modules/user/user.dao';
import { concatMap, from, map } from 'rxjs';
import { Value } from '@ddboot/config';
import { comparePbkdf2, getPbkdf2 } from '@ddboot/core';
import { BaseException } from '~/exceptions';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  @Log4j()
  private logger: Logger;

  @Value('crypto.pbk')
  private pbkKey: string;

  @Value('jwt.expired')
  private jwtExpired: string;

  constructor(
    private readonly userDao: UserDao,
    private readonly jwtService: JwtService,
  ) {}

  signIn(username: string, password: string) {
    this.logger.info('begin to sign in');
    return this.userDao.getUserByName$(username).pipe(
      concatMap((user) => {
        if (!user) {
          this.logger.error('user is not founded');
          throw new BaseException('U10000', HttpStatus.UNAUTHORIZED);
        }
        return from(comparePbkdf2(password, this.pbkKey, user.password)).pipe(
          map((compareResult) => {
            if (!compareResult) {
              this.logger.error('password is wrong');
              throw new BaseException('U10001', HttpStatus.UNAUTHORIZED);
            }
            this.logger.info('sign to access token');
            return this.jwtService.sign(
              {
                username: username,
                sub: user.id,
              },
              {
                expiresIn: this.jwtExpired,
              },
            );
          }),
          map((accessToken) => {
            this.logger.info('end to sign in');
            return {
              access_token: accessToken,
            };
          }),
        );
      }),
    );
  }

  createUser(username: string, password: string) {
    return from(getPbkdf2(password, this.pbkKey)).pipe(
      concatMap((pbk) => {
        return this.userDao.createUser$(username, pbk).pipe(
          map(() => {
            return {};
          }),
        );
      }),
    );
  }
}

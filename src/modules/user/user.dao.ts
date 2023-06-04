import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ddboot/prisma';
import { from } from 'rxjs';

@Injectable()
export class UserDao {
  constructor(private readonly prismaService: PrismaService) {}

  getUserByName$(name: string) {
    return from(
      this.prismaService.user.findFirst({
        where: {
          username: name,
        },
      }),
    );
  }

  createUser$(name: string, password: string) {
    return from(
      this.prismaService.user.create({
        data: {
          username: name,
          password: password,
        },
      }),
    );
  }
}

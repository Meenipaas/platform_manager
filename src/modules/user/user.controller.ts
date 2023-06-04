import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '~/modules/user/user.service';
import { UserDto } from '~/modules/user/user.dto';
import { Message } from '@ddboot/core';
import { AuthGuard } from '~/guard/auth.guard';
import { Request, Response } from 'express';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('login')
  @Message('user login success')
  login(@Body() user: UserDto) {
    return this.userService.signIn(user.username, user.password);
  }

  @Post('register')
  @Message('user register success')
  register(@Body() user: UserDto) {
    return this.userService.createUser(user.username, user.password);
  }

  @Get('current')
  @UseGuards(AuthGuard)
  getCurrent(@Req() request: Request, @Res() res: Response) {
    const user = request['user'];
    res.json({
      username: user.username,
      code: '0000',
      message: 'get user success',
    });
  }
}

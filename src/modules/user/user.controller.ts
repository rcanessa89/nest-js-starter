import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiImplicitBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';

import { baseControllerFactory } from '@modules/base/base.controller';
import { User } from '@entities/user.entity';
import { UserService } from '@modules/user/user.service';
import { getOperationId } from '@utils/get-operation-id';
import {
  UserCreateVM,
  UserUpdateVM,
  UserVM,
  UserLogedVM,
  UserCredentialsVM,
} from '@modules/user/user.vm';
import { ApiException } from '@models/api-exception.model';
import { AUTH_GUARD_TYPE } from '@constants';
import { AuthGuard } from '@nestjs/passport';

const BaseController = baseControllerFactory<User>({
  entity: User,
  entityVm: UserVM,
  entityCreateVm: UserCreateVM,
  entityUpdateVm: UserUpdateVM,
  auth: true,
});

@Controller('user')
export class UserController extends BaseController {
  constructor(
    private readonly userService: UserService,
  ) {
    super(userService);
  }

  @Post('register')
  @ApiImplicitBody({
    name: UserCreateVM.name,
    type: UserCreateVM,
    description: 'Register data',
    required: true,
    isArray: false,
  })
  @ApiCreatedResponse({ type: UserVM })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiOperation(getOperationId(UserCreateVM.name, 'Create'))
  public async create(@Body() vm: UserCreateVM) {
    const {
      username,
      password,
    } = vm;

    let exist;

    try {
      exist = await this.userService.findOne({
        username: username.toLowerCase(),
      });
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (exist) {
      throw new HttpException(`${username} exist`, HttpStatus.BAD_REQUEST);
    }

    return this.userService.register(vm);
  }

  @Post('login')
  @ApiImplicitBody({
    name: UserCredentialsVM.name,
    type: UserCredentialsVM,
    description: 'Login credentials',
    required: true,
    isArray: false,
  })
  @ApiCreatedResponse({ type: UserLogedVM })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiOperation(getOperationId(UserCredentialsVM.name, 'Create'))
  public login(@Body() vm: UserCredentialsVM): Promise<UserLogedVM> {
    return this.userService.login(vm);
  }

  @Get('validate')
  @UseGuards(AuthGuard(AUTH_GUARD_TYPE))
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserVM })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiOperation(getOperationId(User.name, 'Validate'))
  public validate(@Req() req: Request) {
    const headerValue = req.headers.authorization;
    const token = headerValue.split(' ').pop();

    return this.userService.decodeToken(token);
  }

  @Get('confirm/:token')
  @ApiCreatedResponse({ type: UserVM })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiOperation(getOperationId(User.name, 'Confirm'))
  public async confirm(@Param('token') token: string) {
    try {
      const verification = this.userService.jwtService.verify(token);
      const user = await this.userService.getUserByJwtPayload(verification);

      if (user.confirmed) {
        throw new HttpException('User account already confirmated', HttpStatus.BAD_REQUEST);
      }

      user.confirmed = true;

      this.userService.update(user.id, user);

      return user;
    } catch (e) {
      throw new HttpException(e, HttpStatus.FORBIDDEN);
    }
  }
}

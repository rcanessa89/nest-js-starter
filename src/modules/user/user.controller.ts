import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { getBaseController } from '@modules/base/base.controller';
import { User } from '@modules/user/user.entity';
import { UserCreateVM, UserUpdateVM, UserFindVM, UserLogedVM } from '@modules/user/user.view-model';
import { UserService } from '@modules/user/user.service';

const BaseController = getBaseController<User>(User, UserCreateVM, UserUpdateVM, UserFindVM);

@Controller('user')
export class UserController extends BaseController {
  constructor(
    private readonly userService: UserService
  ) {
    super(userService);
  }

  @Post('register')
  public async create(@Body() vm: UserCreateVM): Promise<UserFindVM | any> {
    const {
      username,
      password
    } = vm;

    if (!username) {
      throw new HttpException('Username is required', HttpStatus.BAD_REQUEST);
    }

    if (!password) {
      throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
    }

    let exist;

    try {
      exist = await this.userService.findOne({
        username: username.toLowerCase()
      });
    } catch(e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (exist.length) {
      throw new HttpException(`${username} exists`, HttpStatus.BAD_REQUEST);
    }

    const newUser = await this.userService.register(vm);

    return this.userService.map<UserFindVM>(newUser);
  }

  @Post('login')
  public login(@Body() vm: UserCreateVM): Promise<UserLogedVM> {
    return this.userService.login(vm);
  }
}

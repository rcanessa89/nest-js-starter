import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { compare, genSalt, hash } from 'bcryptjs';
import { BaseService } from '@modules/base/base.service';
import { User } from '@modules/user/user.entity';
import { IJwtPayload, } from '@modules/user/user.interface';
import { UserCreateVM, UserLogedVM, UserFindVM } from '@modules/user/user.view-model';
import { PASSWORD_SALT } from '@constants';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {
    super(userRepository);
  }

  public createToken(username: string): string {
    const payload: IJwtPayload = {
      username: username.toLowerCase()
    };

    return this.jwtService.sign(payload);
  }

  public async validateUser(payload: IJwtPayload): Promise<User> {
    const filter = {
      username: payload.username.toLowerCase()
    };

    return this.findOne(filter);
  }

  public async register(data: UserCreateVM): Promise<UserFindVM> {
    const newUser = new UserCreateVM();
    const salt = await genSalt(PASSWORD_SALT);
    const newUserName = data.username.toLowerCase();
    const password = await hash(data.password, salt);

    newUser.username = newUserName;
    newUser.password = password;

    try {
      const user = await this.create(newUser);

      return await this.map<UserFindVM>(user);

    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async login(vm: UserCreateVM): Promise<UserLogedVM> {
    const username = vm.username.toLowerCase();
    const filter = { username };
    const user = await this.findOne(filter);

    if (!user) {
      throw new HttpException('Invalid username', HttpStatus.NOT_FOUND);
    }

    const isMatch = await compare(vm.password, user.password);

    if (!isMatch) {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }

    const token = this.createToken(username);
    const userVm: UserFindVM = await this.map<UserFindVM>(user);

    return {
      token,
      user: userVm,
    };
  }

  protected configureMapper(config: AutoMapperJs.IConfiguration): void {
    config
      .createMap('User', 'UserVM')
      .forSourceMember('password', opts => opts.ignore());
  }
}

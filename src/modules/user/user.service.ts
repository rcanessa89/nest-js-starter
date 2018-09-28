import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { compare, genSalt, hash } from 'bcryptjs';
import { sign as jwtSign } from 'jsonwebtoken';

import { BaseService } from '@modules/base/base.service';
import { User } from '@entities/user.entity';
import { IJwtPayload } from '@modules/user/user.interface';
import { UserCreateVM, UserLogedVM, UserVM, UserCredentialsVM } from '@modules/user/user.vm';
import { PASSWORD_SALT } from '@constants';
import { getEnvConfig } from '@utils/get-env-config';
import { Configuration } from '@enums/configuration';
import { isDev } from '@utils/is-dev';
import { EmailService } from '@services/email/email.service';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    public readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {
    super(userRepository, UserService.configureMaping);
  }

  public createToken(id: number): string {
    const payload: IJwtPayload = {
      id,
    };

    return this.jwtService.sign(payload);
  }

  public decodeToken(token: string) {
    const decoded: any = this.jwtService.decode(token, {
      complete: true,
      json: true,
    });
    const payload: IJwtPayload = decoded.payload;

    return this.getUserByJwtPayload(payload);
  }

  public async getUserByJwtPayload(payload: IJwtPayload) {
    const user = await this.findById(payload.id);

    return this.map(user);
  }

  public async register(data: UserCreateVM) {
    const salt = await genSalt(PASSWORD_SALT);
    const password = await hash(data.password, salt);
    const newUsername = data.username.toLowerCase();
    const newUser = new User();

    newUser.username = newUsername;
    newUser.password = password;

    try {
      const user = await this.create(newUser);
      const payload: IJwtPayload = { id: user.id };
      const tokenSecret = getEnvConfig(Configuration.JWT_SECRET_KEY);
      const token = jwtSign(payload, tokenSecret, { expiresIn: '3d' });

      this.sendConfirmationEmail(newUsername, token);

      return await this.map(user);

    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async login(vm: UserCredentialsVM) {
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

    if (!user.confirmed) {
      throw new HttpException('User need to be confirmated', HttpStatus.BAD_REQUEST);
    }

    const token = this.createToken(user.id);
    const userData = this.map(user)
      .then(user => {
        return {
          token,
          user: userData,
        }; 
      });

    return userData;
  }

  private sendConfirmationEmail(email: string, token: string): void {
    const subject = 'Email registration';
    const host = getEnvConfig(Configuration.HOST);
    const port = isDev() ? `:${getEnvConfig(Configuration.PORT)}` : '';
    const url = `${host}${port}/confirm/${token}`;
    const html = `<div><a href=${url}>Go to ${url}</a></div>`;

    this.emailService.send(email, subject, html);
  }

  private static configureMaping(config: AutoMapperJs.ICreateMapFluentFunctions): void {
    config
      .forSourceMember('password', opts => opts.ignore());
  }
}

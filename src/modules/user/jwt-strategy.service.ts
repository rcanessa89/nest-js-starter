import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from './user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IJwtPayload } from './user.interface';
import { getEnvConfig } from '@utils/get-env-config';
import { Configuration } from '@enums/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getEnvConfig(Configuration.JWT_SECRET_KEY),
    });
  }

  async validate(payload: IJwtPayload, done: (e: UnauthorizedException, a: any) => any) {
    const user = await this.userService.getUserByJwtPayload(payload);

    if (!user) {
      return done(new UnauthorizedException(), false);
    }

    done(null, user);
  }
}

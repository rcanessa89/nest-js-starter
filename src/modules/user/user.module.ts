import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '@modules/user/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getEnvConfig } from '@utils/get-env-config';
import { Configuration } from '@enums/configuration';
import { JwtStrategy } from '@modules/user/jwt-strategy.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secretOrPrivateKey: getEnvConfig(Configuration.JWT_SECRET_KEY),
      signOptions: {
        expiresIn: getEnvConfig(Configuration.JWT_EXPIRATION),
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [JwtStrategy],
})
export class UserModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { AppModule } from '../../app.module';
import { UserService } from './user.service';
import { getEnvConfig } from '../../utils/get-env-config';
import { Configuration } from '../../enums/configuration';

describe('UserService', () => {
  let service: UserService;
  let jwtService: JwtService;

  const user = {
    id: 1,
    user: 'rcanessa89@hotmail.com',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<UserService>(UserService);
    jwtService = new JwtService({
      secretOrPrivateKey: getEnvConfig(Configuration.JWT_SECRET_KEY),
      signOptions: {
        expiresIn: getEnvConfig(Configuration.JWT_EXPIRATION),
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Public methods', () => {
    it('createToken', () => {
      const result = jwtService.sign({ id: 1 });
      const expected = service.createToken(1);

      expect(expected).toBe(result);
    });

    it('decodeToken', async () => {
      const token = jwtService.sign({ id: 1 });
      const result = user;

      jest.spyOn(service, 'getUserByJwtPayload').mockImplementation(() => user);

      const expected = await service.decodeToken(token);

      expect(expected).toBe(result);
    });

    it('getUserByJwtPayload', async () => {
      const payload = {
        id: 1,
      };
      const result = user;
      const expected = service.getUserByJwtPayload(payload);

      expect(expected).toBe(result);
    });
  });
});

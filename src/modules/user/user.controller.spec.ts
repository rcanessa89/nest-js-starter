import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../app.module';
import { UserController } from './user.controller';

describe('User Controller', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    const controller: UserController = module.get<UserController>(UserController);

    expect(controller).toBeDefined();
  });
});

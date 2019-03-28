import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../app.module';
import { TodoController } from './todo.controller';

describe('Todo Controller', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    const controller: TodoController = module.get<TodoController>(
      TodoController,
    );

    expect(controller).toBeDefined();
  });
});

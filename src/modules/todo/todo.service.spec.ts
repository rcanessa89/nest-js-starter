import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../app.module';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

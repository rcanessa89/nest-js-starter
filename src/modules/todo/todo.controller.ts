import { Controller } from '@nestjs/common';

import { Todo } from '@entities/todo.entity';
import { baseControllerFactory } from '@base/base.controller';
import { ApiException } from '@models/api-exception.model';
import { getOperationId } from '@utils/get-operation-id';
import { TodoService } from './todo.service';
import { TodoVM } from './todo.vm';

const BaseController = baseControllerFactory<Todo, TodoVM>({
  entity: Todo,
  entityVm: TodoVM,
  auth: false,
});

@Controller('todo')
export class TodoController extends BaseController {
  constructor(
    private readonly todoService: TodoService,
  ) {
    super(todoService);
  }
}

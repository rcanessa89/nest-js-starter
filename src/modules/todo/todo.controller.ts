import { Controller } from '@nestjs/common';
import { baseControllerFactory } from '@base/base.controller';
import { TodoService } from './todo.service';
import { Todo } from '@entities/todo.entity';
import { TodoCreateVM, TodoUpdateVM, TodoFindVM } from './todo.vm';
import { ApiException } from '@models/api-exception.model';
import { getOperationId } from '@utils/get-operation-id';

const BaseController = baseControllerFactory<Todo>(
  Todo,
  TodoCreateVM,
  TodoUpdateVM,
  TodoFindVM,
  true,
);

@Controller('todo')
export class TodoController extends BaseController {
  constructor(
    private readonly todoService: TodoService,
  ) {
    super(todoService);
  }
}

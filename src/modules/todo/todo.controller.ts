import { Controller } from '@nestjs/common';
import { getBaseController } from '@base/base.controller';
import { TodoService } from './todo.service';
import { Todo } from './todo.entity';
import { TodoCreateVM, TodoUpdateVM, TodoFindVM } from './todo.view-model';
import { ApiException } from '@models/api-exception.model';
import { getOperationId } from '@utils/get-operation-id';

const BaseController = getBaseController<Todo>(Todo, TodoCreateVM, TodoUpdateVM, TodoFindVM);

@Controller('todo')
export class TodoController extends BaseController {
  constructor(
    private readonly todoService: TodoService,
  ) {
    super(todoService);
  }
}

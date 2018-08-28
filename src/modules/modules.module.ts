import { Module } from '@nestjs/common';
import { TodoModule } from './todo/todo.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [TodoModule, UserModule],
  exports: [TodoModule, UserModule],
  providers: []
})
export class ModulesModule {}

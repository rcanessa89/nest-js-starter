import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [AuthModule, TodoModule],
  exports: [AuthModule, TodoModule]
})
export class ModulesModule {}

import { Module } from '@nestjs/common';
import { ServicesModule } from './services/services.module';
import { DatabaseModule } from './database/database.module';
import { ModulesModule } from './modules/modules.module';

@Module({
  imports: [
    ServicesModule,
    DatabaseModule,
    ModulesModule,
  ],
})
export class AppModule {}

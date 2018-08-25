import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesModule } from './services/services.module';
import { DatabaseModule } from './database/database.module';
import { ModulesModule } from './modules/modules.module';

@Module({
  imports: [ServicesModule, DatabaseModule, ModulesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

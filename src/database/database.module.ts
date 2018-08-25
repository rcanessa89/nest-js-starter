import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationService } from './configuration/configuration.service';
import { DB_TYPE } from '@constants';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: DB_TYPE,
      host: ConfigurationService.host,
      port: ConfigurationService.port,
      username: ConfigurationService.username,
      password: ConfigurationService.password,
      database: ConfigurationService.dbName,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ConfigurationService,
  ],
  exports: [ConfigurationService],
})
export class DatabaseModule {}

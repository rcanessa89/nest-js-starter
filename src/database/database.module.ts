import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationService } from './configuration/configuration.service';
import { DB_TYPE } from '@constants';
import { isDev } from '@utils/is-dev';

const isDevEnv = isDev();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: DB_TYPE,
      host: ConfigurationService.host,
      port: ConfigurationService.port,
      username: ConfigurationService.username,
      password: ConfigurationService.password,
      database: ConfigurationService.dbName,
      entities: [
        __dirname + '/entities/**/*.entity{.ts,.js}',
        __dirname + '/../modules/**/*.entity{.ts,.js}',
      ],
      migrations: [
        __dirname + '/migrations/**/*.{.ts,.js}',
      ],
      migrationsRun: !isDevEnv,
      synchronize: isDevEnv,
    }),
    ConfigurationService,
  ],
  exports: [ConfigurationService],
})
export class DatabaseModule {}

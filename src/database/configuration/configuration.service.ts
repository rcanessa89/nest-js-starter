import { Injectable } from '@nestjs/common';
import { Configuration } from '@enums/configuration';
import { get } from 'config';

@Injectable()
export class ConfigurationService {
  static port: number;
  static host: string = process.env[Configuration.DB_HOST] || get(Configuration.DB_HOST);
  static username: string = process.env[Configuration.DB_USERNAME] || get(Configuration.DB_USERNAME);
  static password: string = process.env[Configuration.DB_PASSWORD] || get(Configuration.DB_PASSWORD);
  static dbName: string = process.env[Configuration.DB_NAME] || get(Configuration.DB_NAME);

  constructor() {
    const portParam: string | number = process.env[Configuration.DB_PORT] || get(Configuration.DB_PORT);

    ConfigurationService.port = ConfigurationService.normalizePort(portParam);
  }

  private static normalizePort(param: string | number): number {
    return Number(param);
  }
}

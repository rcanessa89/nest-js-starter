import { Injectable } from '@nestjs/common';

import { Configuration } from '@enums/configuration';
import { getEnvConfig } from '@utils/get-env-config';

@Injectable()
export class ConfigurationService {
  static port: number;
  static host: string = getEnvConfig(Configuration.DB_HOST);
  static username: string = getEnvConfig(Configuration.DB_USERNAME);
  static password: string = getEnvConfig(Configuration.DB_PASSWORD);
  static dbName: string = getEnvConfig(Configuration.DB_NAME);

  constructor() {
    const portParam: string | number = getEnvConfig(Configuration.DB_PORT);

    ConfigurationService.port = ConfigurationService.normalizePort(portParam);
  }

  private static normalizePort(param: string | number): number {
    return Number(param);
  }
}

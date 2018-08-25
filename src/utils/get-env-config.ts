import { get } from 'config';
import { Configuration } from '@enums/configuration';

export const getEnvConfig = (name: Configuration): string =>
  process.env[name] || get(name);

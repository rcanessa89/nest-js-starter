import { get, util } from 'config';
import { Configuration } from '@enums/configuration';

export const getEnvConfig = (name: Configuration): string => {
  if (process.env.NODE_ENV === 'test') {
    return util.toObject()[name];
  }

  return process.env[name] || get(name);
};

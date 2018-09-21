import { getEnvConfig } from '@utils/get-env-config';
import { Configuration } from '@enums/configuration';

export const mailerConfig = {
  transport: {
    service: 'gmail',
    auth: {
      user: getEnvConfig(Configuration.EMAIL_USER),
      pass: getEnvConfig(Configuration.EMAIL_PASSWORD),
    },
  },
};

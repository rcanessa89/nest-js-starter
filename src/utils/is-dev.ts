import { ENVIRONMENT } from '../app.constants';

export const isDev = (): boolean => ENVIRONMENT === 'development';

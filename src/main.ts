import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getEnvConfig } from '@utils/get-env-config';
import { isDev } from '@utils/is-dev';
import { Configuration } from '@enums/configuration';
import { setSwaggerConfiguration } from './swagger-config';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setSwaggerConfiguration(app);

  if (isDev()) {
    app.enableCors();
  }

  app.setGlobalPrefix('api');

  await app.listen(getEnvConfig(Configuration.PORT));
}

bootstrap();

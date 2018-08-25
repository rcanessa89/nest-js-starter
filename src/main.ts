import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getEnvConfig } from '@utils/get-env-config';
import { Configuration } from '@enums/configuration';
import { setSwaggerConfiguration } from './swagger-config';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setSwaggerConfiguration(app);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  app.setGlobalPrefix('api');

  await app.listen(getEnvConfig(Configuration.PORT));
}

bootstrap();

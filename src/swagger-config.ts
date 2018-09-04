import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { isDev } from '@utils/is-dev';
import { getEnvConfig } from '@utils/get-env-config';
import { Configuration } from '@enums/configuration';
import { INestExpressApplication, INestApplication } from '@nestjs/common';

export const setSwaggerConfiguration = (app: INestApplication & INestExpressApplication): void => {
  const host = getEnvConfig(Configuration.HOST);
  const port = getEnvConfig(Configuration.PORT);
  const dev = isDev();
  const hostDomain = dev ? `${host}:${port}` : host;
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Nest JS')
    .setDescription('API Documentation')
    .setVersion('1.0.0')
    .setHost(hostDomain.split('//')[1])
    .setSchemes(dev ? 'http' : 'https')
    .setBasePath('/api')
    .addBearerAuth('Authorization', 'header')
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerOptions);

  app.use('/api/docs/swagger.json', (req, res) => {
    res.send(swaggerDoc);
  });

  SwaggerModule.setup('/api/docs', app, null, {
    swaggerUrl: `${hostDomain}/api/docs/swagger.json`,
    explorer: true,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  });
};

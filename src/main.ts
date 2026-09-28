import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.ts';
import { Logger } from '@nestjs/common';
import { envs } from './config/envs.ts';
import { GrpcExceptionFilter } from './common/index.ts';

async function bootstrap() {

  const logger = new Logger(`Main-Gateway`)

  const app = await NestFactory.create(AppModule, {});
  app.setGlobalPrefix('api');

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GrpcExceptionFilter(httpAdapter));

  await app.listen(envs.port);
  logger.log(`App running in port ${envs.port}`)
}
await bootstrap();

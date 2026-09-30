import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function demarrer() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:4200'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // retire les champs inconnus
      forbidNonWhitelisted: true, // les refuse avec une erreur 400
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('RH Taskflow API')
    .setDescription('Gestion de tâches avec workflow de validation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}
demarrer();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Inicializa y arranca la aplicación NestJS.
 *
 * Realiza las siguientes tareas:
 * - Crea la instancia de la app a partir de AppModule.
 * - Registra ClassSerializerInterceptor de forma global para respetar los decoradores de class-transformer en las respuestas.
 * - Define un prefijo global de rutas desde la variable de entorno API_PREFIX (por defecto, 'api').
 * - Habilita CORS limitando el origen a CORS_ORIGIN y los métodos a GET, POST, PUT y DELETE.
 * - Configura ValidationPipe global con:
 *   - whitelist: elimina propiedades que no estén definidas en los DTOs.
 *   - forbidNonWhitelisted: lanza un error si el payload incluye propiedades no permitidas.
 *   - transform: convierte automáticamente los tipos a los esperados por los DTOs/controladores.
 * - Inicia el servidor HTTP en el puerto definido por PORT (por defecto, 3000).
 *
 * Comentario explicativo para esta línea:
 * - app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))):
 *   Aplica un interceptor global que serializa las respuestas utilizando los metadatos de Class-Transformer
 *   (por ejemplo, @Exclude, @Expose), resolviendo dichos metadatos mediante Reflector.
 *
 * @remarks
 * - Si CORS_ORIGIN no está definido, es posible que el navegador bloquee solicitudes por política CORS.
 *   Asegúrate de configurarlo adecuadamente en los entornos necesarios.
 *
 * @returns Una promesa que se resuelve cuando el servidor está escuchando conexiones.
 * @throws Puede lanzar errores si falla la creación de la aplicación o el arranque del servidor.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');
  app.enableCors({
    origin: [process.env.CORS_ORIGIN],
    methods: 'GET,POST,PUT,DELETE',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en DTOs
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no definidas
      transform: true, // Convierte tipos automáticamente
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envValidationSchema } from './config/env.validation';
import { UserModule } from './user/user.module';
import { typeOrmConfig } from './config/typeorm.config';
import { typeOrmNewSistemasConfig } from './config/typeorm-new-sistemas.config';
import { RolModule } from './rol/rol.module';
import { PermisoModule } from './permiso/permiso.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { SubtipoModule } from './subtipo/subtipo.module';
import { TipoModule } from './tipo/tipo.module';
import { ArchivoModule } from './archivo/archivo.module';
import { TicketModule } from './ticket/ticket.module';
import { ComentarioModule } from './comentario/comentario.module';
import { ExternalModule } from './external/external.module';
import { CommandsModule } from './commands/commands.module';

/**
 * Módulo principal de la aplicación
 * 
 * Configura e importa todos los módulos necesarios:
 * - Configuración de variables de entorno
 * - Conexión a base de datos principal con TypeORM
 * - Conexión de solo lectura a external systems
 * - Módulos de funcionalidad (User, Rol, Permiso, etc.)
 * - Módulo común con sistema de permisos
 * - Módulo external para migración de datos externos
 * - Módulo de comandos CLI
 */

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema.unknown(true), // 👉 permite variables extra
      validationOptions: {
        allowUnknown: true, // Permitir variables no definidas en el schema
        abortEarly: true,    // Parar en el primer error
      },
    }),
    // Conexión principal a la base de datos
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: any) => typeOrmConfig(configService),
      imports: [ConfigModule],
    }),
    // Conexión de solo lectura a new_sistemas
    TypeOrmModule.forRootAsync({
      name: 'newSistemasConnection',
      inject: [ConfigService],
      useFactory: (configService: any) => typeOrmNewSistemasConfig(configService),
      imports: [ConfigModule],
    }),
    UserModule,
    RolModule,
    PermisoModule,
    CommonModule,
    AuthModule,
    SubtipoModule,
    TipoModule,
    ArchivoModule,
    TicketModule,
    ComentarioModule,
    ExternalModule, // Módulo para migración de datos externos
    CommandsModule, // Módulo para comandos CLI
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

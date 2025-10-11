import { Module } from '@nestjs/common';
import { MigrateTicketsCommand } from './migrate-tickets.command';
import { ExternalModule } from '../external/external.module';

/**
 * Módulo para comandos de consola
 * 
 * Centraliza todos los comandos CLI de la aplicación
 */
@Module({
    imports: [ExternalModule], // Importar para acceder al MigrationService
    providers: [MigrateTicketsCommand],
    exports: [MigrateTicketsCommand],
})
export class CommandsModule { }
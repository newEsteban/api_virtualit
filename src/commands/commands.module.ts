import { Module } from '@nestjs/common';
import { MigrateTicketsCommand } from './migrate-tickets.command';
import { GestionCobancModule } from '../external/gestion-cobanc.module';

/**
 * Módulo para comandos de consola
 * 
 * Centraliza todos los comandos CLI de la aplicación
 */
@Module({
    imports: [GestionCobancModule], // Importar para acceder al GestionCobancMigrationService
    providers: [MigrateTicketsCommand],
    exports: [MigrateTicketsCommand],
})
export class CommandsModule { }
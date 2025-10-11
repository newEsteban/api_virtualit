import { Command, CommandRunner, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { MigrationService } from '../external/services/migration.service';

interface MigrateTicketsOptions {
    fechaDesde?: string;
    fechaHasta?: string;
    estado?: string;
    ticketId?: number;
    stats?: boolean;
    dryRun?: boolean;
}

@Command({
    name: 'migrate-tickets',
    description: 'Migra tickets desde la tabla tbl_tickets_news (gestion_coban) a la tabla ticket local',
})
export class MigrateTicketsCommand extends CommandRunner {
    private readonly logger = new Logger(MigrateTicketsCommand.name);

    constructor(private readonly migrationService: MigrationService) {
        super();
    }

    async run(passedParams: string[], options?: MigrateTicketsOptions): Promise<void> {
        try {
            this.logger.log('🚀 Iniciando comando de migración de tickets...');

            // Si se solicitan solo estadísticas
            if (options?.stats) {
                await this.showStats();
                return;
            }

            // Construir condiciones de filtrado
            const conditions: any = {};
            
            if (options?.fechaDesde) {
                conditions.fechaDesde = new Date(options.fechaDesde);
                this.logger.log(`📅 Filtro fecha desde: ${options.fechaDesde}`);
            }

            if (options?.fechaHasta) {
                conditions.fechaHasta = new Date(options.fechaHasta);
                this.logger.log(`📅 Filtro fecha hasta: ${options.fechaHasta}`);
            }

            if (options?.estado) {
                conditions.estado = options.estado;
                this.logger.log(`🏷️ Filtro estado: ${options.estado}`);
            }

            if (options?.ticketId) {
                conditions.ticketId = options.ticketId;
                this.logger.log(`🎫 Filtro ticket ID: ${options.ticketId}`);
            }

            // Modo dry-run (solo mostrar lo que se haría)
            if (options?.dryRun) {
                this.logger.log('🔍 Modo DRY-RUN: Solo mostrando lo que se migraría...');
                await this.showStats();
                this.logger.log('✅ Dry-run completado. Usa --no-dry-run para ejecutar la migración real.');
                return;
            }

            // Ejecutar migración
            const migratedCount = await this.migrationService.migrateTicketsFromGestionCoban(conditions);
            
            this.logger.log(`✅ Migración completada exitosamente!`);
            this.logger.log(`📊 Total de tickets migrados: ${migratedCount}`);

            // Mostrar estadísticas finales
            await this.showStats();

        } catch (error) {
            this.logger.error('❌ Error durante la migración:', error.message);
            throw error;
        }
    }

    @Option({
        flags: '-fd, --fecha-desde <fecha>',
        description: 'Fecha desde para filtrar tickets (formato: YYYY-MM-DD)',
    })
    parseFechaDesde(val: string): string {
        return val;
    }

    @Option({
        flags: '-fh, --fecha-hasta <fecha>',
        description: 'Fecha hasta para filtrar tickets (formato: YYYY-MM-DD)',
    })
    parseFechaHasta(val: string): string {
        return val;
    }

    @Option({
        flags: '-e, --estado <estado>',
        description: 'Estado específico para filtrar tickets',
    })
    parseEstado(val: string): string {
        return val;
    }

    @Option({
        flags: '-t, --ticket-id <id>',
        description: 'ID específico de ticket para migrar',
    })
    parseTicketId(val: string): number {
        return parseInt(val, 10);
    }

    @Option({
        flags: '-s, --stats',
        description: 'Mostrar solo estadísticas sin ejecutar migración',
    })
    parseStats(): boolean {
        return true;
    }

    @Option({
        flags: '--dry-run',
        description: 'Ejecutar en modo prueba (no realiza cambios)',
        defaultValue: true,
    })
    parseDryRun(): boolean {
        return true;
    }

    @Option({
        flags: '--no-dry-run',
        description: 'Ejecutar migración real (realiza cambios en la base de datos)',
    })
    parseNoDryRun(): boolean {
        return false;
    }

    private async showStats(): Promise<void> {
        try {
            const stats = await this.migrationService.getMigrationStats();
            
            this.logger.log('📊 === ESTADÍSTICAS DE MIGRACIÓN ===');
            this.logger.log(`📋 Total tickets en gestion_coban: ${stats.totalGestionCoban}`);
            this.logger.log(`🎫 Total tickets en tabla local: ${stats.totalTicketsLocal}`);
            this.logger.log(`🔗 Tickets con referencia externa: ${stats.ticketsConReferencia}`);
            this.logger.log(`⏳ Tickets pendientes de migrar: ${stats.ticketsSinMigrar}`);
            this.logger.log('=====================================');
        } catch (error) {
            this.logger.error('Error obteniendo estadísticas:', error.message);
        }
    }
}

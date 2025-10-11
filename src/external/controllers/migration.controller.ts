import { Controller, Post, Get, Query, Logger } from '@nestjs/common';
import { MigrationService } from '../services/migration.service';

@Controller('migration')
export class MigrationController {
    private readonly logger = new Logger(MigrationController.name);

    constructor(private readonly migrationService: MigrationService) {}

    /**
     * Ejecuta la migración de tickets desde gestion_coban a la tabla local
     * GET /migration/tickets?fechaDesde=2024-01-01&fechaHasta=2024-12-31&estado=activo&ticketId=123
     */
    @Post('tickets')
    async migrateTickets(
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
        @Query('estado') estado?: string,
        @Query('ticketId') ticketId?: string,
    ) {
        try {
            this.logger.log('Iniciando migración de tickets...');

            const conditions: any = {};
            
            if (fechaDesde) {
                conditions.fechaDesde = new Date(fechaDesde);
            }

            if (fechaHasta) {
                conditions.fechaHasta = new Date(fechaHasta);
            }

            if (estado) {
                conditions.estado = estado;
            }

            if (ticketId) {
                conditions.ticketId = parseInt(ticketId, 10);
            }

            const migratedCount = await this.migrationService.migrateTicketsFromGestionCoban(conditions);
            
            return {
                success: true,
                message: 'Migración completada exitosamente',
                migratedCount,
                conditions
            };

        } catch (error) {
            this.logger.error('Error durante la migración:', error.message);
            return {
                success: false,
                message: 'Error durante la migración',
                error: error.message
            };
        }
    }

    /**
     * Obtiene estadísticas de la migración
     * GET /migration/stats
     */
    @Get('stats')
    async getStats() {
        try {
            const stats = await this.migrationService.getMigrationStats();
            
            return {
                success: true,
                stats,
                message: 'Estadísticas obtenidas exitosamente'
            };

        } catch (error) {
            this.logger.error('Error obteniendo estadísticas:', error.message);
            return {
                success: false,
                message: 'Error obteniendo estadísticas',
                error: error.message
            };
        }
    }

    /**
     * Vista previa de los datos que se migrarían (sin ejecutar la migración)
     * GET /migration/preview?fechaDesde=2024-01-01&limit=10
     */
    @Get('preview')
    async previewMigration(
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
        @Query('estado') estado?: string,
        @Query('limit') limit?: string,
    ) {
        try {
            // Esta funcionalidad requerirá un método adicional en el servicio
            return {
                success: true,
                message: 'Vista previa - funcionalidad en desarrollo',
                note: 'Usa GET /migration/stats para ver estadísticas generales'
            };

        } catch (error) {
            this.logger.error('Error en vista previa:', error.message);
            return {
                success: false,
                message: 'Error en vista previa',
                error: error.message
            };
        }
    }
}

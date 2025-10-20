import { Controller, Post, Get, Query, Logger, UseGuards, HttpException, HttpStatus, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GestionCobancMigrationService } from '../services/gestion-cobanc-migration.service';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { MigrateOneTicketDto } from '../dtos/local-general.dto';

@Controller('migration')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class MigrationController {
    private readonly logger = new Logger(MigrationController.name);

    constructor(private readonly gestionCobancMigrationService: GestionCobancMigrationService) { }

    /**
     * Ejecuta la migración de tickets desde gestion_coban a la tabla local
     * GET /migration/tickets?fechaDesde=2024-01-01&fechaHasta=2024-12-31&estado=activo&ticketId=123
     */
    @Post('take-one-ticket')
    async takeOneTicketMigration(
        @Body() body : MigrateOneTicketDto
    ) {
        try {
            this.logger.log('Iniciando migración de un solo ticket...');

            const ticket = await this.gestionCobancMigrationService.migrateOneTicket(body.ticketId);

            return {
                success: true,
                message: 'Migración de un solo ticket completada exitosamente',
                ticket,
            };

        } catch (error) {
            this.logger.error('Error durante la migración de un solo ticket:', error.message);
            // Lanzar excepción HTTP en lugar de retornar error
            throw new HttpException({
                    success: false,
                    message: 'Error durante la migración',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('update-one-ticket')
    async updateOneTicketMigration(
        @Body() body: MigrateOneTicketDto
    ) {
        try {
            this.logger.log('Iniciando actualización de un solo ticket...');

            const ticket = await this.gestionCobancMigrationService.updateOneTicket(body.ticketId, body.updateData);

            return {
                success: true,
                message: 'Actualización de un solo ticket completada exitosamente',
                ticket,
            };

        } catch (error) {
            this.logger.error('Error durante la actualización de un solo ticket:', error.message);
            // Lanzar excepción HTTP en lugar de retornar error
            throw new HttpException({
                    success: false,
                    message: 'Error durante la actualización',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * 
     * TODO: implentar permisos para todas las rutas de migración
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

            const migratedCount = await this.gestionCobancMigrationService.migrateTicketsFromGestionCoban(conditions);

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
            const stats = await this.gestionCobancMigrationService.getMigrationStats();

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

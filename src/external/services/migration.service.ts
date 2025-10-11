import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GestionCoban } from '../entities/gestion-coban.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';

@Injectable()
export class MigrationService {
    private readonly logger = new Logger(MigrationService.name);

    constructor(
        @InjectRepository(GestionCoban, 'newSistemasConnection')
        private readonly gestionCobanRepository: Repository<GestionCoban>,
        
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
    ) {}

    /**
     * Migra los datos de tbl_tickets_news (gestion_coban) a la tabla ticket local
     * @param conditions Condiciones opcionales para filtrar los datos
     * @returns Número de registros migrados
     */
    async migrateTicketsFromGestionCoban(conditions: any = {}): Promise<number> {
        try {
            this.logger.log('Iniciando migración de tickets desde gestion_coban...');

            // Construir query con condiciones
            const queryBuilder = this.gestionCobanRepository.createQueryBuilder('gc');
            
            // Aplicar condiciones si las hay
            if (conditions.fechaDesde) {
                queryBuilder.andWhere('gc.fecha_creacion >= :fechaDesde', { 
                    fechaDesde: conditions.fechaDesde 
                });
            }
            
            if (conditions.fechaHasta) {
                queryBuilder.andWhere('gc.fecha_creacion <= :fechaHasta', { 
                    fechaHasta: conditions.fechaHasta 
                });
            }
            
            if (conditions.estado) {
                queryBuilder.andWhere('gc.estado = :estado', { 
                    estado: conditions.estado 
                });
            }

            if (conditions.ticketId) {
                queryBuilder.andWhere('gc.ticket_id = :ticketId', { 
                    ticketId: conditions.ticketId 
                });
            }

            // Excluir tickets que ya existen en la tabla local
            queryBuilder.andWhere(
                'gc.ticket_id NOT IN (SELECT COALESCE(ticket_new_id, 0) FROM ticket WHERE ticket_new_id IS NOT NULL)'
            );

            const gestionCobanTickets = await queryBuilder.getMany();
            
            this.logger.log(`Encontrados ${gestionCobanTickets.length} tickets para migrar`);

            let migratedCount = 0;

            for (const gcTicket of gestionCobanTickets) {
                try {
                    // Verificar si el ticket ya existe en la tabla local
                    const existingTicket = await this.ticketRepository.findOne({
                        where: { ticket_new_id: gcTicket.ticket_id }
                    });

                    if (!existingTicket) {
                        // Crear nuevo ticket
                        const newTicket = this.ticketRepository.create({
                            ticket_new_id: gcTicket.ticket_id,
                            descripcion: gcTicket.descripcion || 'Sin descripción',
                            url_ticket_new: gcTicket.url_ticket,
                        });

                        await this.ticketRepository.save(newTicket);
                        migratedCount++;
                        
                        this.logger.debug(`Migrado ticket ID: ${gcTicket.ticket_id}`);
                    } else {
                        this.logger.debug(`Ticket ID: ${gcTicket.ticket_id} ya existe, omitiendo`);
                    }
                } catch (error) {
                    this.logger.error(`Error migrando ticket ID: ${gcTicket.ticket_id}`, error.message);
                }
            }

            this.logger.log(`Migración completada. ${migratedCount} tickets migrados exitosamente`);
            return migratedCount;

        } catch (error) {
            this.logger.error('Error durante la migración', error.message);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de la migración
     */
    async getMigrationStats(): Promise<{
        totalGestionCoban: number;
        totalTicketsLocal: number;
        ticketsConReferencia: number;
        ticketsSinMigrar: number;
    }> {
        const totalGestionCoban = await this.gestionCobanRepository.count();
        const totalTicketsLocal = await this.ticketRepository.count();
        
        // Contar tickets con referencia (ticket_new_id no nulo)
        const ticketsConReferencia = await this.ticketRepository
            .createQueryBuilder('t')
            .where('t.ticket_new_id IS NOT NULL')
            .getCount();

        const ticketsSinMigrar = totalGestionCoban - ticketsConReferencia;

        return {
            totalGestionCoban,
            totalTicketsLocal,
            ticketsConReferencia,
            ticketsSinMigrar
        };
    }
}

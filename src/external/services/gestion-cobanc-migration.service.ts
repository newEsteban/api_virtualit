import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TblTicketsNews } from '../entities/tbl-tickets-news.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';

@Injectable()
export class GestionCobancMigrationService {
    private readonly logger = new Logger(GestionCobancMigrationService.name);
    private readonly isNewSistemasEnabled: boolean;

    constructor(
        @Optional()
        @InjectRepository(TblTicketsNews, 'newSistemasConnection')
        private readonly tblTicketsNewsRepository: Repository<TblTicketsNews>,

        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,

        private readonly configService: ConfigService,
    ) {
        this.isNewSistemasEnabled = this.configService.get<boolean>('NEW_SISTEMAS_ENABLED', false);

        if (!this.isNewSistemasEnabled) {
            this.logger.warn('🔒 Conexión a new_sistemas deshabilitada (NEW_SISTEMAS_ENABLED=false)');
        } else {
            this.logger.log('🔓 Conexión a new_sistemas habilitada');
        }
    }

    /**
     * Verificar si la conexión a new_sistemas está disponible
     */
    private checkNewSistemasConnection(): void {
        if (!this.isNewSistemasEnabled) {
            throw new Error(
                '🔒 Conexión a new_sistemas deshabilitada. ' +
                'Para usar la migración, configura NEW_SISTEMAS_ENABLED=true en el archivo .env ' +
                'y asegúrate de estar conectado a la red empresarial.'
            );
        }

        if (!this.tblTicketsNewsRepository) {
            throw new Error(
                '❌ Repositorio de TblTicketsNews no disponible. ' +
                'Verifica la configuración de la base de datos externa.'
            );
        }
    }

    /**
     * Migra los datos de tbl_tickets_news (gestion_coban) a la tabla ticket local
     * @param conditions Condiciones opcionales para filtrar los datos
     * @returns Número de registros migrados
     */
    async migrateTicketsFromGestionCoban(conditions: any = {}): Promise<number> {
        try {
            this.checkNewSistemasConnection();

            this.logger.log('🚀 Iniciando migración de tickets desde gestion_coban...');

            // Construir query con condiciones
            const queryBuilder = this.tblTicketsNewsRepository.createQueryBuilder('tn');

            // Aplicar condiciones si las hay
            if (conditions.fechaDesde) {
                queryBuilder.andWhere('tn.created_at >= :fechaDesde', {
                    fechaDesde: conditions.fechaDesde
                });
            }

            if (conditions.fechaHasta) {
                queryBuilder.andWhere('tn.created_at <= :fechaHasta', {
                    fechaHasta: conditions.fechaHasta
                });
            }

            if (conditions.estado) {
                queryBuilder.andWhere('tn.id_estado = :estado', {
                    estado: conditions.estado
                });
            }

            if (conditions.ticketId) {
                queryBuilder.andWhere('tn.id = :ticketId', {
                    ticketId: conditions.ticketId
                });
            }

            // Excluir tickets que ya existen en la tabla local
            queryBuilder.andWhere(
                'tn.id NOT IN (SELECT COALESCE(ticket_new_id, 0) FROM ticket WHERE ticket_new_id IS NOT NULL)'
            );

            const tblTicketsNewsRecords = await queryBuilder.getMany();

            this.logger.log(`📋 Encontrados ${tblTicketsNewsRecords.length} tickets para migrar`);

            let migratedCount = 0;

            for (const ticketRecord of tblTicketsNewsRecords) {
                try {
                    // Verificar si el ticket ya existe en la tabla local
                    const existingTicket = await this.ticketRepository.findOne({
                        where: { ticket_new_id: ticketRecord.id }
                    });

                    if (!existingTicket) {
                        // Crear nuevo ticket
                        const newTicket = this.ticketRepository.create({
                            ticket_new_id: ticketRecord.id,
                            descripcion: ticketRecord.descripcion || 'Sin descripción',
                            titulo: ticketRecord.titulo,
                            // Mapear más campos según sea necesario
                        });

                        await this.ticketRepository.save(newTicket);
                        migratedCount++;

                        this.logger.debug(`✅ Migrado ticket ID: ${ticketRecord.id}`);
                    } else {
                        this.logger.debug(`⏭️ Ticket ID: ${ticketRecord.id} ya existe, omitiendo`);
                    }
                } catch (error) {
                    this.logger.error(`❌ Error migrando ticket ID: ${ticketRecord.id}`, error.message);
                }
            }

            this.logger.log(`✅ Migración completada. ${migratedCount} tickets migrados exitosamente`);
            return migratedCount;

        } catch (error) {
            this.logger.error('❌ Error durante la migración:', error.message);
            throw error;
        }
    }

    /**
     * Migra un solo ticket específico desde gestion_coban a la tabla local
     * @param ticketId ID del ticket a migrar
     * @returns Datos del ticket migrado o información sobre su estado
     */
    async migrateOneTicket(ticketId: number): Promise<{
        ticketId: number;
        status: 'migrated' | 'already_exists' | 'not_found';
        message: string;
        data?: any;
    }> {
        try {
            this.checkNewSistemasConnection();

            this.logger.log(`🎯 Iniciando migración del ticket ID: ${ticketId}`);

            // Buscar el ticket específico en la base de datos externa
            const ticketRecord = await this.tblTicketsNewsRepository.findOne({
                where: { id: ticketId }
            });

            if (!ticketRecord) {
                this.logger.warn(`⚠️ Ticket ID: ${ticketId} no encontrado en gestion_coban`);
                return {
                    ticketId,
                    status: 'not_found',
                    message: `Ticket con ID ${ticketId} no existe en la base de datos externa`
                };
            }

            // Verificar si el ticket ya existe en la tabla local
            const existingTicket = await this.ticketRepository.findOne({
                where: { ticket_new_id: ticketRecord.id }
            });

            if (existingTicket) {
                this.logger.warn(`⏭️ Ticket ID: ${ticketId} ya existe en la base de datos local`);
                return {
                    ticketId,
                    status: 'already_exists',
                    message: `Ticket con ID ${ticketId} ya fue migrado previamente`,
                    data: {
                        localTicketId: existingTicket.id,
                        migratedAt: existingTicket.created_at
                    }
                };
            }

            // Migrar el ticket
            const newTicket = this.ticketRepository.create({
                ticket_new_id: ticketRecord.id,
                descripcion: ticketRecord.descripcion || 'Sin descripción',
                titulo: ticketRecord.titulo,
                id_estado: ticketRecord.id_estado,
                fecha_estimada: ticketRecord.fecha_estimada,
                fecha_clasificacion: ticketRecord.fecha_clasificacion,
                numero_issue: ticketRecord.numero_issue,
            });

            const savedTicket = await this.ticketRepository.save(newTicket);

            this.logger.log(`✅ Ticket ID: ${ticketId} migrado exitosamente como ID local: ${savedTicket.id}`);

            return {
                ticketId,
                status: 'migrated',
                message: `Ticket migrado exitosamente`,
                data: {
                    localTicketId: savedTicket.id,
                    originalData: {
                        id: ticketRecord.id,
                        titulo: ticketRecord.titulo,
                        descripcion: ticketRecord.descripcion?.substring(0, 100) + (ticketRecord.descripcion?.length > 100 ? '...' : ''),
                        id_estado: ticketRecord.id_estado,
                        numero_issue: ticketRecord.numero_issue,
                        created_at: ticketRecord.created_at
                    },
                    migratedAt: savedTicket.created_at
                }
            };

        } catch (error) {
            this.logger.error(`❌ Error migrando ticket ID: ${ticketId}`, error.message);
            throw new Error(`Error al migrar ticket ${ticketId}: ${error.message}`);
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
        newSistemasEnabled: boolean;
    }> {
        try {
            const totalTicketsLocal = await this.ticketRepository.count();

            if (!this.isNewSistemasEnabled) {
                this.logger.warn('🔒 Estadísticas limitadas: conexión a new_sistemas deshabilitada');

                const ticketsConReferencia = await this.ticketRepository
                    .createQueryBuilder('t')
                    .where('t.ticket_new_id IS NOT NULL')
                    .getCount();

                return {
                    totalGestionCoban: 0,
                    totalTicketsLocal,
                    ticketsConReferencia,
                    ticketsSinMigrar: 0,
                    newSistemasEnabled: false,
                };
            }

            this.checkNewSistemasConnection();

            const totalGestionCoban = await this.tblTicketsNewsRepository.count();

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
                ticketsSinMigrar,
                newSistemasEnabled: true,
            };
        } catch (error) {
            this.logger.error('❌ Error obteniendo estadísticas:', error.message);
            throw error;
        }
    }
}

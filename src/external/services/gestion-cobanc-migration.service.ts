import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TblTicketsNews } from '../entities/tbl-tickets-news.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { CobancSubtipoMigrationService } from './cobanc-subtipo-migration.service';

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
        private readonly cobancSubtipoMigrationService: CobancSubtipoMigrationService,
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
            const existingTicket = await this.findTicketLocalByGestionCobanId(ticketRecord.id);

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

            // validamos la existencia del estado/subtipo del ticket antes de migrar
            const estado = await this.cobancSubtipoMigrationService.checkEstadoExists(ticketRecord.id_estado);
            if (!estado) {
                // Consultammos en la base de datos externa por el id del estado/subtipo para optener el tipo_id
                const estadoCobanc = await this.cobancSubtipoMigrationService.getSubTipoByCobancId(ticketRecord.id_estado);
                if (!estadoCobanc) {
                    this.logger.warn(`⚠️ El estado/subtipo con ID: ${ticketRecord.id_estado} no existe en gestion_coban`);
                    throw new Error(`El estado/subtipo con ID: ${ticketRecord.id_estado} no existe en gestion_coban`);
                }

                this.logger.log(`El estado/subtipo con ID: ${ticketRecord.id_estado} no existe localmente. Creando subtipo...`);
                await this.cobancSubtipoMigrationService.migrateSubtipos({ tipo_id: estadoCobanc.id_tipo });
                this.logger.log(`✅ Subtipo con ID: ${ticketRecord.id_estado} creado exitosamente.`);
            }

            // Migrar el ticket usando la función reutilizable
            const savedTicket = await this.createTicketFromExternal(ticketRecord);

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

    async updateOneTicket(ticketId: number): Promise<Ticket> {
        try {
            this.checkNewSistemasConnection();

            this.logger.log(`🔄 Iniciando actualización del ticket ID: ${ticketId}`);

            const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });

            if (!ticket) {
                this.logger.warn(`⚠️ Ticket ID: ${ticketId} no encontrado en la base de datos local`);
                throw new Error(`Ticket con ID ${ticketId} no existe en la base de datos local`);
            }

            const ticketRecord = await this.tblTicketsNewsRepository.findOne({ where: { id: ticket.ticket_new_id } });

            if (!ticketRecord) {
                this.logger.warn(`⚠️ Ticket externo ID: ${ticket.ticket_new_id} no encontrado en gestion_coban`);
                throw new Error(`Ticket externo con ID ${ticket.ticket_new_id} no existe en la base de datos externa`);
            }

            const updatedTicket = await this.updateTicketFromExternal(ticket, ticketRecord);
            
            return updatedTicket;

        } catch (error) {
            this.logger.error(`❌ Error actualizando ticket ID: ${ticketId}`, error.message);
            throw new Error(`Error al actualizar ticket ${ticketId}: ${error.message}`);
        }
    }

    async createOrUpdateTicketFromGestionCoban(ticketId: number): Promise<Ticket> {
        try {
            this.checkNewSistemasConnection();

            this.logger.log(`🔄 Creando o actualizando ticket desde gestion_coban ID: ${ticketId}`);
            
            // Buscar el ticket en la base de datos externa
            const externalTicket = await this.tblTicketsNewsRepository.findOne({ where: { id: ticketId } });

            if (!externalTicket) {
                this.logger.warn(`⚠️ Ticket ID: ${ticketId} no encontrado en la base de datos externa`);
                throw new Error(`Ticket con ID ${ticketId} no existe en la base de datos externa`);
            }

            // Crear o actualizar el ticket en la base de datos local
            const localTicket = await this.findTicketLocalByGestionCobanId(ticketId);

            if (localTicket) {
                // Actualizar ticket existente usando la función reutilizable
                this.logger.log(`🔄 Actualizando ticket local ID: ${localTicket.id}`);
                return await this.updateTicketFromExternal(localTicket, externalTicket);
            } else {
                // Crear nuevo ticket usando la función reutilizable
                this.logger.log(`🔄 Creando nuevo ticket local desde gestion_coban ID: ${ticketId}`);
                return await this.createTicketFromExternal(externalTicket);
            }  
        } catch (error) {
            this.logger.error(`❌ Error creando o actualizando ticket ID: ${ticketId}`, error.message);
            throw new Error(`Error al crear o actualizar ticket ${ticketId}: ${error.message}`);
        }
    }

    /**
     * Crea un nuevo ticket local a partir de un ticket externo
     * @param ticketRecord Datos del ticket externo (TblTicketsNews)
     * @returns Ticket creado en la base de datos local
     */
    private async createTicketFromExternal(ticketRecord: TblTicketsNews): Promise<Ticket> {
        try {
            this.logger.debug(`📝 Creando nuevo ticket local desde ticket externo ID: ${ticketRecord.id}`);

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
            
            this.logger.debug(`✅ Ticket local creado con ID: ${savedTicket.id}`);
            
            return savedTicket;
        } catch (error) {
            this.logger.error(`❌ Error creando ticket local desde ticket externo ID: ${ticketRecord.id}`, error.message);
            throw new Error(`Error al crear ticket local: ${error.message}`);
        }
    }

    /**
     * Actualiza un ticket local existente con datos del ticket externo
     * @param localTicket Ticket local a actualizar
     * @param ticketRecord Datos del ticket externo (TblTicketsNews)
     * @returns Ticket actualizado
     */
    private async updateTicketFromExternal(localTicket: Ticket, ticketRecord: TblTicketsNews): Promise<Ticket> {
        try {
            this.logger.debug(`🔄 Actualizando ticket local ID: ${localTicket.id} con datos del ticket externo ID: ${ticketRecord.id}`);

            // Actualizar campos
            localTicket.descripcion = ticketRecord.descripcion || localTicket.descripcion;
            localTicket.titulo = ticketRecord.titulo;
            localTicket.id_estado = ticketRecord.id_estado;
            localTicket.fecha_estimada = ticketRecord.fecha_estimada;
            localTicket.fecha_clasificacion = ticketRecord.fecha_clasificacion;
            localTicket.numero_issue = ticketRecord.numero_issue;

            const updatedTicket = await this.ticketRepository.save(localTicket);
            
            this.logger.debug(`✅ Ticket local ID: ${localTicket.id} actualizado exitosamente`);
            
            return updatedTicket;
        } catch (error) {
            this.logger.error(`❌ Error actualizando ticket local ID: ${localTicket.id}`, error.message);
            throw new Error(`Error al actualizar ticket local: ${error.message}`);
        }
    }

    /**
     * Busca un ticket local por su ticket_new_id (referencia a gestion_coban)
     * @param ticketId ID del ticket en la base de datos externa (gestion_coban)
     * @returns Ticket local o null si no existe
     */
    async findTicketLocalByGestionCobanId(ticketId: number): Promise<Ticket | null> {
        try {
            this.logger.debug(`🔍 Buscando ticket local con ticket_new_id: ${ticketId}`);

            return await this.ticketRepository.findOne({ where: { ticket_new_id: ticketId } });
        } catch (error) {
            this.logger.error(`❌ Error buscando ticket local con ticket_new_id: ${ticketId}`, error.message);
            // No lanzar error, retornar null para que el proceso continúe
            return null;
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
                    const existingTicket = await this.findTicketLocalByGestionCobanId(ticketRecord.id);

                    if (!existingTicket) {
                        // Crear nuevo ticket usando la función reutilizable
                        await this.createTicketFromExternal(ticketRecord);
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
}

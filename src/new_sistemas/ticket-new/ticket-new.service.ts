import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketNew } from './entities/ticket-new.entity';

/**
 * Servicio para gestionar tickets de la BD new_sistemas
 * 
 * IMPORTANTE: Este servicio es de SOLO LECTURA.
 * No incluye métodos de escritura (create, update, delete).
 */
@Injectable()
export class TicketNewService {
    constructor(
        @InjectRepository(TicketNew, 'newSistemasConnection')
        private readonly ticketNewRepository: Repository<TicketNew>,
    ) { }

    /**
     * Obtener todos los tickets
     * @returns Lista de tickets
     */
    async findAll(): Promise<TicketNew[]> {
        return await this.ticketNewRepository.find({
            order: { created_at: 'DESC' },
        });
    }

    /**
     * Obtener un ticket por ID
     * @param id ID del ticket
     * @returns El ticket encontrado
     */
    async findOne(id: number): Promise<TicketNew> {
        const ticket = await this.ticketNewRepository.findOne({
            where: { id },
        });

        if (!ticket) {
            throw new NotFoundException(`Ticket con ID ${id} no encontrado en new_sistemas`);
        }

        return ticket;
    }

    /**
     * Buscar tickets por estado
     * @param estado Estado del ticket
     * @returns Lista de tickets con el estado especificado
     */
    async findByEstado(estado: string): Promise<TicketNew[]> {
        return await this.ticketNewRepository.find({
            where: { estado },
            order: { created_at: 'DESC' },
        });
    }

    /**
     * Buscar tickets por descripción (búsqueda parcial)
     * @param descripcion Texto a buscar en la descripción
     * @returns Lista de tickets que coinciden
     */
    async searchByDescripcion(descripcion: string): Promise<TicketNew[]> {
        return await this.ticketNewRepository
            .createQueryBuilder('ticket')
            .where('ticket.descripcion ILIKE :descripcion', { descripcion: `%${descripcion}%` })
            .orderBy('ticket.created_at', 'DESC')
            .getMany();
    }

    /**
     * Contar tickets por estado
     * @param estado Estado del ticket (opcional)
     * @returns Número de tickets
     */
    async count(estado?: string): Promise<number> {
        if (estado) {
            return await this.ticketNewRepository.count({ where: { estado } });
        }
        return await this.ticketNewRepository.count();
    }
}

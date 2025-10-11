import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TicketNewService } from './ticket-new.service';
import { TicketNew } from './entities/ticket-new.entity';
import { RequireRead } from '../../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';

/**
 * Controlador para tickets de new_sistemas (solo lectura)
 * 
 * Todos los endpoints requieren autenticación JWT y permisos de lectura.
 * Solo se implementan endpoints GET (lectura).
 * 
 * Ruta base: /api/new-sistemas/tickets
 */
@Controller('new-sistemas/tickets')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TicketNewController {
    constructor(private readonly ticketNewService: TicketNewService) { }

    /**
     * Obtener todos los tickets o filtrar por parámetros
     * GET /api/new-sistemas/tickets
     * GET /api/new-sistemas/tickets?estado=abierto
     * GET /api/new-sistemas/tickets?descripcion=buscar
     * 
     * Requiere permiso: ticket-new:read
     */
    @Get()
    @RequireRead('ticket-new')
    async findAll(
        @Query('estado') estado?: string,
        @Query('descripcion') descripcion?: string,
    ): Promise<TicketNew[]> {
        if (descripcion) {
            return await this.ticketNewService.searchByDescripcion(descripcion);
        }

        if (estado) {
            return await this.ticketNewService.findByEstado(estado);
        }

        return await this.ticketNewService.findAll();
    }

    /**
     * Obtener el conteo de tickets
     * GET /api/new-sistemas/tickets/count
     * GET /api/new-sistemas/tickets/count?estado=abierto
     * 
     * Requiere permiso: ticket-new:read
     */
    @Get('count')
    @RequireRead('ticket-new')
    async count(@Query('estado') estado?: string): Promise<{ count: number }> {
        const count = await this.ticketNewService.count(estado);
        return { count };
    }

    /**
     * Obtener un ticket específico por ID
     * GET /api/new-sistemas/tickets/:id
     * 
     * Requiere permiso: ticket-new:read
     */
    @Get(':id')
    @RequireRead('ticket-new')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<TicketNew> {
        return await this.ticketNewService.findOne(id);
    }
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
    OneToMany
} from 'typeorm';
import { ClasificacionTicket } from './clasificacion-ticket.entity';

/**
 * Entidad Ticket
 * 
 * Representa los tickets del sistema para seguimiento de tareas e incidencias.
 * Un ticket puede tener múltiples clasificaciones que registran sus cambios de estado,
 * asignaciones de desarrolladores y enlaces a issues.
 * 
 * Relaciones:
 * - OneToMany con ClasificacionTicket: Un ticket puede tener múltiples clasificaciones
 */
@Entity()
@Index(['ticket_new_id']) // Índice en ticket_new_id
export class Ticket {
    /**
     * Identificador único del ticket (autoincremental)
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * ID de referencia adicional para tickets (con índice)
     * Puede usarse para agrupar tickets relacionados o versiones
     */
    @Column({
        name: 'ticket_new_id',
        type: 'int',
        nullable: true,
    })
    ticket_new_id: number;

    /**
     * Descripción detallada del ticket
     */
    @Column({
        type: 'text',
    })
    descripcion: string;

    /**
     * URL del ticket en sistema externo (si aplica)
     */
    @Column({
        name: 'url_ticket_new',
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    url_ticket_new: string;

    /**
     * Relación One-to-Many con ClasificacionTicket
     * Un ticket puede tener múltiples clasificaciones (historial de cambios)
     */
    @OneToMany(() => ClasificacionTicket, (clasificacion) => clasificacion.ticket)
    clasificaciones: ClasificacionTicket[];

    /**
     * Fecha de creación del ticket
     */
    @CreateDateColumn()
    created_at: Date;

    /**
     * Fecha de última actualización
     */
    @UpdateDateColumn()
    updated_at: Date;

    /**
     * Fecha de eliminación (soft delete)
     */
    @DeleteDateColumn()
    deleted_at: Date;
}

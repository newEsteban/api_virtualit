import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from '../../user/entities/user.entity';
import { Subtipo } from '../../subtipo/entities/subtipo.entity';

/**
 * Entidad ClasificacionTicket
 * 
 * Representa las clasificaciones/cambios de estado de un ticket.
 * Un ticket puede tener múltiples clasificaciones a lo largo de su ciclo de vida.
 * Cada clasificación registra el estado, desarrollador asignado y enlaces a issues.
 * 
 * Relaciones:
 * - ManyToOne con Ticket: Múltiples clasificaciones pertenecen a un ticket
 * - ManyToOne con User (developer): Desarrollador asignado en esta clasificación
 * - ManyToOne con Subtipo (estado): Estado del ticket en esta clasificación
 */
@Entity('clasificacion_ticket')
export class ClasificacionTicket {
    /**
     * Identificador único de la clasificación (autoincremental)
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * ID del ticket al que pertenece esta clasificación
     */
    @Column({
        name: 'ticket_id',
        type: 'int',
    })
    ticket_id: number;

    /**
     * Relación Many-to-One con Ticket
     * Múltiples clasificaciones pueden pertenecer a un ticket
     */
    @ManyToOne(() => Ticket, (ticket) => ticket.clasificaciones, {
        nullable: false,
        onDelete: 'CASCADE' // Si se elimina el ticket, eliminar sus clasificaciones
    })
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    /**
     * ID del estado del ticket (referencia a Subtipo)
     */
    @Column({
        name: 'estado_id',
        type: 'int',
    })
    estado_id: number;

    /**
     * Relación Many-to-One con Subtipo (estado)
     */
    @ManyToOne(() => Subtipo, {
        nullable: false,
        onDelete: 'RESTRICT' // No permitir eliminar un subtipo si hay clasificaciones asociadas
    })
    @JoinColumn({ name: 'estado_id' })
    estado: Subtipo;

    /**
     * ID del desarrollador asignado (referencia a User)
     */
    @Column({
        name: 'developer_id',
        type: 'uuid',
        nullable: true,
    })
    developer_id: string;

    /**
     * Relación Many-to-One con User (desarrollador asignado)
     */
    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL' // Si se elimina el usuario, el campo se establece en NULL
    })
    @JoinColumn({ name: 'developer_id' })
    developer: User;

    /**
     * Descripción o ID del issue en sistema de control de versiones
     */
    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    issue: string;

    /**
     * Link directo al issue en sistema de control de versiones
     */
    @Column({
        name: 'link_issue',
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    link_issue: string;

    /**
     * Fecha estimada de resolución o entrega
     */
    @Column({
        name: 'fecha_estimada',
        type: 'timestamp',
        nullable: true,
    })
    fecha_estimada: Date;

    /**
     * Fecha en que se pasó a producción
     */
    @Column({
        name: 'fecha_paso_produccion',
        type: 'timestamp',
        nullable: true,
    })
    fecha_paso_produccion: Date;

    /**
     * Fecha de creación de la clasificación
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

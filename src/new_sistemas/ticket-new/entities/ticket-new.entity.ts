import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entidad TicketNew
 * 
 * Representa un ticket en la base de datos new_sistemas (solo lectura).
 * Esta es una entidad de ejemplo que mapea la tabla 'tickets' de la BD legacy.
 * 
 * IMPORTANTE: Esta entidad es de solo lectura. No debe usarse para 
 * operaciones de escritura (INSERT, UPDATE, DELETE).
 * 
 * Mapeo de tabla:
 * - Tabla: tickets (en BD new_sistemas)
 * - Conexión: newSistemasConnection
 */
@Entity('tickets', { schema: 'public' })
export class TicketNew {
    /**
     * ID del ticket (autoincremental)
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Descripción del ticket
     */
    @Column({ type: 'text', nullable: true })
    descripcion: string;

    /**
     * Estado del ticket
     */
    @Column({ type: 'varchar', length: 50, nullable: true })
    estado: string;

    /**
     * URL del ticket
     */
    @Column({ type: 'varchar', length: 255, nullable: true })
    url: string;

    /**
     * Fecha de creación del ticket
     */
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    /**
     * Fecha de última actualización
     */
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}

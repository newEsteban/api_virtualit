import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index
} from 'typeorm';

/**
 * Entidad TblComentariosTicket (tabla externa de Cobanc)
 * 
 * Representa los comentarios asociados a tickets en el sistema externo.
 * Utiliza patrón polimórfico con comentable_id y comentable_type.
 */
@Entity({ name: 'tbl_tickets_new_comentarios' })
@Index(['comentable_id'])
@Index(['id_archivo'])
export class TblComentariosTicket {
    /**
     * Identificador único del comentario (autoincremental)
     */
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    /**
     * ID de la entidad a la que pertenece el comentario (relación polimórfica)
     */
    @Column({ name: 'comentable_id', type: 'int', unsigned: true, nullable: false })
    comentable_id: number;

    /**
     * Tipo/namespace de la entidad asociada (relación polimórfica)
     */
    @Column({ name: 'comentable_type', type: 'varchar', length: 250, nullable: false })
    comentable_type: string;

    /**
     * ID del usuario que creó el comentario
     */
    @Column({ name: 'id_usuario', type: 'int', unsigned: true, nullable: false })
    id_usuario: number;

    /**
     * ID del estado asociado al comentario (opcional)
     */
    @Column({ name: 'id_estado', type: 'int', unsigned: true, nullable: true })
    id_estado: number;

    /**
     * ID del archivo adjunto asociado al comentario (opcional)
     */
    @Column({ name: 'id_archivo', type: 'int', unsigned: true, nullable: true })
    id_archivo: number;

    /**
     * Contenido del comentario
     */
    @Column({ type: 'longtext', nullable: false })
    comentario: string;

    /**
     * Fecha de creación (con actualización automática)
     */
    @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    created_at: Date;
}

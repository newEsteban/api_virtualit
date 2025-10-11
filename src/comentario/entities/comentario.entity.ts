import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

/**
 * Entidad Comentario (Polimórfica)
 * 
 * Representa comentarios que pueden asociarse a diferentes entidades del sistema.
 * Utiliza un patrón polimórfico para relacionarse con múltiples tipos de recursos.
 * 
 * Campos polimórficos:
 * - commentable_id: ID del recurso asociado
 * - commentable_type: Namespace/tipo del recurso asociado (ej: 'Ticket', 'User', 'Tipo')
 * 
 * Relaciones:
 * - ManyToOne con User: Cada comentario pertenece a un usuario
 */
@Entity()
@Index(['commentable_id', 'commentable_type']) // Índice compuesto para búsquedas polimórficas
export class Comentario {
    /**
     * Identificador único del comentario (autoincremental)
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Contenido del comentario
     */
    @Column({
        type: 'text',
    })
    comentario: string;

    /**
     * ID del usuario que creó el comentario (referencia a User)
     */
    @Column({
        name: 'usuario_id',
        type: 'uuid',
    })
    usuario_id: string;

    /**
     * Relación Many-to-One con User (autor del comentario)
     * Un comentario pertenece a un usuario
     */
    @ManyToOne(() => User, {
        nullable: false,
        onDelete: 'CASCADE' // Si se elimina el usuario, eliminar sus comentarios
    })
    @JoinColumn({ name: 'usuario_id' })
    usuario: User;

    /**
     * ID del recurso al que pertenece este comentario (relación polimórfica)
     */
    @Column({
        name: 'commentable_id',
        type: 'int',
    })
    commentable_id: number;

    /**
     * Tipo/namespace del recurso al que pertenece (relación polimórfica)
     * Ejemplos: 'Ticket', 'User', 'Tipo', 'ClasificacionTicket', etc.
     */
    @Column({
        name: 'commentable_type',
        type: 'varchar',
        length: 100,
    })
    commentable_type: string;

    /**
     * Fecha de creación del comentario
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

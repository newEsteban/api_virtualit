import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { Comentario } from '../../comentario/entities/comentario.entity';
import { PolymorphicEntity } from '../../common/entities/polymorphic.entity';

/**
 * Entidad Archivo (Polimórfica)
 * 
 * Representa archivos asociados a diferentes entidades del sistema.
 * Utiliza un patrón polimórfico para relacionarse con múltiples tipos de recursos.
 * 
 * Campos polimórficos:
 * - modulo_id: ID del recurso asociado
 * - modulo_type: Namespace/tipo del recurso asociado (ej: 'User', 'Tipo', 'Subtipo')
 */
@Entity()
@Index(['archivo_new_id']) // Índice en archivo_new_id
export class Archivo extends PolymorphicEntity {
    /**
     * Stable entity type for polymorphic relations.
     */
    static ENTITY_TYPE = 'Archivo';
    /**
     * Identificador único del archivo (autoincremental)
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * ID del recurso al que pertenece este archivo (relación polimórfica)
     */
    @Column({ type: 'varchar', length: 191, nullable: true })
    documentable_type: string;

    @Column({ type: 'int', nullable: true })
    documentable_id: number;

    @Column({ type: 'varchar', length: 191, nullable: false, default: '' })
    archivable_type: string;

    @Column({ type: 'int', nullable: false })
    archivable_id: number;

    /**
     * Relación opcional con Ticket
     * Nota: esta relación es válida cuando `archivable_type` corresponde a la entidad Ticket.
     * No se crean constraints de FK para mantener compatibilidad con relación polimórfica.
     */
    @ManyToOne(() => Ticket, (ticket) => ticket.archivos, { nullable: true, createForeignKeyConstraints: false })
    @JoinColumn({ name: 'archivable_id', referencedColumnName: 'id' })
    ticket: Ticket;

    /**
     * Relación opcional con Comentario
     * Nota: esta relación es válida cuando `archivable_type` corresponde a la entidad Comentario.
     * No se crean constraints de FK para mantener compatibilidad con relación polimórfica.
     */
    @ManyToOne(() => Comentario, (comentario) => comentario.archivos, { nullable: true, createForeignKeyConstraints: false })
    @JoinColumn({ name: 'archivable_id', referencedColumnName: 'id' })
    comentario: Comentario;

    /**
     * Ruta donde se almacena el archivo
     */
    @Column({
        type: 'varchar',
        length: 500,
    })
    route: string;

    /**
     * Nombre del archivo
     */
    @Column({
        type: 'varchar',
        length: 255,
    })
    display_name: string;

    /**
     * Extensión del archivo (ej: 'pdf', 'jpg', 'png')
     */
    @Column({
        type: 'varchar',
        length: 10,
    })
    extension: string;

    /**
     * ID de referencia adicional para archivos (con índice)
     * Puede usarse para agrupar archivos o versiones
     */
    @Column({
        name: 'archivo_new_id',
        type: 'int',
        nullable: true,
    })
    archivo_new_id: number;

    /**
     * Fecha de creación del archivo
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

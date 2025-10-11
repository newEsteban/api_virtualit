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
import { Tipo } from '../../tipo/entities/tipo.entity';

/**
 * Entidad Subtipo
 * 
 * Representa los subtipos del sistema.
 * Cada subtipo pertenece a un tipo específico.
 * 
 * Relaciones:
 * - ManyToOne con Tipo: Múltiples subtipos pueden pertenecer a un tipo
 */
@Entity()
export class Subtipo {
    /**
     * Identificador único del subtipo (autoincremental)
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Nombre del subtipo
     */
    @Column({
        type: 'varchar',
        length: 255,
    })
    nombre: string;

    /**
     * ID del tipo al que pertenece este subtipo
     */
    @Column({
        name: 'tipo_id',
    })
    tipo_id: number;

    /**
     * Relación Many-to-One con Tipo
     * Múltiples subtipos pueden pertenecer a un tipo
     */
    @ManyToOne(() => Tipo, (tipo) => tipo.subtipos, {
        onDelete: 'CASCADE', // Si se elimina el tipo, eliminar sus subtipos
    })
    @JoinColumn({ name: 'tipo_id' })
    tipo: Tipo;

    /**
     * Fecha de creación del subtipo
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

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany
} from 'typeorm';
import { Subtipo } from '../../subtipo/entities/subtipo.entity';

/**
 * Entidad Tipo
 * 
 * Representa los tipos del sistema.
 * Un tipo puede tener múltiples subtipos asociados.
 * 
 * Relaciones:
 * - OneToMany con Subtipo: Un tipo puede tener múltiples subtipos
 */
@Entity()
export class Tipo {
    /**
     * Identificador único del tipo (autoincremental)
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Nombre del tipo
     */
    @Column({
        type: 'varchar',
        length: 255,
    })
    nombre: string;

    /**
     * Relación One-to-Many con Subtipo
     * Un tipo puede tener múltiples subtipos
     */
    @OneToMany(() => Subtipo, (subtipo) => subtipo.tipo)
    subtipos: Subtipo[];

    /**
     * Fecha de creación del tipo
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

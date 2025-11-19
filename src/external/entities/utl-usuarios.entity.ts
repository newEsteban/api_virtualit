import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from 'typeorm';

/**
 * Entidad UtlUsuarios (tabla externa de Cobanc)
 * 
 * Representa los usuarios del sistema externo.
 */
@Entity({ name: 'utl_usuarios' })
export class UtlUsuarios {
    /**
     * Identificador único del usuario
     */
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    /**
     * Nombre del usuario
     */
    @Column({ type: 'varchar', length: 255, nullable: true })
    nombre: string;

    /**
     * Email del usuario
     */
    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string;
}

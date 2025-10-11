import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToMany
} from 'typeorm';
import { Rol } from '../../rol/entities/rol.entity';

/**
 * Entidad Permiso
 * 
 * Representa los permisos individuales del sistema que pueden ser asignados a roles.
 * Un permiso define una acción específica que puede ser realizada en el sistema.
 * 
 * Relaciones:
 * - ManyToMany con Rol: Un permiso puede pertenecer a múltiples roles
 */
@Entity('permisos')
export class Permiso {
    /**
     * Identificador único del permiso (autoincremental)
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Nombre del permiso (ej: "read_users", "create_posts", "delete_comments")
     * Debe ser único en el sistema
     */
    @Column({ 
        unique: true,
        length: 100
    })
    name: string;

    /**
     * Descripción legible del permiso
     * Explica qué acción permite realizar este permiso
     */
    @Column({
        type: 'varchar',
        length: 255,
        nullable: true
    })
    description: string;

    /**
     * Recurso o módulo al que aplica el permiso
     * Ej: "users", "posts", "dashboard", "settings"
     */
    @Column({
        type: 'varchar',
        length: 50
    })
    resource: string;

    /**
     * Acción específica del permiso
     * Ej: "read", "create", "update", "delete", "execute"
     */
    @Column({
        type: 'varchar',
        length: 50
    })
    action: string;

    /**
     * Indica si el permiso está activo
     * Permite deshabilitar permisos sin eliminarlos
     */
    @Column({
        type: 'boolean',
        default: true
    })
    isActive: boolean;

    /**
     * Relación Many-to-Many con Rol
     * Un permiso puede estar asignado a múltiples roles
     */
    @ManyToMany(() => Rol, (rol) => rol.permisos)
    roles: Rol[];

    /**
     * Fecha de creación del permiso
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

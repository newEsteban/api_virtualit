import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToMany,
    JoinTable
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Permiso } from '../../permiso/entities/permiso.entity';

/**
 * Entidad Rol
 * 
 * Representa los roles del sistema que agrupan permisos y pueden ser asignados a usuarios.
 * Un rol define un conjunto de permisos que determinan qué acciones puede realizar un usuario.
 * 
 * Relaciones:
 * - ManyToMany con User: Un rol puede ser asignado a múltiples usuarios
 * - ManyToMany con Permiso: Un rol puede tener múltiples permisos
 */
@Entity('roles')
export class Rol {
    /**
     * Identificador único del rol (autoincremental)
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Nombre del rol (ej: "admin", "editor", "viewer", "moderator")
     * Debe ser único en el sistema
     */
    @Column({ 
        unique: true,
        length: 50
    })
    name: string;

    /**
     * Descripción del rol
     * Explica las responsabilidades y alcance del rol
     */
    @Column({
        type: 'varchar',
        length: 255,
        nullable: true
    })
    description: string;

    /**
     * Nivel de prioridad del rol
     * Permite establecer jerarquías entre roles (1 = mayor prioridad)
     */
    @Column({
        type: 'int',
        default: 1000
    })
    priority: number;

    /**
     * Indica si el rol está activo
     * Permite deshabilitar roles sin eliminarlos
     */
    @Column({
        type: 'boolean',
        default: true
    })
    isActive: boolean;

    /**
     * Indica si es un rol del sistema (no editable)
     * Los roles del sistema no pueden ser modificados o eliminados
     */
    @Column({
        type: 'boolean',
        default: false
    })
    isSystem: boolean;

    /**
     * Relación Many-to-Many con User
     * Un rol puede ser asignado a múltiples usuarios
     */
    @ManyToMany(() => User, (user) => user.roles)
    users: User[];

    /**
     * Relación Many-to-Many con Permiso
     * Un rol puede tener múltiples permisos
     * Esta tabla es la propietaria de la relación (tiene la tabla pivot)
     */
    @ManyToMany(() => Permiso, (permiso) => permiso.roles)
    @JoinTable({
        name: 'rol_permisos', // Nombre de la tabla pivot
        joinColumn: {
            name: 'rol_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'permiso_id',
            referencedColumnName: 'id'
        }
    })
    permisos: Permiso[];

    /**
     * Fecha de creación del rol
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

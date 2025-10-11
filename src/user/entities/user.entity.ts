import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BeforeInsert,
    BeforeUpdate,
    ManyToMany,
    JoinTable
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol } from '../../rol/entities/rol.entity';

/**
 * Entidad User
 * 
 * Representa los usuarios del sistema con autenticación y autorización.
 * Un usuario puede tener múltiples roles que determinan sus permisos.
 * 
 * Relaciones:
 * - ManyToMany con Rol: Un usuario puede tener múltiples roles
 */
@Entity()
export class User {
    /**
     * Identificador único del usuario
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Email único del usuario (usado para autenticación)
     */
    @Column({ unique: true })
    email: string;

    /**
     * Contraseña hasheada del usuario
     * Se excluye por defecto de las consultas por seguridad
     */
    @Column({
        select: false,
        type: 'varchar',
    })
    password: string;

    /**
     * Nombre completo del usuario
     */
    @Column({
        type: 'varchar',
    })
    name: string;

    /**
     * Estado activo del usuario
     * Permite deshabilitar usuarios sin eliminarlos
     */
    @Column({
        type: 'boolean',
        default: true
    })
    isActive: boolean;

    /**
     * Indica si el usuario es programador (true) o no (false)
     */
    @Column({
        type: 'boolean',
        default: false,
        name: 'is_developer',
    })
    is_developer: boolean;

    /**
     * Relación Many-to-Many con Rol
     * Un usuario puede tener múltiples roles
     * Esta tabla es la propietaria de la relación (tiene la tabla pivot)
     */
    @ManyToMany(() => Rol, (rol) => rol.users, {
        cascade: false, // No propagar cambios automáticamente
        onDelete: 'CASCADE' // Si se elimina el usuario, eliminar sus roles asignados
    })
    @JoinTable({
        name: 'user_roles', // Nombre de la tabla pivot
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'rol_id',
            referencedColumnName: 'id'
        }
    })
    roles: Rol[];

    //Agregamos los timestamps
    /**
     * Fecha de creación del usuario
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

    /**
     * Hook que hashea la contraseña antes de insertar
     */
    @BeforeInsert()
    async hashPassword() {
        if (!this.password) return;
        this.password = await bcrypt.hash(this.password, 10);
    }

    /**
     * Hook que normaliza los campos antes de insertar
     */
    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
        this.name = this.name.trim();
    }

    /**
     * Hook que normaliza los campos antes de actualizar
     */
    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }
}

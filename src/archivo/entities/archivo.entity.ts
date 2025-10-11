import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index
} from 'typeorm';

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
export class Archivo {
    /**
     * Identificador único del archivo (autoincremental)
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * ID del recurso al que pertenece este archivo (relación polimórfica)
     */
    @Column({
        name: 'modulo_id',
        type: 'int',
    })
    modulo_id: number;

    /**
     * Tipo/namespace del recurso al que pertenece (relación polimórfica)
     * Ejemplos: 'User', 'Tipo', 'Subtipo', etc.
     */
    @Column({
        name: 'modulo_type',
        type: 'varchar',
        length: 100,
    })
    modulo_type: string;

    /**
     * Ruta donde se almacena el archivo
     */
    @Column({
        type: 'varchar',
        length: 500,
    })
    ruta: string;

    /**
     * Nombre del archivo
     */
    @Column({
        type: 'varchar',
        length: 255,
    })
    nombre: string;

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

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad para la tabla tbl_tickets_news de la base de datos gestion_cobanc
 * 
 * Esta entidad mapea la tabla tbl_tickets_news que contiene los tickets 
 * del sistema legacy ubicado en la base de datos gestion_cobanc.
 * 
 * Uso: Solo lectura para migración de datos a la tabla ticket local.
 * Conexión: newSistemasConnection (MySQL/MariaDB)
 */
@Entity('tbl_tickets_news')
export class TblTicketsNews {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_estado', type: 'int', comment: 'esta actual del ticket utl_subtipos' })
    id_estado: number;

    @Column({ type: 'varchar', length: 150, comment: 'titulo principal del ticket' })
    titulo: string;

    @Column({ type: 'text', comment: 'descripcion del ticket' })
    descripcion: string;

    @Column({ name: 'fecha_estimada', type: 'timestamp', nullable: true, comment: 'fecha de estima de resolucion' })
    fecha_estimada: Date;

    @Column({ name: 'fecha_clasificacion', type: 'timestamp', nullable: true, comment: 'fecha de en que fue clasificado' })
    fecha_clasificacion: Date;


    @Column({ name: 'numero_issue', type: 'varchar', length: 20, nullable: true, comment: 'Número de issue asignado al ticket' })
    numero_issue: string;


    @Column({ name: 'created_at', type: 'timestamp', nullable: true })
    created_at: Date;

    @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
    updated_at: Date;

    @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deleted_at: Date;

    @Column({ name: 'tiempo_estimado', type: 'text', nullable: true })
    tiempo_estimado: string;
}

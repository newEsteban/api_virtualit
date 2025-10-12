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

    @Column({ type: 'varchar', length: 255, nullable: true })
    descripcion: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    url_ticket: string;

    @Column({ type: 'int', nullable: true })
    ticket_id: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    estado: string;

    @Column({ type: 'timestamp', nullable: true })
    fecha_creacion: Date;

    @Column({ type: 'timestamp', nullable: true })
    fecha_actualizacion: Date;

    // Agregar más campos según la estructura real de tbl_tickets_news
    // Esta entidad puede expandirse conforme se identifiquen más campos necesarios
}

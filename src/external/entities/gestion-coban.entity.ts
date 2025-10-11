import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad para la tabla tbl_tickets_news de la base de datos externa gestion_coban
 * Esta entidad es de solo lectura para migrar datos a la tabla ticket local
 */
@Entity('tbl_tickets_news')
export class GestionCoban {
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

    // Agregar más campos según la estructura real de tu tabla gestion_coban
    // Puedes ajustar estos campos según tu esquema real
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity({ name: 'tbl_archivos_new', database: 'new_sistemas' })
export class TblArchivosNew {
    
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 191, nullable: false, default: '' })
    display_name: string;

    @Column({ type: 'varchar', length: 191, nullable: false, default: '' })
    filename: string;

    @Column({ type: 'varchar', length: 191, nullable: false, default: '' })
    route: string;

    @Column({ type: 'varchar', length: 191, nullable: true })
    documentable_type: string;

    @Column({ type: 'int', nullable: true })
    documentable_id: number;

    @Column({ type: 'varchar', length: 191, nullable: false, default: '' })
    archivable_type: string;

    @Column({ type: 'int', nullable: false })
    archivable_id: number;

    @Column({ type: 'int', nullable: true })
    clasificacion_id: number;

    @Column({ type: 'varchar', length: 300, nullable: true })
    clasificacion_type: string;

    @Column({ type: 'int', nullable: true })
    id_carga_masiva: number;

    @Column({ type: 'int', nullable: true })
    id_usuario: number;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at: Date;

    @Column({ type: 'tinyint', width: 1, nullable: false, default: 0 })
    requerido: number;

    @Column({ type: 'text', nullable: true })
    motivo_rechazo: string;
}
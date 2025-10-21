import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('utl_subtipos')
export class TblEstadosNew {
    @PrimaryGeneratedColumn()
    id_subtipo: number;

    @Column({ type: 'text', comment: 'descripción del estado' })
    descripcion: string;

    @Column({ type: 'int', comment: 'id del tipo al que pertenece el estado' })
    id_tipo: number;
}

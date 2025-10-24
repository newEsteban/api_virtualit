import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('utl_tipos')
export class TblTiposNew {
    @PrimaryGeneratedColumn()
    id_tipo: number;

    @Column({
        name: 'nombre',
        type: 'varchar',
        length: 255
    })
    nombre: string;

    @Column({
        name: 'descripcion',
        type: 'varchar',
        length: 255
    })
    descripcion: string;
}
import { IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";


export class MigrateOneTicketDto {
    @IsNumber()
    ticketId: number;
}

export class MigrateSubtipoDto {
    @ValidateIf(o => o.tipo_id === undefined)
    @IsNumber()
    subtipo_id?: number;

    @ValidateIf(o => o.subtipo_id === undefined)
    @IsNumber()
    tipo_id?: number;
}

export class MigrateTipoDto {
    @IsNumber()
    tipo_id: number;

    @IsString()
    nombre: string;

    @IsOptional()
    @IsString()
    descripcion?: string;
}
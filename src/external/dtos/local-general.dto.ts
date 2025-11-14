import { IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";


export class MigrateOneTicketDto {
    @IsNumber()
    ticketId: number;
}

export class MigrateSubtipoDto {

    @IsOptional()
    @IsNumber()
    tipo_id: number;
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
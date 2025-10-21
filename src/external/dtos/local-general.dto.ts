import { IsNumber } from "class-validator";

export class MigrateOneTicketDto {
    @IsNumber()
    ticketId: number;
}

export class MigrateSubtipoDto {
    @IsNumber()
    subtipo_id: number;

    @IsNumber()
    tipo_id: number;
}
import { IsNumber } from "class-validator";

export class MigrateOneTicketDto {
    @IsNumber()
    ticketId: number;
}
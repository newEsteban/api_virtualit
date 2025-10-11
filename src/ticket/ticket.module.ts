import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { Ticket } from './entities/ticket.entity';
import { ClasificacionTicket } from './entities/clasificacion-ticket.entity';
import { User } from '../user/entities/user.entity';
import { Subtipo } from '../subtipo/entities/subtipo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, ClasificacionTicket, User, Subtipo])],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule { }

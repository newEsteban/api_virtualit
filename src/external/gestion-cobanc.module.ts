import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TblTicketsNews } from './entities/tbl-tickets-news.entity';
import { GestionCobancMigrationService } from './services/gestion-cobanc-migration.service';
import { MigrationController } from './controllers/migration.controller';
import { Ticket } from '../ticket/entities/ticket.entity';

@Module({
  imports: [
    ConfigModule, // Importar ConfigModule para acceder a variables de entorno
    // Importar la entidad externa con la conexión a new_sistemas (condicional)
    TypeOrmModule.forFeature([TblTicketsNews], 'newSistemasConnection'),
    // Importar la entidad local con la conexión por defecto
    TypeOrmModule.forFeature([Ticket]),
  ],
  controllers: [MigrationController],
  providers: [GestionCobancMigrationService],
  exports: [GestionCobancMigrationService],
})
export class GestionCobancModule { }

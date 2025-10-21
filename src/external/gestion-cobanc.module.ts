import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TblTicketsNews } from './entities/tbl-tickets-news.entity';
import { TblEstadosNew } from './entities/tbl-estados-new.entity';
import { GestionCobancMigrationService } from './services/gestion-cobanc-migration.service';
import { CobancSubtipoMigrationService } from './services/cobanc-subtipo-migration.service';
import { MigrationController } from './controllers/migration.controller';
import { MigrationEstadosController } from './controllers/migration-estados.controller';
import { Ticket } from '../ticket/entities/ticket.entity';
import { Subtipo } from '../subtipo/entities/subtipo.entity';

@Module({
  imports: [
    ConfigModule, // Importar ConfigModule para acceder a variables de entorno
    // Importar las entidades externas con la conexión a new_sistemas (condicional)
    TypeOrmModule.forFeature([
      TblTicketsNews,
      TblEstadosNew,
    ], 'newSistemasConnection'),
    // Importar la entidad local con la conexión por defecto
    TypeOrmModule.forFeature([
      Ticket,
      Subtipo,
    ]),
  ],
  controllers: [
    MigrationController,
    MigrationEstadosController,
  ],
  providers: [
    GestionCobancMigrationService,
    CobancSubtipoMigrationService,
  ],
  exports: [
    GestionCobancMigrationService,
    CobancSubtipoMigrationService,
  ],
})
export class GestionCobancModule { }

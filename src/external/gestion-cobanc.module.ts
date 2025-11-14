import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TblTicketsNews } from './entities/tbl-tickets-news.entity';
import { TblEstadosNew } from './entities/tbl-estados-new.entity';
import { TblTiposNew } from './entities/tbl-tipos-new.entity';
import { GestionCobancMigrationService } from './services/gestion-cobanc-migration.service';
import { CobancSubtipoMigrationService } from './services/cobanc-subtipo-migration.service';
import { MigrationController } from './controllers/migration.controller';
import { MigrationEstadosController } from './controllers/migration-estados.controller';
import { Ticket } from '../ticket/entities/ticket.entity';
import { Subtipo } from '../subtipo/entities/subtipo.entity';
import { Tipo } from '../tipo/entities/tipo.entity';
import { TipoModule } from '../tipo/tipo.module'
import { SubtipoModule } from '../subtipo/subtipo.module';

@Module({
  imports: [
    ConfigModule, // Importar ConfigModule para acceder a variables de entorno
    // Importar las entidades externas con la conexión a new_sistemas (condicional)
    TypeOrmModule.forFeature([
      TblTicketsNews,
      TblEstadosNew,
      TblTiposNew,
    ], 'newSistemasConnection'),
    // Importar las entidades locales con la conexión por defecto
    TypeOrmModule.forFeature([
      Ticket,
      Subtipo,
      Tipo,
    ]),
    TipoModule,
    SubtipoModule,
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

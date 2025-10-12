import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GestionCoban } from './entities/gestion-coban.entity';
import { MigrationService } from './services/migration.service';
import { MigrationController } from './controllers/migration.controller';
import { Ticket } from '../ticket/entities/ticket.entity';

@Module({
  imports: [
    ConfigModule, // Importar ConfigModule para acceder a variables de entorno
    // Importar la entidad externa con la conexión a new_sistemas (condicional)
    TypeOrmModule.forFeature([GestionCoban], 'newSistemasConnection'),
    // Importar la entidad local con la conexión por defecto
    TypeOrmModule.forFeature([Ticket]),
  ],
  controllers: [MigrationController],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class ExternalModule { }

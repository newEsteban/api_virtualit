import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GestionCoban } from './entities/gestion-coban.entity';
import { MigrationService } from './services/migration.service';
import { MigrationController } from './controllers/migration.controller';
import { Ticket } from '../ticket/entities/ticket.entity';

@Module({
  imports: [
    // Importar la entidad externa con la conexión a new_sistemas
    TypeOrmModule.forFeature([GestionCoban], 'newSistemasConnection'),
    // Importar la entidad local con la conexión por defecto
    TypeOrmModule.forFeature([Ticket]),
  ],
  controllers: [MigrationController],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class ExternalModule {}

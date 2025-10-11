import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisoService } from './permiso.service';
import { PermisoController } from './permiso.controller';
import { Permiso } from './entities/permiso.entity';

/**
 * Módulo de Permisos
 * 
 * Gestiona todo lo relacionado con los permisos del sistema:
 * - Entidad Permiso
 * - Servicio para lógica de negocio
 * - Controlador para endpoints REST
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Permiso])
  ],
  controllers: [PermisoController],
  providers: [PermisoService],
  exports: [PermisoService], // Exportamos el servicio para uso en otros módulos
})
export class PermisoModule {}

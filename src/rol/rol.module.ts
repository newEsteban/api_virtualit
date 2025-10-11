import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { Rol } from './entities/rol.entity';
import { PermisoModule } from '../permiso/permiso.module';

/**
 * Módulo de Roles
 * 
 * Gestiona todo lo relacionado con los roles del sistema:
 * - Entidad Rol
 * - Servicio para lógica de negocio
 * - Controlador para endpoints REST
 * - Importa PermisoModule para gestionar asignación de permisos
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Rol]),
    PermisoModule, // Importamos para usar PermisoService
  ],
  controllers: [RolController],
  providers: [RolService],
  exports: [RolService], // Exportamos el servicio para uso en otros módulos
})
export class RolModule {}

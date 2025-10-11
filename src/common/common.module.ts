import { Module, Global } from '@nestjs/common';
import { InitializationService } from './services/initialization.service';
import { UserModule } from '../user/user.module';
import { RolModule } from '../rol/rol.module';
import { PermisoModule } from '../permiso/permiso.module';

/**
 * Módulo común para el sistema de permisos
 * 
 * Proporciona servicios compartidos para el sistema de permisos.
 * Es un módulo global para que esté disponible en toda la aplicación.
 */
@Global()
@Module({
  imports: [
    UserModule,
    RolModule,
    PermisoModule,
  ],
  providers: [
    InitializationService,
  ],
  exports: [
    InitializationService,
  ],
})
export class CommonModule {}

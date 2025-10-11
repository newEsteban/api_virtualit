import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketNew } from './entities/ticket-new.entity';
import { TicketNewService } from './ticket-new.service';
import { TicketNewController } from './ticket-new.controller';

/**
 * Módulo TicketNew
 * 
 * Gestiona los tickets de la base de datos new_sistemas.
 * Usa la conexión 'newSistemasConnection' para acceso de solo lectura.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature(
            [TicketNew],
            'newSistemasConnection' // ⚠️ IMPORTANTE: Especificar la conexión de new_sistemas
        )
    ],
    controllers: [TicketNewController],
    providers: [TicketNewService],
    exports: [TicketNewService], // Exportar para uso en otros módulos si es necesario
})
export class TicketNewModule { }

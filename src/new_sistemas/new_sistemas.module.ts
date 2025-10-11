import { Module } from '@nestjs/common';
import { TicketNewModule } from './ticket-new/ticket-new.module';

/**
 * Módulo principal para new_sistemas
 * 
 * Este módulo agrupa todos los submódulos que se conectan
 * a la base de datos new_sistemas (solo lectura).
 * 
 * Todos los módulos hijos deben usar la conexión 'newSistemasConnection'
 * al configurar TypeOrmModule.forFeature()
 */
@Module({
    imports: [
        // Módulos que usan la BD new_sistemas
        TicketNewModule,
        // Agregar más módulos aquí según sea necesario
    ],
    exports: [
        // Exportar módulos si es necesario para uso en otros módulos
        TicketNewModule,
    ],
})
export class NewSistemasModule { }

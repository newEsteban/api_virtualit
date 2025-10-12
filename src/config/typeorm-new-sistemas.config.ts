import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { GestionCoban } from '../external/entities/gestion-coban.entity';

/**
 * Configuración de TypeORM para la base de datos externa (Read Only)
 * 
 * Esta conexión es de solo lectura y se habilita únicamente cuando:
 * - NEW_SISTEMAS_ENABLED=true en las variables de entorno
 * - Se tiene acceso a la red empresarial
 * 
 * Nota: synchronize está deshabilitado para evitar modificaciones en el esquema.
 */
export const typeOrmNewSistemasConfig = (configService: ConfigService): TypeOrmModuleOptions | null => {
    const isEnabled = configService.get<boolean>('NEW_SISTEMAS_ENABLED');

    if (!isEnabled) {
        console.log('🔒 NEW_SISTEMAS_ENABLED=false - Conexión a new_sistemas deshabilitada');
        return null;
    }

    console.log('🔓 NEW_SISTEMAS_ENABLED=true - Configurando conexión a new_sistemas');

    return {
        name: 'newSistemasConnection', // Nombre único para la conexión
        type: 'mysql',
        host: configService.get<string>('NEW_SISTEMAS_DB_HOST'),
        port: configService.get<number>('NEW_SISTEMAS_DB_PORT'),
        username: configService.get<string>('NEW_SISTEMAS_DB_USERNAME'),
        password: configService.get<string>('NEW_SISTEMAS_DB_PASSWORD'),
        database: configService.get<string>('NEW_SISTEMAS_DB_DATABASE'),
        entities: [
            GestionCoban, // Entidad para migración de tickets
            // Agregar aquí más entidades externas para migración
        ],
        synchronize: false, // ⚠️ IMPORTANTE: Mantener en false para conexión de solo lectura
        logging: configService.get<string>('NODE_ENV') === 'development',
        // Configuración adicional para mayor robustez
        connectTimeout: 10000, // 10 segundos timeout
        acquireTimeout: 10000,
    };
};

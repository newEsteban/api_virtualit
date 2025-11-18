import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { TblTicketsNews } from '../external/entities/tbl-tickets-news.entity';
import { TblEstadosNew } from '../external/entities/tbl-estados-new.entity';
import { TblTiposNew } from '../external/entities/tbl-tipos-new.entity';
import { TblArchivosNew } from 'src/external/entities/tbl-archivos-new.entity';

/**
 * Configuración de TypeORM para la base de datos externa gestion_cobanc (Read Only)
 * 
 * Esta conexión es de solo lectura y se habilita únicamente cuando:
 * - NEW_SISTEMAS_ENABLED=true en las variables de entorno
 * - Se tiene acceso a la red empresarial
 * 
 * Base de datos: gestion_cobanc
 * Tablas incluidas: tbl_tickets_news (y futuras tablas para migración)
 * 
 * Nota: synchronize está deshabilitado para evitar modificaciones en el esquema.
 */
export const typeOrmNewSistemasConfig = (configService: ConfigService): TypeOrmModuleOptions | null => {
    const isEnabled = configService.get<boolean>('NEW_SISTEMAS_ENABLED');

    if (!isEnabled) {
        console.log('🔒 NEW_SISTEMAS_ENABLED=false - Conexión a gestion_cobanc deshabilitada');
        return null;
    }

    console.log('🔓 NEW_SISTEMAS_ENABLED=true - Configurando conexión a gestion_cobanc');

    return {
        name: 'newSistemasConnection', // Nombre único para la conexión
        type: configService.get<string>('NEW_SISTEMAS_DB_TYPE') as 'mariadb',
        host: configService.get<string>('NEW_SISTEMAS_DB_HOST'),
        port: configService.get<number>('NEW_SISTEMAS_DB_PORT'),
        username: configService.get<string>('NEW_SISTEMAS_DB_USERNAME'),
        password: configService.get<string>('NEW_SISTEMAS_DB_PASSWORD'),
        database: configService.get<string>('NEW_SISTEMAS_DB_DATABASE'),
        entities: [
            TblTicketsNews, // Entidad para tbl_tickets_news de gestion_cobanc
            TblEstadosNew,  // Entidad para utl_subtipos de gestion_cobanc
            TblTiposNew,    // Entidad para utl_tipos de gestion_cobanc
            TblArchivosNew, // Entidad para tbl_archivos de gestion_cobanc
        ],
        synchronize: false, // ⚠️ IMPORTANTE: Mantener en false para conexión de solo lectura
        logging: configService.get<string>('NODE_ENV') === 'development',
        // Configuración adicional para mayor robustez
        connectTimeout: 10000, // 10 segundos timeout de conexión
        extra: {
            connectionLimit: 10,
            // Opciones válidas para MySQL2
            waitForConnections: true,
            queueLimit: 0,
        },
        retryAttempts: 3,
        retryDelay: 3000,
    };
};

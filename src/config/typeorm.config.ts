import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Tipo } from '../tipo/entities/tipo.entity';
import { Subtipo } from '../subtipo/entities/subtipo.entity';
import { Archivo } from '../archivo/entities/archivo.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { ClasificacionTicket } from '../ticket/entities/clasificacion-ticket.entity';
import { Comentario } from '../comentario/entities/comentario.entity';
import { Permiso } from '../permiso/entities/permiso.entity';
import { Rol } from '../rol/entities/rol.entity';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [User, Tipo, Subtipo, Archivo, Ticket, ClasificacionTicket, Comentario, Permiso, Rol],
    autoLoadEntities: true,
    synchronize: true,
});

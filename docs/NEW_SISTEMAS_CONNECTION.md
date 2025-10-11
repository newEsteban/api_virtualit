# Conexión a Base de Datos new_sistemas (Solo Lectura)

## Configuración

La aplicación ahora tiene dos conexiones de base de datos configuradas:

1. **Conexión Principal** (`default`): Base de datos `api_virtualit_db` - Lectura y Escritura
2. **Conexión new_sistemas** (`newSistemasConnection`): Base de datos `new_sistemas` - Solo Lectura

## Variables de Entorno

Las siguientes variables deben estar configuradas en el archivo `.env`:

```env
# Database Configuration - New Sistemas (Read Only)
DB_NEW_SISTEMAS_HOST=localhost
DB_NEW_SISTEMAS_PORT=5432
DB_NEW_SISTEMAS_USERNAME=
DB_NEW_SISTEMAS_PASSWORD=
DB_NEW_SISTEMAS_NAME=
```

## Uso en Entidades

Para crear una entidad que se conecte a la base de datos `new_sistemas`, debes especificar el nombre de la conexión:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('nombre_tabla', { schema: 'public' })
export class NewSistemasEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  campo: string;

  // ... más campos
}
```

## Uso en Módulos

En el módulo donde quieras usar entidades de `new_sistemas`, debes especificar la conexión:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewSistemasEntity } from './entities/new-sistemas.entity';
import { NewSistemasService } from './new-sistemas.service';
import { NewSistemasController } from './new-sistemas.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [NewSistemasEntity],
      'newSistemasConnection' // ⚠️ Especificar el nombre de la conexión
    )
  ],
  controllers: [NewSistemasController],
  providers: [NewSistemasService],
})
export class NewSistemasModule {}
```

## Uso en Servicios

En el servicio, debes especificar la conexión al inyectar el repositorio:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewSistemasEntity } from './entities/new-sistemas.entity';

@Injectable()
export class NewSistemasService {
  constructor(
    @InjectRepository(NewSistemasEntity, 'newSistemasConnection') // ⚠️ Especificar conexión
    private readonly newSistemasRepository: Repository<NewSistemasEntity>,
  ) {}

  // Solo operaciones de lectura
  async findAll(): Promise<NewSistemasEntity[]> {
    return await this.newSistemasRepository.find();
  }

  async findOne(id: number): Promise<NewSistemasEntity> {
    return await this.newSistemasRepository.findOne({ where: { id } });
  }

  // ⚠️ EVITAR operaciones de escritura (save, update, delete)
  // Esta conexión es de SOLO LECTURA
}
```

## Importante ⚠️

1. **Solo Lectura**: Esta conexión está configurada para consultas únicamente. No debe usarse para operaciones de escritura (INSERT, UPDATE, DELETE).

2. **Synchronize Deshabilitado**: La opción `synchronize: false` está configurada para evitar que TypeORM modifique el esquema de la base de datos.

3. **Permisos de Base de Datos**: Idealmente, el usuario de la base de datos configurado en las variables de entorno debería tener solo permisos de SELECT.

4. **Registro de Entidades**: Las entidades que uses de `new_sistemas` deben agregarse al array `entities` en el archivo `src/config/typeorm-new-sistemas.config.ts`.

## Ejemplo Completo

### 1. Crear la entidad

```bash
nest g resource ticket-new --no-spec
```

### 2. Configurar la entidad

```typescript
// src/ticket-new/entities/ticket-new.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tickets', { schema: 'public' })
export class TicketNew {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  descripcion: string;

  @Column({ type: 'timestamp' })
  created_at: Date;
}
```

### 3. Registrar en la configuración

```typescript
// src/config/typeorm-new-sistemas.config.ts
import { TicketNew } from '../ticket-new/entities/ticket-new.entity';

export const typeOrmNewSistemasConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    // ...
    entities: [TicketNew], // ⬅️ Agregar aquí
    // ...
});
```

### 4. Configurar el módulo

```typescript
// src/ticket-new/ticket-new.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketNew } from './entities/ticket-new.entity';
import { TicketNewService } from './ticket-new.service';
import { TicketNewController } from './ticket-new.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketNew], 'newSistemasConnection')
  ],
  controllers: [TicketNewController],
  providers: [TicketNewService],
  exports: [TicketNewService],
})
export class TicketNewModule {}
```

### 5. Implementar el servicio

```typescript
// src/ticket-new/ticket-new.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketNew } from './entities/ticket-new.entity';

@Injectable()
export class TicketNewService {
  constructor(
    @InjectRepository(TicketNew, 'newSistemasConnection')
    private readonly ticketNewRepository: Repository<TicketNew>,
  ) {}

  async findAll(): Promise<TicketNew[]> {
    return await this.ticketNewRepository.find();
  }

  async findOne(id: number): Promise<TicketNew> {
    return await this.ticketNewRepository.findOne({ where: { id } });
  }
}
```

## Verificación

Para verificar que la conexión funciona correctamente, puedes:

1. Iniciar la aplicación:
   ```bash
   npm run start:dev
   ```

2. Revisar los logs de conexión de TypeORM

3. Realizar consultas a través de los endpoints configurados

## Troubleshooting

Si encuentras errores de conexión:

1. Verifica que las variables de entorno están correctamente configuradas
2. Asegúrate de que la base de datos `new_sistemas` existe
3. Verifica que el usuario tiene permisos de conexión
4. Revisa los logs de la aplicación para más detalles

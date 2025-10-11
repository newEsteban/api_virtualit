# Módulo New Sistemas

Esta carpeta contiene todos los módulos y entidades que se conectan a la base de datos `new_sistemas` (solo lectura).

## Estructura

```
src/new_sistemas/
├── new_sistemas.module.ts          # Módulo principal que agrupa todos los submódulos
├── [nombre-recurso]/               # Cada recurso tiene su propia carpeta
│   ├── entities/
│   │   └── [nombre].entity.ts     # Entidad mapeada a tabla de new_sistemas
│   ├── dto/
│   │   ├── create-[nombre].dto.ts # (Opcional, generalmente no se usa en solo lectura)
│   │   └── update-[nombre].dto.ts # (Opcional, generalmente no se usa en solo lectura)
│   ├── [nombre].controller.ts     # Controlador REST
│   ├── [nombre].service.ts        # Lógica de negocio (solo lectura)
│   └── [nombre].module.ts         # Módulo del recurso
└── README.md                       # Este archivo
```

## Convenciones

### 1. Nombres de Archivos y Carpetas
- Usar kebab-case para nombres de carpetas y archivos
- Sufijo opcional `-new` para distinguir de entidades similares en BD principal
- Ejemplo: `ticket-new/`, `subtipo-new/`

### 2. Entidades
Todas las entidades deben:
- Mapear exactamente la estructura de la tabla en `new_sistemas`
- No incluir decoradores de relación si no son necesarios
- Configurarse para la conexión `newSistemasConnection`

Ejemplo:
```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('nombre_tabla', { schema: 'public' })
export class MiEntidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  campo: string;
}
```

### 3. Módulos
Cada módulo debe especificar la conexión `newSistemasConnection`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiEntidad } from './entities/mi-entidad.entity';
import { MiService } from './mi.service';
import { MiController } from './mi.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [MiEntidad],
      'newSistemasConnection' // ⚠️ IMPORTANTE: Especificar conexión
    )
  ],
  controllers: [MiController],
  providers: [MiService],
  exports: [MiService], // Exportar si se usa en otros módulos
})
export class MiModule {}
```

### 4. Servicios
Los servicios deben:
- Inyectar repositorios con el nombre de la conexión
- Implementar SOLO operaciones de lectura
- NO incluir métodos de escritura (create, update, delete)

Ejemplo:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MiEntidad } from './entities/mi-entidad.entity';

@Injectable()
export class MiService {
  constructor(
    @InjectRepository(MiEntidad, 'newSistemasConnection')
    private readonly repository: Repository<MiEntidad>,
  ) {}

  async findAll(): Promise<MiEntidad[]> {
    return await this.repository.find();
  }

  async findOne(id: number): Promise<MiEntidad> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Registro con ID ${id} no encontrado`);
    }
    return entity;
  }

  // Solo métodos de lectura (find, findOne, etc.)
  // NO incluir: create, update, remove, save
}
```

### 5. Controladores
Los controladores deben:
- Implementar solo endpoints de lectura (GET)
- Usar autenticación JWT si es necesario
- Aplicar decoradores de permisos apropiados

Ejemplo:
```typescript
import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MiService } from './mi.service';
import { MiEntidad } from './entities/mi-entidad.entity';
import { RequireRead } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('new-sistemas/mi-recurso')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class MiController {
  constructor(private readonly miService: MiService) {}

  @Get()
  @RequireRead('mi-recurso')
  findAll(): Promise<MiEntidad[]> {
    return this.miService.findAll();
  }

  @Get(':id')
  @RequireRead('mi-recurso')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<MiEntidad> {
    return this.miService.findOne(id);
  }

  // Solo endpoints GET
  // NO incluir: POST, PUT, PATCH, DELETE
}
```

## Registro de Entidades

Todas las entidades creadas deben registrarse en:
`src/config/typeorm-new-sistemas.config.ts`

```typescript
import { MiEntidad } from '../new_sistemas/mi-recurso/entities/mi-entidad.entity';

export const typeOrmNewSistemasConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    // ...
    entities: [
        MiEntidad,
        // Agregar más entidades aquí
    ],
    // ...
});
```

## Importación en App Module

El módulo `NewSistemasModule` debe importarse en `app.module.ts`:

```typescript
import { NewSistemasModule } from './new_sistemas/new_sistemas.module';

@Module({
  imports: [
    // ... otros módulos
    NewSistemasModule,
  ],
})
export class AppModule {}
```

## Crear un Nuevo Recurso

### Opción 1: Manualmente
1. Crear carpeta del recurso en `src/new_sistemas/`
2. Crear la entidad en `entities/`
3. Crear el servicio
4. Crear el controlador
5. Crear el módulo del recurso
6. Importar el módulo en `new_sistemas.module.ts`
7. Registrar la entidad en `typeorm-new-sistemas.config.ts`

### Opción 2: Usando CLI de NestJS
```bash
# Desde la raíz del proyecto
cd src/new_sistemas
nest g resource nombre-recurso --no-spec
```

Luego modificar los archivos generados para:
- Configurar la conexión `newSistemasConnection`
- Remover métodos de escritura
- Actualizar decoradores de ruta

## Buenas Prácticas

1. **Solo Lectura**: Nunca implementar operaciones de escritura
2. **DTOs**: Generalmente no se necesitan DTOs de creación/actualización
3. **Validación**: Validar parámetros de entrada en controladores
4. **Errores**: Usar excepciones de NestJS (NotFoundException, etc.)
5. **Permisos**: Aplicar permisos apropiados en todos los endpoints
6. **Documentación**: Documentar la estructura de la tabla original
7. **Logging**: Considerar logging para debug en desarrollo

## Ejemplo Completo

Ver la documentación completa en:
`docs/NEW_SISTEMAS_CONNECTION.md`

## Soporte

Para preguntas sobre la conexión o estructura, consultar:
- Documentación de TypeORM: https://typeorm.io
- Documentación de NestJS: https://docs.nestjs.com

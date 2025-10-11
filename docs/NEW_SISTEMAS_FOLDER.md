# Carpeta new_sistemas - Guía Completa

## 📁 Estructura Creada

```
src/new_sistemas/
├── new_sistemas.module.ts              # Módulo principal que agrupa todos los submódulos
├── README.md                           # Documentación de convenciones y buenas prácticas
└── ticket-new/                         # Ejemplo de recurso
    ├── entities/
    │   └── ticket-new.entity.ts       # Entidad mapeada a tabla de new_sistemas
    ├── dto/
    │   └── .gitkeep                   # Placeholder (DTOs generalmente no necesarios)
    ├── ticket-new.controller.ts       # Controlador REST (solo GET)
    ├── ticket-new.service.ts          # Servicio (solo lectura)
    └── ticket-new.module.ts           # Módulo del recurso
```

## ✅ Configuración Completada

### 1. Variables de Entorno
✅ Configuradas en `.env` y `.env.example`:
- `DB_NEW_SISTEMAS_HOST`
- `DB_NEW_SISTEMAS_PORT`
- `DB_NEW_SISTEMAS_USERNAME`
- `DB_NEW_SISTEMAS_PASSWORD`
- `DB_NEW_SISTEMAS_NAME`

### 2. Validación de Variables
✅ Configurada en `src/config/env.validation.ts` con esquema Joi

### 3. Configuración de TypeORM
✅ Archivo: `src/config/typeorm-new-sistemas.config.ts`
- Conexión: `newSistemasConnection`
- `synchronize: false` para evitar modificaciones
- Entidad `TicketNew` registrada

### 4. App Module
✅ Configurado en `src/app.module.ts`:
- Segunda conexión TypeORM agregada
- `NewSistemasModule` importado

### 5. Módulo Ejemplo
✅ `TicketNewModule` creado con:
- Entidad completa con mapeo de tabla
- Servicio con métodos de lectura
- Controlador con endpoints GET
- Autenticación JWT + Permisos

## 🚀 Endpoints Disponibles

El módulo de ejemplo `ticket-new` expone los siguientes endpoints:

### GET /api/new-sistemas/tickets
Obtener todos los tickets
- **Permiso requerido**: `ticket-new:read`
- **Query params opcionales**:
  - `estado`: Filtrar por estado
  - `descripcion`: Buscar en descripción

**Ejemplos**:
```bash
# Todos los tickets
GET http://localhost:3000/api/new-sistemas/tickets

# Por estado
GET http://localhost:3000/api/new-sistemas/tickets?estado=abierto

# Por descripción
GET http://localhost:3000/api/new-sistemas/tickets?descripcion=error
```

### GET /api/new-sistemas/tickets/count
Contar tickets
- **Permiso requerido**: `ticket-new:read`
- **Query params opcionales**:
  - `estado`: Contar solo tickets con este estado

**Ejemplos**:
```bash
# Contar todos
GET http://localhost:3000/api/new-sistemas/tickets/count

# Contar por estado
GET http://localhost:3000/api/new-sistemas/tickets/count?estado=abierto
```

### GET /api/new-sistemas/tickets/:id
Obtener un ticket específico
- **Permiso requerido**: `ticket-new:read`

**Ejemplo**:
```bash
GET http://localhost:3000/api/new-sistemas/tickets/1
```

## 🔐 Seguridad

Todos los endpoints requieren:
1. **Autenticación JWT**: Header `Authorization: Bearer <token>`
2. **Permisos**: El usuario debe tener el permiso `ticket-new:read`

## 📝 Crear un Nuevo Recurso

### Paso 1: Crear la estructura de carpetas

```bash
# Desde src/new_sistemas/
mkdir nombre-recurso
mkdir nombre-recurso/entities
mkdir nombre-recurso/dto
```

### Paso 2: Crear la entidad

```typescript
// src/new_sistemas/nombre-recurso/entities/nombre-recurso.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('nombre_tabla', { schema: 'public' })
export class NombreRecurso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  campo: string;

  // Agregar más campos según la tabla
}
```

### Paso 3: Crear el servicio

```typescript
// src/new_sistemas/nombre-recurso/nombre-recurso.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NombreRecurso } from './entities/nombre-recurso.entity';

@Injectable()
export class NombreRecursoService {
  constructor(
    @InjectRepository(NombreRecurso, 'newSistemasConnection')
    private readonly repository: Repository<NombreRecurso>,
  ) {}

  async findAll(): Promise<NombreRecurso[]> {
    return await this.repository.find();
  }

  async findOne(id: number): Promise<NombreRecurso> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Recurso con ID ${id} no encontrado`);
    }
    return entity;
  }
}
```

### Paso 4: Crear el controlador

```typescript
// src/new_sistemas/nombre-recurso/nombre-recurso.controller.ts
import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NombreRecursoService } from './nombre-recurso.service';
import { RequireRead } from '../../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';

@Controller('new-sistemas/nombre-recurso')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class NombreRecursoController {
  constructor(private readonly service: NombreRecursoService) {}

  @Get()
  @RequireRead('nombre-recurso')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequireRead('nombre-recurso')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
```

### Paso 5: Crear el módulo

```typescript
// src/new_sistemas/nombre-recurso/nombre-recurso.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NombreRecurso } from './entities/nombre-recurso.entity';
import { NombreRecursoService } from './nombre-recurso.service';
import { NombreRecursoController } from './nombre-recurso.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NombreRecurso], 'newSistemasConnection')
  ],
  controllers: [NombreRecursoController],
  providers: [NombreRecursoService],
  exports: [NombreRecursoService],
})
export class NombreRecursoModule {}
```

### Paso 6: Registrar en new_sistemas.module.ts

```typescript
// src/new_sistemas/new_sistemas.module.ts
import { NombreRecursoModule } from './nombre-recurso/nombre-recurso.module';

@Module({
  imports: [
    TicketNewModule,
    NombreRecursoModule, // ⬅️ Agregar aquí
  ],
  exports: [
    TicketNewModule,
    NombreRecursoModule, // ⬅️ Agregar aquí
  ],
})
export class NewSistemasModule {}
```

### Paso 7: Registrar entidad en typeorm-new-sistemas.config.ts

```typescript
// src/config/typeorm-new-sistemas.config.ts
import { NombreRecurso } from '../new_sistemas/nombre-recurso/entities/nombre-recurso.entity';

export const typeOrmNewSistemasConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    // ...
    entities: [
        TicketNew,
        NombreRecurso, // ⬅️ Agregar aquí
    ],
    // ...
});
```

## 🧪 Probar la Conexión

1. Iniciar la aplicación:
```bash
npm run start:dev
```

2. Autenticarse para obtener token JWT:
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "tu_password"
}
```

3. Usar el token para consultar new_sistemas:
```bash
GET http://localhost:3000/api/new-sistemas/tickets
Authorization: Bearer <tu_token_jwt>
```

## ⚠️ Restricciones Importantes

1. **Solo Lectura**: NUNCA implementar métodos de escritura (POST, PUT, PATCH, DELETE)
2. **synchronize: false**: No modificar esta configuración
3. **Permisos BD**: Idealmente el usuario de BD debe tener solo SELECT
4. **Naming**: Mantener convención kebab-case con sufijo `-new` si es necesario
5. **Documentación**: Documentar estructura de tabla original

## 📚 Documentación Adicional

- Ver `src/new_sistemas/README.md` para convenciones detalladas
- Ver `docs/NEW_SISTEMAS_CONNECTION.md` para guía completa de conexión
- Ver código de ejemplo en `src/new_sistemas/ticket-new/`

## 🆘 Troubleshooting

### Error: Cannot connect to database
- Verificar variables de entorno en `.env`
- Verificar que la BD `new_sistemas` existe
- Verificar credenciales de conexión

### Error: Entity not found
- Verificar que la entidad esté registrada en `typeorm-new-sistemas.config.ts`
- Verificar que el nombre de la tabla coincida con la BD

### Error: Permission denied
- Verificar que el usuario tenga el permiso correcto (ej: `ticket-new:read`)
- Crear el permiso en la tabla de permisos si no existe

### Error: Unauthorized
- Verificar que el token JWT sea válido
- Verificar que el header `Authorization` esté presente

## 📊 Estado Actual

- ✅ Conexión a `new_sistemas` configurada
- ✅ Variables de entorno configuradas
- ✅ Módulo principal creado
- ✅ Ejemplo completo (`ticket-new`) implementado
- ✅ Sin errores de compilación
- ✅ Documentación completa

La estructura está lista para agregar más recursos según sea necesario.

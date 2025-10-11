# Sistema de Permisos y Autenticación JWT - API VirtualIT

## Descripción

Este sistema implementa un control de acceso basado en roles (RBAC) con autenticación JWT y las siguientes características:

- **Autenticación JWT** con Passport para seguridad de sesiones
- **Usuarios** pueden tener múltiples **Roles**
- **Roles** pueden tener múltiples **Permisos**
- Verificación automática de permisos en endpoints protegidos
- Sistema consolidado de guards y decoradores en el módulo Auth
- Inicialización automática de permisos y roles por defecto
- Formato de permisos `resource:action` para mejor organización

## Arquitectura

### Autenticación JWT

El sistema utiliza **JSON Web Tokens (JWT)** para la autenticación:

- **Login**: `/api/auth/login` - Autenticación con email/password
- **Token JWT**: Contiene información del usuario y sus permisos
- **Estrategia Passport**: Validación automática de tokens en endpoints protegidos
- **Guards Consolidados**: Sistema unificado en el módulo Auth para mejor rendimiento

#### Proceso de Autenticación:
1. Usuario envía credenciales a `/api/auth/login`
2. Sistema valida email/password con bcrypt
3. Se genera JWT con información del usuario y permisos
4. Cliente incluye token en header: `Authorization: Bearer <token>`
5. Guards verifican token y permisos en cada petición

### Entidades

#### User (Usuario)
- `id`: UUID único
- `email`: Email único para autenticación
- `name`: Nombre completo
- `password`: Contraseña hasheada
- `isActive`: Estado del usuario
- `roles`: Relación Many-to-Many con Rol

**Nota**: Los usuarios mantienen UUID como ID por seguridad y para evitar enumeración externa.

#### Rol
- `id`: ID numérico autoincremental
- `name`: Nombre único del rol
- `description`: Descripción del rol
- `priority`: Prioridad numérica (menor = mayor prioridad)
- `isActive`: Estado del rol
- `isSystem`: Indica si es un rol del sistema (no editable)
- `users`: Relación Many-to-Many con User
- `permisos`: Relación Many-to-Many con Permiso

#### Permiso
- `id`: ID numérico autoincremental
- `name`: Nombre único del permiso
- `description`: Descripción del permiso
- `resource`: Recurso al que aplica (ej: "users", "posts")
- `action`: Acción específica (ej: "read", "create", "update", "delete")
- `isActive`: Estado del permiso
- `roles`: Relación Many-to-Many con Rol

**Nota**: Roles y Permisos utilizan IDs numéricos autoincrementales para optimización de rendimiento y simplicidad en consultas.

### Tablas de Relación
- `user_roles`: Relaciona usuarios con roles
- `rol_permisos`: Relaciona roles con permisos

## Permisos por Defecto

**Formato**: `resource:action` para mejor organización y claridad

### Usuarios
- `user:read`: Leer usuarios
- `user:create`: Crear usuarios
- `user:update`: Actualizar usuarios
- `user:delete`: Eliminar usuarios
- `user:assign-roles`: Gestionar roles de usuarios

### Roles
- `rol:read`: Leer roles
- `rol:create`: Crear roles
- `rol:update`: Actualizar roles
- `rol:delete`: Eliminar roles
- `rol:assign-permissions`: Gestionar permisos de roles

### Permisos
- `permiso:read`: Leer permisos
- `permiso:create`: Crear permisos
- `permiso:update`: Actualizar permisos
- `permiso:delete`: Eliminar permisos

### Dashboard
- `dashboard:access`: Acceder al dashboard
- `dashboard:analytics`: Ver analíticas

### Configuración
- `settings:read`: Leer configuración
- `settings:update`: Actualizar configuración

## Roles por Defecto

### Super Admin
- **Prioridad**: 1
- **Permisos**: Todos los permisos del sistema
- **Características**: Rol del sistema, no editable

### Admin
- **Prioridad**: 10
- **Permisos**: Gestión de usuarios, lectura de roles, dashboard
- **Características**: Gestión administrativa general

### Editor
- **Prioridad**: 50
- **Permisos**: Lectura de usuarios, acceso al dashboard
- **Características**: Gestión de contenido

### Viewer
- **Prioridad**: 100
- **Permisos**: Solo acceso al dashboard
- **Características**: Solo visualización

## Uso del Sistema

### Autenticación con JWT

```typescript
// 1. Login para obtener token
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

// Respuesta:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "admin@example.com",
    "name": "Admin User"
  }
}

// 2. Usar token en requests protegidos
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Decorador de Permisos (Sistema Consolidado)

```typescript
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  
  @Get()
  @RequirePermissions('user:read')
  findAll() {
    // Solo usuarios autenticados con permiso 'user:read' pueden acceder
  }
  
  @Post()
  @RequirePermissions('user:create')
  create() {
    // Requiere autenticación JWT + permiso 'user:create'
  }
  
  @Patch(':id/roles')
  @RequirePermissions('user:assign-roles')
  assignRoles() {
    // Requiere autenticación JWT + permiso 'user:assign-roles'
  }
}
```

### Guard de Permisos Optimizado

El `PermissionsGuard` consolidado verifica permisos directamente desde el token JWT sin consultas adicionales a la base de datos:

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('user:read', 'user:update') // Requiere CUALQUIERA de los permisos
@Put(':id')
updateUser() {
  // Lógica del endpoint
}
```

**Ventajas del sistema consolidado:**
- ✅ **Sin consultas DB adicionales**: Permisos extraídos del JWT
- ✅ **Mejor rendimiento**: Validación sincrónica
- ✅ **Mayor seguridad**: Token contiene información actualizada
- ✅ **Flexibilidad**: Requiere ANY permission (OR logic) en lugar de ALL

### Validaciones de DTOs

El sistema utiliza diferentes validaciones según el tipo de ID:

```typescript
// Para IDs de Usuario (UUID)
@IsUUID('4')
userId: string;

// Para IDs de Rol/Permiso (numéricos)
@IsInt({ each: true })
rolIds: number[];

@IsInt({ each: true })
permisoIds: number[];
```

## Endpoints de la API

### Autenticación (`/api/auth`)
- `POST /login` - Autenticación con email/password, retorna JWT
- `GET /profile` - Obtener perfil del usuario autenticado (requiere JWT)

### Usuarios (`/api/users`)
- `GET /` - Listar usuarios (requiere: `user:read`)
- `GET /:id` - Obtener usuario (requiere: `user:read`)
- `GET /:id/permissions` - Permisos del usuario (requiere: `user:read`)
- `POST /` - Crear usuario (requiere: `user:create`)
- `PUT /:id` - Actualizar usuario (requiere: `user:update`)
- `PATCH /:id/roles` - Asignar roles (requiere: `user:assign-roles`)
- `DELETE /:id/roles` - Remover roles (requiere: `user:assign-roles`)
- `DELETE /:id` - Eliminar usuario (requiere: `user:delete`)

### Roles (`/api/roles`)
- `GET /` - Listar roles (requiere: `rol:read`)
- `GET /:id` - Obtener rol por ID numérico (requiere: `rol:read`)
- `POST /` - Crear rol (requiere: `rol:create`)
- `PUT /:id` - Actualizar rol por ID numérico (requiere: `rol:update`)
- `PATCH /:id/permisos` - Asignar permisos (requiere: `rol:assign-permissions`)
- `DELETE /:id/permisos` - Remover permisos (requiere: `rol:assign-permissions`)
- `DELETE /:id` - Eliminar rol por ID numérico (requiere: `rol:delete`)

### Permisos (`/api/permisos`)
- `GET /` - Listar permisos (requiere: `permiso:read`)
- `GET /:id` - Obtener permiso por ID numérico (requiere: `permiso:read`)
- `POST /` - Crear permiso (requiere: `permiso:create`)
- `PUT /:id` - Actualizar permiso por ID numérico (requiere: `permiso:update`)
- `DELETE /:id` - Eliminar permiso por ID numérico (requiere: `permiso:delete`)

**Nota**: Todos los endpoints (excepto `/auth/login`) requieren autenticación JWT válida.

## Servicios Principales

### AuthService
- Autenticación de usuarios con email/password
- Generación y validación de tokens JWT
- Extracción de permisos de usuario para inclusión en JWT
- Estrategia Passport para validación automática

### UserService
- Gestión CRUD de usuarios
- Asignación y remoción de roles
- Consulta de permisos de usuario
- Verificación de permisos específicos
- Hash de contraseñas con bcrypt

### RolService
- Gestión CRUD de roles
- Asignación y remoción de permisos
- Búsqueda por nombre y validación

### PermisoService
- Gestión CRUD de permisos
- Búsqueda por recurso y acción
- Validación de existencia
- Soporte para formato `resource:action`

### InitializationService
- Creación automática de permisos por defecto (formato nuevo)
- Creación automática de roles por defecto
- Ejecutado al iniciar la aplicación

## Configuración de Base de Datos

Las entidades utilizan las siguientes tablas:

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Tabla de roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  priority INTEGER DEFAULT 1000,
  isActive BOOLEAN DEFAULT TRUE,
  isSystem BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Tabla de permisos
CREATE TABLE permisos (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Tabla de relación usuario-roles
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rol_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, rol_id)
);

-- Tabla de relación rol-permisos
CREATE TABLE rol_permisos (
  rol_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id INTEGER REFERENCES permisos(id) ON DELETE CASCADE,
  PRIMARY KEY (rol_id, permiso_id)
);
```

## Ejemplo de Uso Completo

```typescript
// 1. Autenticación
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
});

const { access_token } = await loginResponse.json();

// 2. Usar token en requests protegidos
const usersResponse = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
});

// 3. Crear un permiso (requiere permiso:create)
const permiso = await permisoService.create({
  name: 'post:read',
  description: 'Leer publicaciones',
  resource: 'post',
  action: 'read'
});

// 4. Crear un rol con permisos (requiere rol:create)
const rol = await rolService.create({
  name: 'blogger',
  description: 'Usuario que puede gestionar publicaciones',
  permisoIds: [permiso.id]
});

// 5. Crear un usuario con roles (requiere user:create)
const user = await userService.create({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'SecurePass123!',
  rolIds: [rol.id]
});

// 6. Verificar permisos
const hasPermission = await userService.hasPermission(user.id, 'post:read');
console.log(hasPermission); // true

// 7. Obtener todos los permisos del usuario
const permissions = await userService.getUserPermissions(user.id);
console.log(permissions); // ['post:read', 'dashboard:access', ...]
```

## Consideraciones de Seguridad

1. **Autenticación JWT**: 
   - Tokens firmados y verificados automáticamente
   - Información del usuario y permisos incluida en el payload
   - Estrategia Passport para validación en cada request

2. **Contraseñas**: Se hashean automáticamente con bcrypt antes del almacenamiento

3. **Soft Delete**: Las eliminaciones son lógicas, no físicas, preservando integridad de datos

4. **Validación**: Todos los DTOs tienen validaciones estrictas con class-validator

5. **Roles del Sistema**: No pueden ser modificados o eliminados (isSystem: true)

6. **Verificación de Permisos**: 
   - Realizada en cada petición protegida
   - Basada en información del JWT (sin consultas DB adicionales)
   - Lógica OR: requiere cualquiera de los permisos especificados

7. **IDs de Usuario**: Se utilizan UUIDs para usuarios para evitar enumeración externa

8. **IDs de Rol/Permiso**: Se utilizan IDs numéricos para optimización de rendimiento interno

9. **Middleware de Seguridad**: Guards consolidados en módulo Auth para mejor control

10. **Sesiones Stateless**: JWT permite escalabilidad horizontal sin estado de sesión

## Extensibilidad

El sistema está diseñado para ser fácilmente extensible:

1. **Nuevos Permisos**: Agregar en `InitializationService` usando formato `resource:action`
2. **Nuevos Roles**: Definir en la configuración inicial con permisos específicos
3. **Recursos Personalizados**: Crear permisos específicos por módulo (ej: `blog:write`, `comment:moderate`)
4. **Acciones Específicas**: Definir acciones granulares por funcionalidad
5. **Módulos Auth**: Sistema consolidado permite fácil extensión de guards y decoradores
6. **JWT Payload**: Personalizable para incluir información adicional según necesidades

### Ventajas del Sistema Actual

#### **Autenticación JWT:**
- ✅ **Stateless**: Sin necesidad de almacenar sesiones en servidor
- ✅ **Escalable**: Funciona perfectamente en arquitecturas distribuidas
- ✅ **Secure**: Tokens firmados y verificados automáticamente
- ✅ **Performance**: No consultas DB para validar cada request

#### **Sistema de Permisos Consolidado:**
- ✅ **Unified Guards**: Un solo sistema en módulo Auth
- ✅ **Better Performance**: Validación sincrónica desde JWT
- ✅ **Flexible Logic**: OR permissions en lugar de AND
- ✅ **Maintainable**: Menos duplicación de código

#### **Formato `resource:action`:**
- ✅ **Readable**: Permisos más claros y organizados
- ✅ **Consistent**: Estructura uniforme en toda la aplicación
- ✅ **Scalable**: Fácil de extender con nuevos recursos
- ✅ **RESTful**: Alineado con convenciones REST

### Ventajas del Sistema Híbrido de IDs

- **Usuarios (UUID)**: Seguridad externa, prevención de enumeración, URLs no predecibles
- **Roles/Permisos (Numéricos)**: Optimización interna, URLs más limpias, mejor performance
- **Mejor rendimiento**: Consultas más eficientes en tablas de relación Many-to-Many
- **Flexibilidad**: Diferentes estrategias según el caso de uso y nivel de exposición

## Estructura del JWT

### Payload del Token

El JWT contiene la siguiente información:

```json
{
  "sub": "uuid-del-usuario",
  "email": "usuario@example.com",
  "name": "Nombre Completo",
  "permissions": [
    "user:read",
    "user:create", 
    "dashboard:access",
    "settings:read"
  ],
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Ventajas de incluir Permisos en JWT:
- ✅ **Sin consultas DB**: Permisos disponibles inmediatamente
- ✅ **Performance**: Validación O(1) en lugar de O(n) queries
- ✅ **Escalabilidad**: Stateless, funciona en múltiples servidores
- ✅ **Caching**: No necesita invalidación de caché de permisos

## Testing con Insomnia

### Colección de Endpoints

Se incluye una colección de Insomnia (`scripts/insomnia-endpoints.json`) con:

#### **Autenticación:**
- `POST /auth/login` - Login con credenciales
- `GET /auth/profile` - Perfil del usuario autenticado

#### **Usuarios:**
- `GET /users` - Listar usuarios
- `GET /users/:id` - Obtener usuario específico
- `POST /users` - Crear nuevo usuario
- `PUT /users/:id` - Actualizar usuario
- `PATCH /users/:id/roles` - Asignar roles
- `DELETE /users/:id` - Eliminar usuario

#### **Roles:**
- `GET /roles` - Listar roles
- `GET /roles/:id` - Obtener rol específico
- `POST /roles` - Crear nuevo rol
- `PUT /roles/:id` - Actualizar rol
- `PATCH /roles/:id/permisos` - Asignar permisos

#### **Permisos:**
- `GET /permisos` - Listar permisos
- `POST /permisos` - Crear nuevo permiso

### Variables de Entorno Insomnia:
- `base_url`: http://localhost:3000/api
- `jwt_token`: Se actualiza automáticamente tras login exitoso

### Uso de la Colección:
1. Importar `scripts/insomnia-endpoints.json` en Insomnia
2. Ejecutar `POST /auth/login` con credenciales válidas
3. El token JWT se guarda automáticamente en variable `jwt_token`
4. Usar otros endpoints que requieren autenticación

---

## Resumen del Sistema

Este sistema RBAC con JWT proporciona:

- 🔐 **Autenticación robusta** con JWT y Passport
- 🛡️ **Autorización granular** con sistema de permisos `resource:action`
- ⚡ **Alto rendimiento** con guards consolidados y validación desde JWT
- 🔧 **Fácil mantenimiento** con arquitectura modular y código unificado
- 📈 **Escalabilidad** con sesiones stateless y arquitectura distribuible
- 🧪 **Testing completo** con colección Insomnia lista para usar

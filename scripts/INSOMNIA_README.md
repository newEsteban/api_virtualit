# 🚀 Insomnia Collection - VirtualIT API

Esta colección contiene todos los endpoints del sistema de permisos de la API VirtualIT con configuración optimizada de autenticación JWT.

## 📋 **Contenido de la Colección**

### 🏠 **App General**
- **Health Check**: Verificar que la API está funcionando

### 🔐 **Autenticación** (`/api/auth`)
- **POST** `/auth/login` - Login con email y contraseña (invalida tokens anteriores)
- **GET** `/auth/profile` - Obtener perfil del usuario autenticado
- **GET** `/auth/permissions` - Verificar permisos del usuario
- **GET** `/auth/verify` - Verificar validez del token JWT
- **POST** `/auth/logout` - Cerrar sesión (invalidar token actual)
- **POST** `/auth/logout-all` - Cerrar todas las sesiones del usuario
- **GET** `/auth/token-status` - Verificar estado detallado del token

### 👥 **Usuarios** (`/api/users`)
- **POST** `/users` - Crear usuario
- **GET** `/users` - Listar usuarios
- **GET** `/users/:id` - Obtener usuario por ID
- **GET** `/users/:id/permissions` - Obtener permisos del usuario
- **PUT** `/users/:id` - Actualizar usuario
- **PATCH** `/users/:id/roles` - Asignar roles a usuario
- **DELETE** `/users/:id/roles` - Remover roles de usuario
- **DELETE** `/users/:id` - Eliminar usuario

### 🎭 **Roles** (`/api/roles`)
- **POST** `/roles` - Crear rol
- **GET** `/roles` - Listar roles
- **GET** `/roles/:id` - Obtener rol por ID
- **PUT** `/roles/:id` - Actualizar rol
- **PATCH** `/roles/:id/permisos` - Asignar permisos a rol
- **DELETE** `/roles/:id/permisos` - Remover permisos de rol
- **DELETE** `/roles/:id` - Eliminar rol

### 🔐 **Permisos** (`/api/permisos`)
- **POST** `/permisos` - Crear permiso
- **GET** `/permisos` - Listar permisos
- **GET** `/permisos/:id` - Obtener permiso por ID
- **PUT** `/permisos/:id` - Actualizar permiso
- **DELETE** `/permisos/:id` - Eliminar permiso

## 🔧 **Cómo Importar en Insomnia**

### Paso 1: Abrir Insomnia
1. Abre la aplicación **Insomnia**
2. Ve a la pestaña **Collections**

### Paso 2: Importar Colección
1. Haz clic en **"Import/Export"** o usa `Ctrl+Shift+I`
2. Selecciona **"Import Data"**
3. Elige **"From File"**
4. Navega hasta `scripts/insomnia-endpoints.json`
5. Haz clic en **"Import"**

### Paso 3: Configurar Variables de Entorno
La colección incluye variables de entorno preconfiguradas:
- `base_url`: `http://localhost:3000`
- `api_prefix`: `api`
- `jwt_token`: Token JWT (se actualiza automáticamente después del login)

## � **Configuración de Autenticación JWT**

### **Método Recomendado: Auth Tab de Insomnia**

1. **Ejecutar Login**: 
   - Usa el endpoint `POST /auth/login` sin autenticación
   - Obtienes el `access_token` en la respuesta

2. **Configurar Bearer Token**:
   - En cada request protegido, ve a la pestaña **"Auth"**
   - Selecciona **"Bearer Token"** como tipo
   - En el campo **Token**, usa: `{{ _.jwt_token }}`
   
3. **Actualización Automática**:
   - El token se actualiza automáticamente desde el response del login
   - No necesitas copiar/pegar manualmente

### **Variables de Entorno Incluidas:**
- `{{ base_url }}` = `http://localhost:3000`
- `{{ api_prefix }}` = `api`
- `{{ _.jwt_token }}` = Token JWT actualizado automáticamente

## � **Flujo de Autenticación Completo**

### 1. **Login y Obtener Token**
```json
POST /api/auth/login
{
  "email": "admin@virtualit.com", 
  "password": "Admin123!"
}

// Response (token se guarda automáticamente):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid-user-id",
    "email": "admin@virtualit.com",
    "name": "Administrador Sistema",
    "roles": ["admin"],
    "permissions": ["user:read", "user:create"]
  }
}
```

### 2. **Verificar Token**
```json
GET /api/auth/verify
// Auth Tab: Bearer Token = {{ _.jwt_token }}
```

### 3. **Logout (Invalidar Token)**
```json
POST /api/auth/logout
// Auth Tab: Bearer Token = {{ _.jwt_token }}
// Response: Token se invalida
```

### 4. **Verificar Estado del Token**
```json
GET /api/auth/token-status
// Auth Tab: Bearer Token = {{ _.jwt_token }}

// Response:
{
  "isValid": true,
  "isBlacklisted": false,
  "user": { ... },
  "tokenStats": {
    "totalBlacklisted": 2,
    "activeBlacklisted": 1,
    "activeUsers": 3
  }
}
```

## 🆕 **Nuevas Características de Logout**

### **Token Único por Usuario**
- ✅ **Cada login invalida el token anterior automáticamente**
- ✅ **Solo un token activo por usuario**
- ✅ **Mayor seguridad**

### **Endpoints de Logout**
```json
// Logout individual
POST /api/auth/logout

// Logout de todos los dispositivos  
POST /api/auth/logout-all

// Verificar estado del token
GET /api/auth/token-status
```

## 📋 **Ejemplos de Uso CRUD**

## 🚀 **Novedades en la Colección Actualizada**

### **🔐 Autenticación Optimizada**
- ✅ **Auth Tab de Insomnia**: Todos los endpoints usan Bearer Token en lugar de headers manuales
- ✅ **Actualización Automática**: El token se guarda automáticamente después del login
- ✅ **Limpieza Automática**: El token se elimina automáticamente después del logout

### **🆕 Nuevos Endpoints de Logout**
- ✅ `POST /auth/logout` - Logout individual con limpieza automática del token
- ✅ `POST /auth/logout-all` - Logout de todas las sesiones
- ✅ `GET /auth/token-status` - Estado detallado del token con estadísticas

### **🎯 Token Único por Usuario**
- ✅ **Login invalida tokens anteriores automáticamente**
- ✅ **Solo un token activo por usuario**
- ✅ **Mayor seguridad sin complejidad**

### **🔧 Mejoras de UX en Insomnia**
- ✅ **Emojis en nombres** para mejor identificación visual
- ✅ **Descripciones detalladas** en cada endpoint
- ✅ **Tests automáticos** para manejo de tokens
- ✅ **Variables de entorno** optimizadas

## 🎯 **Instrucciones de Uso Rápido**

1. **Importar colección** desde `scripts/insomnia-endpoints.json`
2. **Ejecutar Login** - El token se guarda automáticamente
3. **Usar cualquier endpoint** - La autenticación funciona automáticamente
4. **Logout cuando termines** - El token se limpia automáticamente

¡Ya no necesitas copiar/pegar tokens manualmente!

## 📱 **Testing del Sistema de Logout**

### **Probar Token Único por Usuario:**
```bash
1. Login desde Insomnia → Token_A activo
2. Login nuevamente → Token_A invalidado, Token_B activo  
3. Usar Token_A en otro cliente → 401 Unauthorized
4. Usar Token_B en Insomnia → 200 OK
```

### **Probar Logout:**
```bash
1. Login → Token activo
2. Verificar con /auth/verify → 200 OK
3. Logout con /auth/logout → Token invalidado
4. Verificar con /auth/verify → 401 Unauthorized
```

### **Verificar Estado:**
```bash
GET /auth/token-status
// Response muestra estadísticas del sistema:
{
  "isValid": true,
  "isBlacklisted": false,
  "tokenStats": {
    "totalBlacklisted": 5,
    "activeBlacklisted": 2, 
    "activeUsers": 3
  }
}
```
## 📋 **Ejemplos de Uso CRUD**

### 1. **Crear un Usuario**
```json
POST /api/users
// Auth: Bearer Token (automático)
{
  "email": "nuevo@virtualit.com",
  "password": "Password123!",
  "name": "Usuario Nuevo",
  "rolIds": [2]
}
```

### 2. **Crear un Rol**
```json
POST /api/roles
// Auth: Bearer Token (automático)  
{
  "name": "moderator",
  "description": "Rol de moderador con permisos limitados",
  "priority": 10,
  "permisoIds": [1, 2, 5]
}
```

### 3. **Crear un Permiso**
```json
POST /api/permisos
// Auth: Bearer Token (automático)
{
  "name": "posts:publish", 
  "description": "Permiso para publicar posts",
  "resource": "posts",
  "action": "publish"
}
```

### 4. **Asignar Roles a Usuario**
```json
PATCH /api/users/{user_id}/roles
// Auth: Bearer Token (automático)
{
  "roleIds": [1, 2, 3]
}
```

### 5. **Asignar Permisos a Rol**
```json
PATCH /api/roles/{role_id}/permisos
// Auth: Bearer Token (automático)
{
  "permisoIds": [1, 2, 3, 4, 5]
}
```

## 🎉 **Ventajas de la Nueva Configuración**

### **✅ Mejor Experiencia**
- **Sin copiar/pegar tokens**: Todo automático
- **Interfaz visual clara**: Emojis y nombres descriptivos
- **Tests automáticos**: Manejo inteligente de tokens

### **✅ Mayor Seguridad** 
- **Token único**: Solo un token activo por usuario
- **Logout real**: Invalidación efectiva de tokens
- **Blacklist inteligente**: Limpieza automática de memoria

### **✅ Facilidad de Uso**
- **Auth Tab nativa**: Configuración estándar de Insomnia
- **Variables automáticas**: No necesitas configurar nada
- **Documentación completa**: Cada endpoint bien documentado

## 🔧 **Solución de Problemas**

### **Token no se guarda automáticamente:**
1. Verifica que el endpoint de login tenga el test "Save JWT Token"
2. Asegúrate de estar en el environment correcto (Development)

### **401 Unauthorized después de login:**  
1. Verifica que `{{ _.jwt_token }}` tenga valor en el environment
2. Comprueba que el endpoint use "Bearer Token" en Auth Tab

### **Logout no limpia el token:**
1. Verifica que el endpoint de logout tenga el test "Clear JWT Token"
2. Revisa que el response sea 200 OK

## 📞 **Soporte**

Si tienes problemas con la colección:
1. Verifica que la API esté ejecutándose en `http://localhost:3000`
2. Revisa que tengas las credenciales correctas: `admin@virtualit.com` / `Admin123!`
3. Asegúrate de usar la última versión del archivo `insomnia-endpoints.json`

## 🎯 **Flujo Completo de Testing**

```bash
1. 🔑 Login → Token guardado automáticamente
2. ✅ Verify → Confirmar token válido
3. 👤 Profile → Obtener datos del usuario  
4. 🔐 Permissions → Ver permisos disponibles
5. 📊 Token Status → Verificar estadísticas
6. 🚪 Logout → Invalidar token y limpiar
7. ❌ Verify → Confirmar token invalidado (401)
```

¡Listo para usar! 🚀

### 2. **Crear un Rol**
```json
POST /api/roles
{
  "nombre": "Editor",
  "descripcion": "Rol para editores de contenido",
  "prioridad": 5,
  "permisoIds": [1, 2, 3]
}
```

### 3. **Crear un Permiso**
```json
POST /api/permisos
{
  "recurso": "posts",
  "accion": "create",
  "descripcion": "Permiso para crear nuevos posts"
}
```

### 4. **Asignar Roles a Usuario**
```json
PATCH /api/users/{user_id}/roles
{
  "roleIds": [1, 2, 3]
}
```

### 5. **Asignar Permisos a Rol**
```json
PATCH /api/roles/{role_id}/permisos
{
  "permisoIds": [1, 2, 3, 4]
}
```

## 🔍 **Variables de Plantilla**

Algunos endpoints usan variables de plantilla que debes reemplazar:

- `{{ user_id }}`: UUID del usuario (ej: `123e4567-e89b-12d3-a456-426614174000`)
- `{{ role_id }}`: ID numérico del rol (ej: `1`, `2`, `3`)
- `{{ permiso_id }}`: ID numérico del permiso (ej: `1`, `2`, `3`)

## 🏃‍♂️ **Flujo de Pruebas Recomendado**

### 1. **Verificar API**
- Ejecutar **Health Check**

### 2. **Autenticación**
1. Ejecutar **Login Usuario** con credenciales válidas
2. Copiar el `access_token` del response
3. Actualizar la variable `jwt_token` en el environment
4. Probar **Verificar Token** para confirmar autenticación

### 3. **Crear Datos Base**
1. Crear algunos **permisos** básicos
2. Crear **roles** y asignarles permisos
3. Crear **usuarios** y asignarles roles

### 3. **Probar Funcionalidades**
1. Listar usuarios, roles y permisos
2. Obtener detalles individuales
3. Probar asignación/remoción de roles y permisos
4. Verificar permisos de usuarios

### 4. **Pruebas de Actualización**
1. Actualizar usuarios, roles y permisos
2. Verificar cambios

### 5. **Pruebas de Eliminación**
1. Probar eliminación de relaciones
2. Probar eliminación de entidades

## ⚠️ **Notas Importantes**

- **IDs de Usuario**: Usar formato UUID
- **IDs de Rol/Permiso**: Usar números enteros
- **Autenticación**: Actualmente no implementada en los endpoints
- **Validaciones**: Todos los endpoints incluyen validaciones de datos
- **Relaciones**: Las relaciones Many-to-Many se manejan automáticamente

## 🐛 **Troubleshooting**

### Problema: "Cannot connect to server"
- Verificar que la aplicación esté corriendo en `http://localhost:3000`
- Comprobar que no hay conflictos de puerto

### Problema: "Validation failed"
- Revisar que los datos enviados cumplan las validaciones
- Verificar tipos de datos (string, number, boolean)
- Comprobar longitudes mínimas/máximas

### Problema: "Entity not found"
- Verificar que los IDs existan en la base de datos
- Usar los formatos correctos (UUID para usuarios, números para roles/permisos)

## 📚 **Recursos Adicionales**

- **Documentación del Proyecto**: `README.md`
- **Sistema de Permisos**: `PERMISSIONS_SYSTEM.md`
- **Código Fuente**: `/src` directory

---

**¡Listo para probar todos los endpoints del sistema de permisos!** 🎉

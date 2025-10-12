# 🧪 Ejemplos de uso - GitLab API

Este archivo contiene ejemplos prácticos para usar la integración con GitLab.

## 🔧 Configuración Inicial

### 1. Configurar Variables de Entorno

```bash
# En tu archivo .env
GITLAB_ENABLED=true
GITLAB_BASE_URL=https://gitlab.com/api/v4
GITLAB_ACCESS_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
GITLAB_DEFAULT_PROJECT_ID=12345
```

### 2. Verificar Salud del Servicio

```bash
curl -X GET http://localhost:3000/api/gitlab/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "message": "GitLab API funcionando correctamente",
  "enabled": true,
  "baseUrl": "https://gitlab.com/api/v4",
  "defaultProjectId": 12345,
  "hasToken": true,
  "user": {
    "id": 123,
    "username": "tu_usuario",
    "name": "Tu Nombre"
  }
}
```

## 📁 Gestión de Proyectos

### Listar Proyectos

```bash
curl -X GET http://localhost:3000/api/gitlab/projects
```

### Obtener Proyecto Específico

```bash
curl -X GET http://localhost:3000/api/gitlab/projects/12345
```

### Crear Nuevo Proyecto

```bash
curl -X POST http://localhost:3000/api/gitlab/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Proyecto API",
    "description": "Proyecto creado desde la API",
    "visibility": "private",
    "issues_enabled": true,
    "merge_requests_enabled": true
  }'
```

## 🎫 Gestión de Issues

### Crear Issue Básico

```bash
curl -X POST http://localhost:3000/api/gitlab/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug en el login",
    "description": "Los usuarios no pueden iniciar sesión con Google",
    "project_id": 12345,
    "labels": ["bug", "authentication"]
  }'
```

### Crear Issue Completo

```bash
curl -X POST http://localhost:3000/api/gitlab/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implementar notificaciones push",
    "description": "## Descripción\n\nImplementar sistema de notificaciones push para móvil.\n\n## Criterios de Aceptación\n\n- [ ] Configurar Firebase\n- [ ] Crear servicio de notificaciones\n- [ ] Testing en Android/iOS",
    "project_id": 12345,
    "labels": ["feature", "mobile", "notifications"],
    "assignee_id": 456,
    "milestone_id": 789,
    "due_date": "2024-12-31",
    "issue_type": "task",
    "weight": 5
  }'
```

### Listar Issues con Filtros

```bash
# Issues abiertos
curl -X GET "http://localhost:3000/api/gitlab/issues?state=opened"

# Issues con labels específicos
curl -X GET "http://localhost:3000/api/gitlab/issues?labels=bug,critical"

# Issues asignados a usuario específico
curl -X GET "http://localhost:3000/api/gitlab/issues?assignee_id=456"

# Issues creados esta semana
curl -X GET "http://localhost:3000/api/gitlab/issues?created_after=2024-01-01T00:00:00Z"

# Búsqueda en título/descripción
curl -X GET "http://localhost:3000/api/gitlab/issues?search=authentication"

# Paginación
curl -X GET "http://localhost:3000/api/gitlab/issues?page=2&per_page=10"
```

### Actualizar Issue

```bash
curl -X PUT http://localhost:3000/api/gitlab/issues/123 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Título actualizado",
    "description": "Descripción actualizada",
    "labels": ["bug", "fixed"],
    "assignee_id": 789
  }'
```

### Cerrar Issue

```bash
curl -X PUT http://localhost:3000/api/gitlab/issues/123/close?project_id=12345
```

### Reabrir Issue

```bash
curl -X PUT http://localhost:3000/api/gitlab/issues/123/reopen?project_id=12345
```

## 🔄 Merge Requests

### Crear Merge Request

```bash
curl -X POST http://localhost:3000/api/gitlab/merge-requests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Feature: Sistema de notificaciones",
    "description": "## Cambios\n\n- Implementado servicio de notificaciones\n- Agregados tests unitarios\n- Actualizada documentación\n\n## Testing\n\n- [x] Tests unitarios\n- [x] Tests de integración\n- [ ] Tests E2E",
    "source_branch": "feature/notifications",
    "target_branch": "main",
    "project_id": 12345,
    "labels": ["feature", "ready-for-review"],
    "assignee_id": 456,
    "remove_source_branch": true
  }'
```

### Listar Merge Requests

```bash
curl -X GET "http://localhost:3000/api/gitlab/merge-requests?project_id=12345"
```

## 👥 Usuarios y Metadatos

### Obtener Usuario Actual

```bash
curl -X GET http://localhost:3000/api/gitlab/user
```

### Usuarios del Proyecto

```bash
curl -X GET http://localhost:3000/api/gitlab/projects/12345/users
```

### Branches del Proyecto

```bash
curl -X GET http://localhost:3000/api/gitlab/projects/12345/branches
```

### Labels del Proyecto

```bash
curl -X GET http://localhost:3000/api/gitlab/projects/12345/labels
```

### Milestones del Proyecto

```bash
curl -X GET http://localhost:3000/api/gitlab/projects/12345/milestones
```

### Pipelines del Proyecto

```bash
curl -X GET http://localhost:3000/api/gitlab/projects/12345/pipelines
```

### Commits del Proyecto

```bash
# Todos los commits
curl -X GET http://localhost:3000/api/gitlab/projects/12345/commits

# Commits de una branch específica
curl -X GET "http://localhost:3000/api/gitlab/projects/12345/commits?ref_name=main"
```

## 🎯 Casos de Uso Prácticos

### 1. Workflow: Ticket → Issue

```bash
# 1. Crear issue desde ticket
curl -X POST http://localhost:3000/api/gitlab/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ticket #1234: Error en el proceso de pago",
    "description": "**Ticket ID:** 1234\n\n**Usuario:** cliente@empresa.com\n\n**Descripción:**\nEl usuario reporta que no puede completar el pago con tarjeta de crédito.\n\n**Pasos para reproducir:**\n1. Agregar items al carrito\n2. Proceder al checkout\n3. Ingresar datos de tarjeta\n4. Hacer clic en \"Pagar\"\n\n**Resultado esperado:** Pago exitoso\n**Resultado actual:** Error 500",
    "labels": ["bug", "payment", "urgent", "from-ticket"]
  }'

# 2. Actualizar el ticket en tu sistema con el issue_id creado
```

### 2. Workflow: Reporte de Bugs Automático

```bash
# Crear issue con información detallada de error
curl -X POST http://localhost:3000/api/gitlab/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🐛 Error automático detectado: NullPointerException",
    "description": "## Error Detectado Automáticamente\n\n**Timestamp:** 2024-01-15T10:30:00Z\n**Environment:** Production\n**User ID:** 12345\n**Session ID:** abc123\n\n## Stack Trace\n\n```\nNullPointerException at PaymentService.processPayment()\n  at PaymentController.handlePayment()\n  at RequestHandler.handle()\n```\n\n## Request Info\n\n- **IP:** 192.168.1.100\n- **User Agent:** Chrome/96.0\n- **Endpoint:** POST /api/payments\n\n## Next Steps\n\n- [ ] Revisar logs completos\n- [ ] Reproducir en staging\n- [ ] Crear fix\n- [ ] Deploy y testing",
    "labels": ["bug", "auto-generated", "production", "critical"],
    "issue_type": "incident"
  }'
```

### 3. Workflow: Release Planning

```bash
# 1. Crear milestone para nueva versión
curl -X POST http://localhost:3000/api/gitlab/projects/12345/milestones \
  -H "Content-Type: application/json" \
  -d '{
    "title": "v2.1.0",
    "description": "Release con nuevas funcionalidades de notificaciones",
    "due_date": "2024-02-29"
  }'

# 2. Crear issues para cada feature
curl -X POST http://localhost:3000/api/gitlab/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Feature: Push notifications para móvil",
    "description": "Implementar notificaciones push usando Firebase",
    "labels": ["feature", "mobile", "v2.1.0"],
    "milestone_id": 123,
    "issue_type": "task"
  }'
```

## 🔍 Debugging y Troubleshooting

### Verificar Configuración

```bash
# Verificar que GitLab esté habilitado
curl -X GET http://localhost:3000/api/gitlab/health

# Verificar token y permisos
curl -X GET http://localhost:3000/api/gitlab/user
```

### Errores Comunes

#### 1. Token Inválido

```json
{
  "statusCode": 400,
  "message": "Error obteniendo usuario: GitLab API Error en obtener usuario actual: 401 Unauthorized"
}
```

**Solución:** Verificar que el token sea válido y tenga los permisos necesarios.

#### 2. Proyecto No Encontrado

```json
{
  "statusCode": 400,
  "message": "Error obteniendo proyecto: GitLab API Error en obtener proyecto 12345: 404 Not Found"
}
```

**Solución:** Verificar que el project_id sea correcto y que tengas acceso al proyecto.

#### 3. GitLab Deshabilitado

```json
{
  "status": "disabled",
  "message": "GitLab API está deshabilitada",
  "enabled": false
}
```

**Solución:** Configurar `GITLAB_ENABLED=true` en el archivo `.env`.

## 📊 Monitoreo y Logs

Los logs incluyen información detallada sobre cada operación:

```
[GitLabController] 🔍 Verificando salud del servicio GitLab...
[GitLabService] 🔓 GitLab API habilitada y configurada correctamente
[GitLabService] 🌐 GitLab API Request: GET /user
[GitLabService] ✅ GitLab API Response: 200 OK
[GitLabService] 👤 Usuario actual: John Doe (@johndoe)
```

## 🎉 ¡Listo para Usar!

Con estos ejemplos puedes empezar a integrar GitLab en tu aplicación. Recuerda:

- ✅ Configurar correctamente las variables de entorno
- ✅ Usar tokens con los permisos necesarios
- ✅ Manejar errores apropiadamente
- ✅ Revisar logs para debugging
- ✅ Respetar los rate limits de GitLab

¡Happy coding! 🚀
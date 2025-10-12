# 🦊 GitLab API Integration

## 📋 Resumen

Integración completa con la API de GitLab v4 que permite gestionar proyectos, issues, merge requests, usuarios y más desde la aplicación NestJS.

## 🚀 Características

### ✅ Funcionalidades Implementadas

- **Proyectos**: Crear, listar y obtener proyectos
- **Issues**: CRUD completo de issues con filtros avanzados
- **Merge Requests**: Crear y gestionar merge requests
- **Usuarios**: Obtener usuarios del proyecto y usuario actual
- **Metadatos**: Branches, commits, pipelines, labels, milestones
- **Configuración condicional**: Habilitar/deshabilitar según entorno
- **Manejo de errores**: Logs detallados y respuestas consistentes

## ⚙️ Configuración

### Variables de Entorno

Agregar al archivo `.env`:

```bash
# GitLab API Configuration
GITLAB_ENABLED=true
GITLAB_BASE_URL=https://gitlab.com/api/v4
GITLAB_ACCESS_TOKEN=your_gitlab_access_token_here
GITLAB_DEFAULT_PROJECT_ID=12345
```

### Obtener Access Token

1. Ir a GitLab → User Settings → Access Tokens
2. Crear token con scopes: `api`, `read_user`, `read_repository`
3. Copiar el token en `GITLAB_ACCESS_TOKEN`

### Encontrar Project ID

```bash
# En GitLab, ir al proyecto → Settings → General
# O usar la API:
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://gitlab.com/api/v4/projects?search=PROJECT_NAME"
```

## 🌐 API Endpoints

### Salud y Configuración

```bash
# Verificar estado del servicio
GET /api/gitlab/health

# Obtener usuario actual
GET /api/gitlab/user
```

### Proyectos

```bash
# Listar todos los proyectos
GET /api/gitlab/projects

# Obtener proyecto específico
GET /api/gitlab/projects/{id}

# Crear nuevo proyecto
POST /api/gitlab/projects
Content-Type: application/json
{
  "name": "Mi Nuevo Proyecto",
  "description": "Descripción del proyecto",
  "visibility": "private"
}
```

### Issues

```bash
# Listar issues con filtros
GET /api/gitlab/issues?project_id=123&state=opened&labels=bug,feature

# Obtener issue específico
GET /api/gitlab/issues/{iid}?project_id=123

# Crear nuevo issue
POST /api/gitlab/issues
Content-Type: application/json
{
  "title": "Nuevo bug encontrado",
  "description": "Descripción detallada del problema",
  "project_id": 123,
  "labels": ["bug", "high-priority"],
  "assignee_id": 456
}

# Actualizar issue
PUT /api/gitlab/issues/{iid}?project_id=123
Content-Type: application/json
{
  "title": "Título actualizado",
  "state_event": "closed"
}

# Cerrar issue
PUT /api/gitlab/issues/{iid}/close?project_id=123

# Reabrir issue
PUT /api/gitlab/issues/{iid}/reopen?project_id=123
```

### Merge Requests

```bash
# Listar merge requests
GET /api/gitlab/merge-requests?project_id=123

# Crear merge request
POST /api/gitlab/merge-requests
Content-Type: application/json
{
  "title": "Feature: Nueva funcionalidad",
  "source_branch": "feature/nueva-funcionalidad",
  "target_branch": "main",
  "project_id": 123,
  "description": "Implementación de nueva funcionalidad"
}
```

### Metadatos del Proyecto

```bash
# Usuarios del proyecto
GET /api/gitlab/projects/{id}/users

# Branches del proyecto
GET /api/gitlab/projects/{id}/branches

# Labels del proyecto
GET /api/gitlab/projects/{id}/labels

# Milestones del proyecto
GET /api/gitlab/projects/{id}/milestones

# Pipelines del proyecto
GET /api/gitlab/projects/{id}/pipelines

# Commits del proyecto
GET /api/gitlab/projects/{id}/commits?ref_name=main
```

## 📊 Filtros de Issues

### Parámetros de Query Disponibles

```typescript
interface FilterIssuesDto {
  state?: 'opened' | 'closed' | 'all';           // Estado del issue
  labels?: string[];                              // Array de labels
  assignee_id?: number;                           // ID del asignado
  author_id?: number;                             // ID del autor
  milestone_id?: number;                          // ID del milestone
  sort?: 'created_at' | 'updated_at' | 'priority'; // Campo de ordenamiento
  order_by?: 'asc' | 'desc';                     // Dirección del ordenamiento
  search?: string;                                // Búsqueda en título/descripción
  created_after?: string;                         // Fecha ISO 8601
  created_before?: string;                        // Fecha ISO 8601
  updated_after?: string;                         // Fecha ISO 8601
  updated_before?: string;                        // Fecha ISO 8601
  page?: number;                                  // Número de página
  per_page?: number;                              // Elementos por página
}
```

### Ejemplos de Filtros

```bash
# Issues abiertos con label "bug"
GET /api/gitlab/issues?state=opened&labels=bug

# Issues asignados a usuario específico
GET /api/gitlab/issues?assignee_id=123

# Issues creados esta semana
GET /api/gitlab/issues?created_after=2024-01-01T00:00:00Z

# Issues con búsqueda en título
GET /api/gitlab/issues?search=authentication

# Paginación
GET /api/gitlab/issues?page=2&per_page=10
```

## 🛡️ Manejo de Errores

### Respuestas de Error Consistentes

```json
{
  "statusCode": 400,
  "message": "Error creando issue: Invalid project ID",
  "error": "Bad Request"
}
```

### Estados de Conexión

```json
// GitLab habilitado y funcionando
{
  "status": "healthy",
  "message": "GitLab API funcionando correctamente",
  "enabled": true,
  "baseUrl": "https://gitlab.com/api/v4",
  "defaultProjectId": 12345,
  "hasToken": true,
  "user": {
    "id": 123,
    "username": "usuario",
    "name": "Usuario Nombre"
  }
}

// GitLab deshabilitado
{
  "status": "disabled",
  "message": "GitLab API está deshabilitada",
  "enabled": false
}
```

## 🔧 Integración en Código

### Inyectar el Servicio

```typescript
import { Injectable } from '@nestjs/common';
import { GitLabService } from './gitlab/services/gitlab.service';

@Injectable()
export class MiServicio {
  constructor(private readonly gitlabService: GitLabService) {}

  async crearIssueDesdeTicket(ticket: Ticket) {
    const issue = await this.gitlabService.createIssue({
      title: `Ticket #${ticket.id}: ${ticket.descripcion}`,
      description: ticket.descripcion,
      labels: ['from-api', 'ticket'],
      project_id: 12345
    });

    return issue;
  }
}
```

### Usar en Controladores

```typescript
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly gitlabService: GitLabService
  ) {}

  @Post(':id/create-issue')
  async crearIssueParaTicket(@Param('id') ticketId: number) {
    const ticket = await this.ticketService.findOne(ticketId);
    
    const issue = await this.gitlabService.createIssue({
      title: `Ticket #${ticket.id}: ${ticket.descripcion}`,
      description: `Issue creado automáticamente desde ticket #${ticket.id}`,
      project_id: 12345
    });

    return { ticket, issue };
  }
}
```

## 🎯 Casos de Uso Comunes

### 1. Sincronizar Tickets con Issues

```typescript
// Crear issue automáticamente cuando se crea un ticket
async sincronizarTicketConGitLab(ticket: Ticket) {
  if (ticket.clasificacion?.sincronizar_gitlab) {
    return await this.gitlabService.createIssue({
      title: `Ticket #${ticket.id}: ${ticket.descripcion}`,
      description: this.formatearDescripcion(ticket),
      labels: this.obtenerLabelsDeTicket(ticket),
      project_id: ticket.gitlab_project_id
    });
  }
}
```

### 2. Reportes Automáticos

```typescript
// Crear issue de reporte semanal
async crearReporteSemanal() {
  const issues = await this.gitlabService.getIssues(12345, {
    state: 'closed',
    updated_after: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  });

  return await this.gitlabService.createIssue({
    title: `Reporte Semanal - ${issues.length} issues cerrados`,
    description: this.generarReporte(issues),
    labels: ['reporte', 'automatico']
  });
}
```

### 3. Gestión de Releases

```typescript
// Crear milestone para nueva versión
async prepararRelease(version: string) {
  const branches = await this.gitlabService.getBranches(12345);
  const commits = await this.gitlabService.getCommits(12345, 'main');
  
  return {
    version,
    branches: branches.length,
    commits: commits.slice(0, 10), // Últimos 10 commits
    ready: branches.some(b => b.name === `release/${version}`)
  };
}
```

## 🔍 Testing

### Verificar Conexión

```bash
# Usar endpoint de salud
curl -X GET http://localhost:3000/api/gitlab/health

# Verificar usuario
curl -X GET http://localhost:3000/api/gitlab/user
```

### Crear Issue de Prueba

```bash
curl -X POST http://localhost:3000/api/gitlab/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Issue de prueba desde API",
    "description": "Este issue fue creado usando la API de NestJS",
    "labels": ["test", "api"]
  }'
```

## 📝 Notas Importantes

### Limitaciones de Rate Limit

- GitLab.com: 2000 requests/minuto por usuario
- GitLab self-hosted: Configurable por administrador
- El servicio incluye manejo automático de errores de rate limit

### Permisos Requeridos

- **Leer proyectos**: `read_repository`
- **Gestionar issues**: `api` o `write_repository`
- **Crear merge requests**: `api`
- **Administrar proyectos**: `api` con permisos de maintainer/owner

### Seguridad

- Nunca commits tokens en el código
- Usar variables de entorno para credentials
- Rotar tokens periódicamente
- Configurar scopes mínimos necesarios

---

## 🎉 ¡Listo para Usar!

La integración con GitLab está completa y lista para uso en producción. El sistema incluye:

- ✅ Configuración condicional
- ✅ Manejo robusto de errores
- ✅ Logging detallado
- ✅ Validación de datos
- ✅ Documentación completa
- ✅ Ejemplos de uso
- ✅ Testing endpoints

¡Ahora puedes gestionar tus proyectos GitLab directamente desde tu API NestJS! 🚀
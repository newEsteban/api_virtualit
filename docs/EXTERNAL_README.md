# Migración de Tickets desde Gestion Coban

Este módulo permite migrar datos desde la tabla `tbl_tickets_news` de la base de datos `gestion_coban` hacia la tabla `ticket` de la base de datos local.

## Configuración

### Variables de Entorno

Asegúrate de que tu archivo `.env` tenga configuradas las siguientes variables para la conexión a MariaDB:

```properties
NEW_SISTEMAS_DB_TYPE=mariadb
NEW_SISTEMAS_DB_HOST=localhost
NEW_SISTEMAS_DB_PORT=3306
NEW_SISTEMAS_DB_USERNAME=user
NEW_SISTEMAS_DB_PASSWORD=pass
NEW_SISTEMAS_DB_DATABASE=DB
NEW_SISTEMAS_DB_SCHEMA=public
```

## Uso de la API

### 1. Obtener Estadísticas

Obtiene información sobre el estado actual de la migración:

```bash
GET /api/migration/stats
```

**Respuesta:**
```json
{
  "success": true,
  "stats": {
    "totalGestionCoban": 150,
    "totalTicketsLocal": 75,
    "ticketsConReferencia": 50,
    "ticketsSinMigrar": 100
  },
  "message": "Estadísticas obtenidas exitosamente"
}
```

### 2. Ejecutar Migración

Migra los tickets desde gestion_coban a la tabla local:

```bash
POST /api/migration/tickets
```

**Parámetros de consulta opcionales:**
- `fechaDesde`: Fecha desde (formato: YYYY-MM-DD)
- `fechaHasta`: Fecha hasta (formato: YYYY-MM-DD)
- `estado`: Estado específico a filtrar
- `ticketId`: ID específico de ticket a migrar

**Ejemplos:**

```bash
# Migrar todos los tickets
POST /api/migration/tickets

# Migrar tickets de un rango de fechas
POST /api/migration/tickets?fechaDesde=2024-01-01&fechaHasta=2024-12-31

# Migrar tickets con estado específico
POST /api/migration/tickets?estado=activo

# Migrar un ticket específico
POST /api/migration/tickets?ticketId=123
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Migración completada exitosamente",
  "migratedCount": 25,
  "conditions": {
    "fechaDesde": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Vista Previa (En desarrollo)

```bash
GET /api/migration/preview
```

## Características

### Prevención de Duplicados
- El sistema verifica automáticamente si un ticket ya existe en la tabla local usando el campo `ticket_new_id`
- No se crearán tickets duplicados

### Filtros Disponibles
- **Fecha desde/hasta**: Filtra por fecha de creación
- **Estado**: Filtra por estado del ticket
- **ID específico**: Migra solo un ticket específico

### Logging
- Todas las operaciones se registran en los logs de la aplicación
- Se proporciona información detallada sobre el progreso de la migración

## Estructura de Datos

### Tabla Origen: `tbl_tickets_news` (gestion_coban)
```sql
- id (PK)
- descripcion
- url_ticket
- ticket_id
- estado
- fecha_creacion
- fecha_actualizacion
```

### Tabla Destino: `ticket` (local)
```sql
- id (PK)
- ticket_new_id (referencia a ticket_id de origen)
- descripcion
- url_ticket_new
- created_at
- updated_at
- deleted_at
```

## Mapeo de Campos

| Campo Origen | Campo Destino | Descripción |
|--------------|---------------|-------------|
| ticket_id | ticket_new_id | ID de referencia externa |
| descripcion | descripcion | Descripción del ticket |
| url_ticket | url_ticket_new | URL del ticket externo |

## Consideraciones

1. **Solo Lectura**: La conexión a `gestion_coban` es de solo lectura
2. **Seguridad**: Los tickets existentes no se sobrescriben
3. **Performance**: La migración procesa los tickets de uno en uno para mejor control
4. **Logs**: Revisa los logs para información detallada sobre el proceso

## Troubleshooting

### Error de Conexión
- Verifica las variables de entorno de la base de datos
- Confirma que el servidor MariaDB esté accesible
- Revisa los permisos del usuario de base de datos

### Tickets No Migrados
- Usa el endpoint `/migration/stats` para verificar el estado
- Revisa los logs para errores específicos
- Verifica que la estructura de la tabla `tbl_tickets_news` coincida con la entidad

### Performance
- Para tablas grandes, considera usar filtros de fecha
- La migración procesa registros secuencialmente para estabilidad

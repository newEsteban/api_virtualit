# Comando de Migración de Tickets

Este comando permite migrar datos desde la tabla `tbl_tickets_news` de la base de datos externa (`gestion_coban`) hacia la tabla `ticket` de la base de datos local.

## ✅ Comando Unificado

Se ha eliminado el comando redundante `migrate-gestion-coban.command.ts` y se mantiene únicamente `migrate-tickets.command.ts` que es más completo y configurable.

## 🚀 Instalación y Configuración

### 1. Dependencias Instaladas
- ✅ `nest-commander` - Para comandos CLI en NestJS

### 2. Scripts de Package.json
```json
{
  "scripts": {
    "command": "ts-node -r tsconfig-paths/register src/cli.ts",
    "command:build": "npm run build && node dist/cli.js",
    "migrate:tickets": "npm run command -- migrate-tickets",
    "migrate:tickets:stats": "npm run command -- migrate-tickets --stats",
    "migrate:tickets:dry": "npm run command -- migrate-tickets --dry-run",
    "migrate:tickets:real": "npm run command -- migrate-tickets --no-dry-run"
  }
}
```

## 📋 Uso del Comando

### Ver Ayuda
```bash
npm run command -- migrate-tickets --help
```

### Ver Solo Estadísticas (sin migrar)
```bash
npm run migrate:tickets:stats
# o
npm run command -- migrate-tickets --stats
```

### Modo de Prueba (Dry Run) - Predeterminado
```bash
npm run migrate:tickets:dry
# o
npm run command -- migrate-tickets --dry-run
```

### Ejecutar Migración Real
```bash
npm run migrate:tickets:real
# o
npm run command -- migrate-tickets --no-dry-run
```

## 🎯 Opciones de Filtrado

### Por Fechas
```bash
# Desde una fecha específica
npm run command -- migrate-tickets --fecha-desde 2024-01-01 --no-dry-run

# Hasta una fecha específica
npm run command -- migrate-tickets --fecha-hasta 2024-12-31 --no-dry-run

# Rango de fechas
npm run command -- migrate-tickets --fecha-desde 2024-01-01 --fecha-hasta 2024-12-31 --no-dry-run
```

### Por Estado
```bash
# Solo tickets con estado específico
npm run command -- migrate-tickets --estado ABIERTO --no-dry-run
npm run command -- migrate-tickets --estado CERRADO --no-dry-run
npm run command -- migrate-tickets --estado PENDIENTE --no-dry-run
```

### Por ID de Ticket
```bash
# Migrar solo un ticket específico
npm run command -- migrate-tickets --ticket-id 123 --no-dry-run
```

### Combinando Filtros
```bash
# Combinar múltiples filtros
npm run command -- migrate-tickets \
  --fecha-desde 2024-01-01 \
  --estado ABIERTO \
  --no-dry-run
```

## 📊 Estadísticas Mostradas

El comando muestra las siguientes estadísticas:

- **Total tickets en gestion_coban**: Número total de registros en la tabla externa
- **Total tickets en tabla local**: Número total de tickets en la base local
- **Tickets con referencia externa**: Tickets locales que tienen `ticket_new_id`
- **Tickets pendientes de migrar**: Diferencia entre externos y ya migrados

## 🔧 Características del Comando

### 1. Seguridad
- ✅ **Modo Dry-Run por defecto**: Previene ejecuciones accidentales
- ✅ **Verificación de duplicados**: No migra tickets que ya existen
- ✅ **Manejo de errores**: Continúa con otros registros si uno falla

### 2. Filtrado Inteligente
- ✅ **Exclusión automática**: No migra tickets ya existentes en la tabla local
- ✅ **Filtros de fecha**: Permite migrar solo rangos específicos
- ✅ **Filtros de estado**: Excluye estados no deseados (ej: 'ELIMINADO')
- ✅ **Validación de datos**: Solo migra registros con descripción válida

### 3. Logging Detallado
- ✅ **Progreso en tiempo real**: Muestra el avance de la migración
- ✅ **Contadores**: Registros migrados, omitidos y errores
- ✅ **Debug opcional**: Logs detallados por cada registro
- ✅ **Estadísticas finales**: Resumen completo al terminar

## 🗃️ Estructura de Datos

### Tabla Origen: `tbl_tickets_news` (gestion_coban)
```typescript
export class GestionCoban {
  id: number;                    // ID interno
  descripcion: string;           // Descripción del ticket
  url_ticket: string;           // URL del ticket
  ticket_id: number;            // ID del ticket en el sistema externo
  estado: string;               // Estado (ABIERTO, CERRADO, etc.)
  fecha_creacion: Date;         // Fecha de creación
  fecha_actualizacion: Date;    // Fecha de actualización
}
```

### Tabla Destino: `ticket` (local)
```typescript
export class Ticket {
  id: number;                   // ID autoincremental local
  ticket_new_id: number;        // Referencia al ID externo (ticket_id)
  descripcion: string;          // Descripción migrada
  url_ticket_new: string;       // URL migrada
  created_at: Date;             // Auto-generado
  updated_at: Date;             // Auto-generado
  deleted_at: Date;             // Soft delete
}
```

## 🔄 Proceso de Migración

1. **Conexión a BD Externa**: Se conecta a `gestion_coban` usando `newSistemasConnection`
2. **Aplicar Filtros**: Construye query con condiciones especificadas
3. **Exclusión de Existentes**: Excluye tickets ya migrados (WHERE NOT IN)
4. **Validación**: Verifica que cada registro tenga descripción válida
5. **Verificación Doble**: Confirma que el ticket no existe antes de crear
6. **Creación**: Mapea campos y crea nuevo registro en tabla local
7. **Logging**: Registra éxito/error de cada operación

## ⚠️ Consideraciones Importantes

### 1. Performance
- El comando procesa registros secuencialmente para evitar problemas de memoria
- Para grandes volúmenes, considerar usar filtros por fecha
- El modo dry-run es útil para estimar tiempo de ejecución

### 2. Base de Datos
- ✅ **Conexión Externa**: Requiere configuración correcta de `newSistemasConnection`
- ✅ **Transacciones**: Cada ticket se guarda individualmente (no transaccional por lote)
- ✅ **Indices**: La tabla `ticket` debe tener índice en `ticket_new_id`

### 3. Variables de Entorno Requeridas
```env
# Configuración de new_sistemas (MariaDB)
NEW_SISTEMAS_DB_TYPE=mariadb
NEW_SISTEMAS_DB_HOST=tu_host
NEW_SISTEMAS_DB_PORT=3306
NEW_SISTEMAS_DB_USERNAME=tu_usuario
NEW_SISTEMAS_DB_PASSWORD=tu_password
NEW_SISTEMAS_DB_DATABASE=gestion_cobanc
NEW_SISTEMAS_DB_SCHEMA=public
```

## 🛠️ Troubleshooting

### Error: Cannot connect to external database
```bash
# Verificar variables de entorno
echo $NEW_SISTEMAS_DB_HOST
echo $NEW_SISTEMAS_DB_USERNAME

# Verificar conectividad
telnet your_host 3306
```

### Error: Entity not found
```bash
# Verificar que las entidades estén registradas
# Archivo: src/config/typeorm-new-sistemas.config.ts
# Debe incluir: GestionCoban
```

### Error: Duplicate entry
```bash
# Normal, el comando omite duplicados automáticamente
# Revisar logs para confirmar que se están omitiendo correctamente
```

### Performance Issues
```bash
# Usar filtros para reducir volumen
npm run command -- migrate-tickets --fecha-desde 2024-01-01 --no-dry-run

# Procesar por lotes usando rangos de fecha
npm run command -- migrate-tickets --fecha-desde 2024-01-01 --fecha-hasta 2024-01-31 --no-dry-run
```

## 📈 Ejemplos de Uso Común

### Migración Inicial (Primeros 30 días)
```bash
npm run command -- migrate-tickets \
  --fecha-desde $(date -d '30 days ago' +%Y-%m-%d) \
  --no-dry-run
```

### Migración de Tickets Activos
```bash
npm run command -- migrate-tickets \
  --estado ABIERTO \
  --no-dry-run
```

### Verificar antes de Migrar
```bash
# 1. Ver estadísticas
npm run migrate:tickets:stats

# 2. Dry run con filtros
npm run command -- migrate-tickets --fecha-desde 2024-01-01 --dry-run

# 3. Ejecutar migración real
npm run command -- migrate-tickets --fecha-desde 2024-01-01 --no-dry-run

# 4. Verificar resultado
npm run migrate:tickets:stats
```

## 📚 Archivos Relacionados

- `src/commands/migrate-tickets.command.ts` - Comando principal
- `src/external/services/migration.service.ts` - Lógica de migración
- `src/external/entities/gestion-coban.entity.ts` - Entidad externa
- `src/ticket/entities/ticket.entity.ts` - Entidad local
- `src/commands/commands.module.ts` - Módulo de comandos
- `src/cli.ts` - Punto de entrada CLI
- `package.json` - Scripts de ejecución

El comando está completamente funcional y listo para usar. Recuerda siempre usar `--dry-run` primero para verificar qué se va a migrar antes de ejecutar la migración real.
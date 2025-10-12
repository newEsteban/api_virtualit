# 📋 Refactorización: gestion_cobanc

## 🎯 Resumen de Cambios

Se refactorizó la estructura de archivos y nombres para que reflejen mejor la arquitectura real del sistema:

- **Base de datos externa**: `gestion_cobanc`
- **Tabla específica**: `tbl_tickets_news`
- **Propósito**: Migración de datos y futura expansión para más tablas

## 📁 Estructura Actualizada

### Archivos Renombrados

| **Antes** | **Después** | **Razón** |
|-----------|-------------|-----------|
| `src/external/entities/gestion-coban.entity.ts` | `src/external/entities/tbl-tickets-news.entity.ts` | Refleja el nombre real de la tabla |
| `src/external/services/migration.service.ts` | `src/external/services/gestion-cobanc-migration.service.ts` | Indica claramente la fuente de datos |
| `src/external/external.module.ts` | `src/external/gestion-cobanc.module.ts` | Especifica el sistema externo |

### Clases Actualizadas

| **Antes** | **Después** |
|-----------|-------------|
| `GestionCoban` | `TblTicketsNews` |
| `MigrationService` | `GestionCobancMigrationService` |
| `ExternalModule` | `GestionCobancModule` |

## 🏗️ Estructura Final

```
src/
├── external/
│   ├── entities/
│   │   └── tbl-tickets-news.entity.ts      # ✅ Entidad para tbl_tickets_news
│   ├── services/
│   │   └── gestion-cobanc-migration.service.ts # ✅ Servicio de migración
│   ├── controllers/
│   │   └── migration.controller.ts         # ✅ Actualizado con nuevos nombres
│   └── gestion-cobanc.module.ts           # ✅ Módulo renombrado
├── commands/
│   └── migrate-tickets.command.ts         # ✅ Actualizado con nuevo servicio
├── config/
│   └── typeorm-new-sistemas.config.ts     # ✅ Actualizado con nueva entidad
└── app.module.ts                          # ✅ Actualizado imports
```

## 🔧 Configuración de Base de Datos

### Variables de Entorno (.env)
```bash
# Habilitar/deshabilitar conexión a gestion_cobanc
NEW_SISTEMAS_ENABLED=false

# Configuración de gestion_cobanc (cuando esté habilitada)
NEW_SISTEMAS_DB_HOST=ip_servidor_mysql
NEW_SISTEMAS_DB_PORT=3306
NEW_SISTEMAS_DB_USERNAME=usuario_lectura
NEW_SISTEMAS_DB_PASSWORD=password_lectura
NEW_SISTEMAS_DB_DATABASE=gestion_cobanc
```

### Conexión Condicional
- **`NEW_SISTEMAS_ENABLED=false`**: Conexión deshabilitada (ambiente local)
- **`NEW_SISTEMAS_ENABLED=true`**: Conexión habilitada (ambiente con acceso a red empresarial)

## 📊 Entidad TblTicketsNews

```typescript
@Entity('tbl_tickets_news')
export class TblTicketsNews {
    @PrimaryColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    url_ticket: string;

    @Column({ nullable: true })
    ticket_id: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    estado: string;

    @CreateDateColumn({ type: 'timestamp' })
    fecha_creacion: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    fecha_actualizacion: Date;
}
```

## 🚀 Comandos Disponibles

```bash
# Mostrar solo estadísticas
npm run migrate:tickets:stats

# Migración en modo prueba (sin cambios)
npm run migrate:tickets:dry

# Migración real (con cambios en BD)
npm run migrate:tickets:real

# Migración con filtros
npm run command -- migrate-tickets --fecha-desde 2024-01-01 --estado activo
```

## 🌐 API Endpoints

```bash
# Estadísticas de migración
GET /migration/stats

# Ejecutar migración
POST /migration/tickets?fechaDesde=2024-01-01&estado=activo

# Vista previa (en desarrollo)
GET /migration/preview?limit=10
```

## 🔄 Flujo de Migración

1. **Verificación**: Chequea `NEW_SISTEMAS_ENABLED`
2. **Conexión**: Valida acceso a `gestion_cobanc`
3. **Filtrado**: Aplica condiciones de fecha, estado, etc.
4. **Exclusión**: Omite tickets ya migrados
5. **Migración**: Crea registros en tabla `ticket` local
6. **Estadísticas**: Muestra resumen de la operación

## 🎯 Futuras Expansiones

Esta estructura permite agregar fácilmente más tablas de `gestion_cobanc`:

```typescript
// Ejemplo para futuras entidades
@Entity('tbl_usuarios_new')
export class TblUsuariosNew { /* ... */ }

@Entity('tbl_reportes_new')
export class TblReportesNew { /* ... */ }
```

## ✅ Verificación

### Compilación Exitosa
```bash
npm run build
# ✅ Sin errores

npm run migrate:tickets:stats
# ✅ Comando funcionando correctamente
```

### Estado del Sistema
- ✅ Todos los archivos renombrados correctamente
- ✅ Imports actualizados en toda la aplicación
- ✅ Módulos reconfigurados apropiadamente
- ✅ Comandos CLI funcionando
- ✅ Conexión condicional operativa
- ✅ Documentación centralizada en `docs/`

## 📚 Referencias

- [CONDITIONAL_NEW_SISTEMAS.md](./CONDITIONAL_NEW_SISTEMAS.md) - Configuración condicional
- [EXTERNAL_README.md](./EXTERNAL_README.md) - Sistema de migración externa
- [INSOMNIA_README.md](./INSOMNIA_README.md) - Testing de APIs

---

**Nota**: Esta refactorización mejora la claridad del código y prepara el sistema para futuras expansiones manteniendo la flexibilidad de conexión condicional.
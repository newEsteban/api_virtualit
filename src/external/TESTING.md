# Prueba de Migración de Tickets

## Pasos para Probar la Migración

### 1. Iniciar la Aplicación

```bash
npm run start:dev
```

### 2. Verificar Estadísticas Iniciales

```bash
curl -X GET http://localhost:3000/api/migration/stats
```

### 3. Ejecutar Migración de Prueba

```bash
# Migrar un ticket específico (reemplaza 123 con un ID real)
curl -X POST "http://localhost:3000/api/migration/tickets?ticketId=123"

# O migrar tickets por fecha
curl -X POST "http://localhost:3000/api/migration/tickets?fechaDesde=2024-01-01&fechaHasta=2024-12-31"
```

### 4. Verificar Resultados

```bash
curl -X GET http://localhost:3000/api/migration/stats
```

## Ejemplos de Uso con JavaScript/Fetch

```javascript
// Obtener estadísticas
async function getStats() {
    const response = await fetch('http://localhost:3000/api/migration/stats');
    const data = await response.json();
    console.log('Estadísticas:', data);
}

// Ejecutar migración
async function migrateTickets(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`http://localhost:3000/api/migration/tickets?${params}`, {
        method: 'POST'
    });
    const data = await response.json();
    console.log('Resultado migración:', data);
}

// Ejemplos de uso
getStats();
migrateTickets({ fechaDesde: '2024-01-01' });
migrateTickets({ ticketId: '123' });
```

## Verificación en Base de Datos

```sql
-- Verificar tickets migrados
SELECT 
    id,
    ticket_new_id,
    descripcion,
    url_ticket_new,
    created_at
FROM ticket 
WHERE ticket_new_id IS NOT NULL
ORDER BY created_at DESC;

-- Contar tickets por origen
SELECT 
    CASE 
        WHEN ticket_new_id IS NOT NULL THEN 'Migrado'
        ELSE 'Local'
    END AS origen,
    COUNT(*) as cantidad
FROM ticket
GROUP BY origen;
```

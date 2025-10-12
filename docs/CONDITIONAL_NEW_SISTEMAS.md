# Configuración Condicional de New Sistemas

Esta guía explica cómo configurar la conexión condicional a la base de datos externa `new_sistemas` según tu entorno de red.

## 🔧 Variables de Entorno

### ⚡ Variable Principal

```env
NEW_SISTEMAS_ENABLED=false  # false: deshabilitado, true: habilitado
```

### 📋 Variables de Configuración

```env
# New Sistemas Database Configuration (MariaDB/MySQL)
NEW_SISTEMAS_ENABLED=false                    # 👈 VARIABLE PRINCIPAL
NEW_SISTEMAS_DB_TYPE=mysql
NEW_SISTEMAS_DB_HOST=192.168.100.210
NEW_SISTEMAS_DB_PORT=3306
NEW_SISTEMAS_DB_USERNAME=ecardona
NEW_SISTEMAS_DB_PASSWORD=tu_password
NEW_SISTEMAS_DB_DATABASE=gestion_cobanc
NEW_SISTEMAS_DB_SCHEMA=public
```

## 🏠 Configuración por Entorno

### **En la Oficina (Red Empresarial)**

```env
# .env
NEW_SISTEMAS_ENABLED=true
NEW_SISTEMAS_DB_HOST=192.168.100.210
NEW_SISTEMAS_DB_PASSWORD=evirtualit2025
```

### **En Casa/Remoto (Sin Acceso)**

```env
# .env
NEW_SISTEMAS_ENABLED=false
# Las demás variables pueden quedar como estén
```

## 🎯 Comportamiento del Sistema

### ✅ Cuando `NEW_SISTEMAS_ENABLED=true`

- ✅ Se establece conexión a la base de datos externa
- ✅ Los comandos de migración funcionan completamente
- ✅ Las estadísticas incluyen datos de ambas bases de datos
- ✅ Logs: `🔓 Conexión a new_sistemas habilitada`

### ❌ Cuando `NEW_SISTEMAS_ENABLED=false`

- ❌ NO se intenta conectar a la base de datos externa
- ❌ Los comandos de migración fallan con mensaje informativo
- ✅ Las estadísticas muestran solo datos locales
- ✅ La aplicación principal funciona normalmente
- ✅ Logs: `🔒 Conexión a new_sistemas deshabilitada`

## 📋 Comandos Disponibles

### **Ver Estadísticas**

```bash
# Con conexión habilitada: muestra datos completos
# Con conexión deshabilitada: muestra solo datos locales
npm run migrate:tickets:stats
```

**Salida con NEW_SISTEMAS_ENABLED=false:**
```
🔒 NEW_SISTEMAS_ENABLED=false - Conexión a new_sistemas deshabilitada
📊 === ESTADÍSTICAS DE MIGRACIÓN ===
📋 Total tickets en gestion_coban: 0 (no disponible)
🎫 Total tickets en tabla local: 150
🔗 Tickets con referencia externa: 75
⏳ Tickets pendientes de migrar: 0 (no disponible)
🔒 Estado: Conexión externa deshabilitada
=====================================
```

**Salida con NEW_SISTEMAS_ENABLED=true:**
```
🔓 NEW_SISTEMAS_ENABLED=true - Configurando conexión a new_sistemas
📊 === ESTADÍSTICAS DE MIGRACIÓN ===
📋 Total tickets en gestion_coban: 500
🎫 Total tickets en tabla local: 150
🔗 Tickets con referencia externa: 75
⏳ Tickets pendientes de migrar: 425
✅ Estado: Conexión externa activa
=====================================
```

### **Migración**

```bash
# Con conexión habilitada: ejecuta migración
# Con conexión deshabilitada: falla con mensaje informativo
npm run migrate:tickets:real
```

**Error esperado con NEW_SISTEMAS_ENABLED=false:**
```
❌ Error durante la migración: 🔒 Conexión a new_sistemas deshabilitada. 
Para usar la migración, configura NEW_SISTEMAS_ENABLED=true en el archivo .env 
y asegúrate de estar conectado a la red empresarial.
```

## 🔄 Cambio Rápido de Configuración

### **Script para Habilitar** (cuando estés en la oficina)

```bash
# enable-new-sistemas.bat
@echo off
echo Habilitando conexion a new_sistemas...
powershell -Command "(Get-Content .env) -replace 'NEW_SISTEMAS_ENABLED=false', 'NEW_SISTEMAS_ENABLED=true' | Set-Content .env"
echo ✅ NEW_SISTEMAS_ENABLED=true
```

### **Script para Deshabilitar** (cuando trabajes remoto)

```bash
# disable-new-sistemas.bat
@echo off
echo Deshabilitando conexion a new_sistemas...
powershell -Command "(Get-Content .env) -replace 'NEW_SISTEMAS_ENABLED=true', 'NEW_SISTEMAS_ENABLED=false' | Set-Content .env"
echo ❌ NEW_SISTEMAS_ENABLED=false
```

## 🧪 Pruebas

### **1. Probar con Conexión Deshabilitada**

```bash
# 1. Configurar
NEW_SISTEMAS_ENABLED=false

# 2. Probar estadísticas (debería funcionar)
npm run migrate:tickets:stats

# 3. Probar migración (debería fallar con mensaje claro)
npm run migrate:tickets:real
```

### **2. Probar con Conexión Habilitada**

```bash
# 1. Configurar (solo cuando estés en red empresarial)
NEW_SISTEMAS_ENABLED=true

# 2. Probar estadísticas (debería mostrar datos completos)
npm run migrate:tickets:stats

# 3. Probar migración (debería ejecutar si hay conexión)
npm run migrate:tickets:real
```

## ⚡ Inicio Rápido

### **Para Desarrollo Local (Sin Acceso Externo)**

```bash
# 1. Copiar configuración
cp .env.example .env

# 2. Configurar variables básicas
# Editar .env:
NEW_SISTEMAS_ENABLED=false
DB_HOST=localhost
DB_PASSWORD=tu_password_local

# 3. Iniciar aplicación
npm run start:dev
```

### **Para Trabajo en Oficina**

```bash
# 1. Habilitar conexión externa
NEW_SISTEMAS_ENABLED=true

# 2. Verificar conexión
npm run migrate:tickets:stats

# 3. Realizar migración si es necesario
npm run migrate:tickets:real
```

## 🔍 Logs y Debugging

Los logs te indicarán claramente el estado de la conexión:

```bash
# Al iniciar la aplicación:
[NestFactory] Starting Nest application...
🔒 NEW_SISTEMAS_ENABLED=false - Conexión a new_sistemas deshabilitada
🔒 Conexión a new_sistemas deshabilitada (NEW_SISTEMAS_ENABLED=false)

# O:
🔓 NEW_SISTEMAS_ENABLED=true - Configurando conexión a new_sistemas
🔓 Conexión a new_sistemas habilitada
```

## 🛠️ Troubleshooting

### **Error: "Config validation error: NEW_SISTEMAS_DB_HOST is required"**

**Causa**: Variables requeridas no están definidas cuando `NEW_SISTEMAS_ENABLED=true`

**Solución**: 
1. Configurar `NEW_SISTEMAS_ENABLED=false` si no tienes acceso
2. O configurar todas las variables requeridas

### **Error: "Unable to connect to the database (newSistemasConnection)"**

**Causa**: Conexión habilitada pero sin acceso a la red

**Solución**: Configurar `NEW_SISTEMAS_ENABLED=false`

### **Aplicación funciona pero migración falla**

**Esto es normal** cuando `NEW_SISTEMAS_ENABLED=false`. La aplicación principal funciona independientemente de la conexión externa.

## 📚 Archivos Modificados

- ✅ `.env` - Variable `NEW_SISTEMAS_ENABLED`
- ✅ `src/config/env.validation.ts` - Validación condicional
- ✅ `src/config/typeorm-new-sistemas.config.ts` - Configuración condicional
- ✅ `src/app.module.ts` - Importación condicional
- ✅ `src/external/services/migration.service.ts` - Manejo de errores
- ✅ `src/external/external.module.ts` - ConfigModule importado

¡La configuración está lista para usar en cualquier entorno! 🎉
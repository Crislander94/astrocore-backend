# Solución: Error de Referencia Circular en Logger

## 🐛 Problema Original

```
TypeError: Converting circular structure to JSON
--> starting at object with constructor 'Object'
--- property 'issuerCertificate' closes the circle
```

Este error ocurría cuando el sistema intentaba enviar emails y el logger trataba de serializar objetos de error que contenían referencias circulares (como certificados SSL de nodemailer).

## 🔧 Solución Implementada

### 1. Logger Mejorado (`src/shared/utils/logger.ts`)

**Antes:**
```typescript
JSON.stringify(arg, null, 2) // ❌ Falla con referencias circulares
```

**Después:**
```typescript
// ✅ Manejo seguro de referencias circulares
private safeStringify(obj: any): string {
  const seen = new WeakSet();
  
  return JSON.stringify(obj, (key, value) => {
    // Filtrar propiedades problemáticas
    if (key === 'issuerCertificate' || key === 'certificate' || ...) {
      return '[Filtered]';
    }
    
    // Detectar referencias circulares
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    
    return value;
  }, 2);
}
```

### 2. Manejo de Errores Mejorado (`EmailServiceImpl.ts`)

**Antes:**
```typescript
logger.error(`Failed to send email:`, error); // ❌ Serializa objeto completo
```

**Después:**
```typescript
// ✅ Extrae solo información útil
const errorMessage = error instanceof Error ? error.message : 'Unknown error';
const errorCode = (error as any)?.code || 'UNKNOWN';
logger.error(`Failed to send email. Error: ${errorMessage} (Code: ${errorCode})`);
```

### 3. Sistema de Diagnóstico

Agregado sistema completo de diagnóstico para facilitar troubleshooting:

- **Diagnóstico de Email**: `/api/diagnostic/email`
- **Test de Envío**: `/api/diagnostic/email/test`
- **Estado del Sistema**: `/api/diagnostic/system`

## 🧪 Verificación de la Solución

### Opción 1: Script Automático
```bash
npm run test:email
```

### Opción 2: Endpoints Manuales
```bash
# Diagnóstico de email
curl http://localhost:3000/api/diagnostic/email

# Estado del sistema
curl http://localhost:3000/api/diagnostic/system

# Test de envío
curl -X POST http://localhost:3000/api/diagnostic/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 📋 Archivos Modificados

### Nuevos Archivos
- `src/shared/utils/emailDiagnostic.ts` - Utilidad de diagnóstico
- `src/infrastructure/web/controllers/DiagnosticController.ts` - API de diagnóstico
- `src/infrastructure/web/routes/diagnosticRoutes.ts` - Rutas de diagnóstico
- `scripts/test-email-fix.js` - Script de prueba

### Archivos Modificados
- `src/shared/utils/logger.ts` - Logger con manejo de referencias circulares
- `src/infrastructure/external/EmailServiceImpl.ts` - Mejor manejo de errores
- `src/infrastructure/web/app.ts` - Nuevas rutas agregadas
- `package.json` - Comando `test:email` agregado

## 🎯 Beneficios de la Solución

1. **Elimina errores de serialización**: No más crashes por referencias circulares
2. **Logs más útiles**: Información específica en lugar de objetos complejos
3. **Diagnóstico automático**: Identifica problemas de configuración
4. **Mejor debugging**: Herramientas para troubleshooting
5. **Backward compatible**: No rompe funcionalidad existente

## 🔍 Tipos de Error Manejados

- **Referencias circulares**: `issuerCertificate`, `certificate`, `socket`
- **Objetos complejos**: `_events`, `_eventsCount`, `domain`
- **Errores de conexión**: `EAUTH`, `ECONNREFUSED`, `ETIMEDOUT`
- **Errores de configuración**: Credenciales inválidas, hosts no encontrados

## 📊 Logs Antes vs Después

### Antes (❌ Error)
```
[ERROR] Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'issuerCertificate' closes the circle
```

### Después (✅ Información útil)
```
[ERROR] Failed to send verification email to user@example.com. Error: Invalid login: 535-5.7.8 Username and Password not accepted (Code: EAUTH)
[INFO] 🔍 Ejecutando diagnóstico de email...
[WARN] ⚠️  Problemas encontrados:
[WARN]    - Credenciales SMTP inválidas (usuario/contraseña)
[INFO] 💡 Recomendaciones:
[INFO]    - Para Gmail, usa App Passwords en lugar de tu contraseña normal
```

## 🚀 Próximos Pasos

1. **Probar la solución**: `npm run test:email`
2. **Configurar Brevo** (recomendado): `npm run setup:brevo`
3. **Verificar logs**: Buscar mensajes más claros y útiles
4. **Monitorear**: Usar endpoints de diagnóstico para troubleshooting

## 🆘 Si Persisten Problemas

1. **Verificar Node.js**: Versión 18+ requerida para fetch
2. **Revisar .env**: Variables de email correctamente configuradas
3. **Consultar diagnóstico**: `/api/diagnostic/email` para detalles
4. **Logs del servidor**: Buscar mensajes específicos de error
5. **Documentación**: `docs/BREVO_SETUP.md` para configuración completa

---

**Nota**: Esta solución mantiene compatibilidad completa con el sistema existente mientras proporciona mejor manejo de errores y herramientas de diagnóstico.

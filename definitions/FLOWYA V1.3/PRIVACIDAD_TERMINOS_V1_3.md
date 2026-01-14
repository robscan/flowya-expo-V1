# PRIVACIDAD Y TÉRMINOS DE USO — FLOWYA V1.3

**Versión:** FLOWYA V1.3  
**Fecha:** 2026-01-11  
**Estado:** En progreso

---

## PROPÓSITO

Este documento define las políticas de privacidad, manejo de datos personales y términos de uso relacionados con la persistencia de datos en servidor para FLOWYA V1.3.

**Referencias:**
- Decisiones canónicas: `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md`
- Modelo de datos: `definitions/FLOWYA V1.3/MODELO_DATOS_V1_3.md`
- Seguridad: `definitions/FLOWYA V1.3/SEGURIDAD_V1_3.md`

---

## DATOS PERSONALES RECOPILADOS

### Datos de Autenticación

**Recopilados por Supabase Auth:**
- Email del usuario
- Contraseña (hasheada, no almacenada en texto plano)
- ID único de usuario (UUID)
- Fecha de creación de cuenta
- Sesión de autenticación (tokens)

**Base Legal:** Consentimiento del usuario al crear cuenta

**Almacenamiento:** Supabase Auth (servicio externo)

### Datos de Pins (Relación Usuario-Spot)

**Datos Recopilados:**
- `spot_id`: ID del Spot (referencia a lugar público)
- `user_id`: ID del usuario (asociación)
- `state`: Estado del Pin ('to_visit' | 'visited')
- `pinned_at`: Fecha/hora de creación del Pin
- `visited_at`: Fecha/hora de primera visita (opcional)

**Base Legal:** Consentimiento implícito al usar funcionalidad de Pin

**Almacenamiento:** Supabase (tabla `pins`)

**Características:**
- Datos asociados exclusivamente al usuario
- Aislamiento por usuario (RLS)
- No se comparten con otros usuarios sin permiso explícito

### Datos del Diario de Viaje

**Datos Recopilados:**
- `notes`: Notas personales del usuario (texto libre, opcional)
- `personal_photos`: URLs de fotos personales del usuario (array, opcional)

**Base Legal:** Consentimiento implícito al usar funcionalidad de Diario

**Almacenamiento:** Supabase (tabla `pins`, campos `notes` y `personal_photos`)

**Características:**
- Contenido personal del usuario
- Solo visible para el usuario propietario
- NO se traduce ni se procesa automáticamente
- NO se comparte sin permiso explícito

### Datos de Ubicación

**Datos Recopilados:**
- Ubicación actual del dispositivo (GPS)
- Ubicación de Spots visitados (asociada a Pins)

**Base Legal:** Consentimiento del usuario al otorgar permisos de ubicación

**Almacenamiento:**
- Ubicación actual: Solo local (no se persiste en servidor)
- Ubicación de Spots: Parte de datos públicos (Spots son world content)

**Características:**
- Ubicación actual NO se persiste en servidor
- Ubicación de Spots es contenido público (no personal)

### Datos de Afinidad (Legacy, Local)

**Datos Recopilados (Solo Local, V1.3):**
- `likedSpots`: IDs de spots con like
- `notMyVibeSpots`: IDs de spots marcados como "not my vibe"
- `savedFlows`: IDs de flows guardados
- `spotTypeAffinity`: Afinidad por tipo de spot (score, count)

**Base Legal:** Consentimiento implícito al usar funcionalidad

**Almacenamiento:** AsyncStorage local (NO se persiste en servidor en V1.3)

**Nota:** Estos datos son legacy y se mantienen localmente. No se migran a Supabase en V1.3.

---

## MANEJO DE DATOS PERSONALES

### Principios de Manejo

1. **Minimización de Datos:**
   - Solo recopilamos datos necesarios para funcionalidad
   - No recopilamos datos innecesarios
   - Datos se eliminan cuando ya no son necesarios

2. **Propósito Limitado:**
   - Datos se usan solo para funcionalidad de la app
   - No se comparten con terceros sin consentimiento
   - No se usan para publicidad o marketing sin permiso

3. **Transparencia:**
   - Usuario sabe qué datos se recopilan
   - Usuario puede acceder a sus datos
   - Usuario puede eliminar sus datos

4. **Seguridad:**
   - Datos protegidos con Row Level Security (RLS)
   - Aislamiento por usuario
   - Encriptación en tránsito (HTTPS)
   - Encriptación en reposo (Supabase)

### Almacenamiento de Datos

#### Servidor (Supabase)

**Datos Persistidos:**
- Pins (relación usuario-spot)
- Estados de Pins (to_visit / visited)
- Diario (notas y fotos personales)
- Datos de autenticación (Supabase Auth)

**Ubicación:** Supabase (servicio externo, puede estar en diferentes regiones)

**Retención:**
- Datos se mantienen mientras cuenta esté activa
- Datos se eliminan al eliminar cuenta (futuro)
- Backup automático por Supabase (política de Supabase)

#### Local (AsyncStorage)

**Datos Persistidos:**
- Cache local de Pins (para offline-first)
- Datos de afinidad legacy (likedSpots, etc.)
- Preferencias de usuario (si aplica)

**Ubicación:** Dispositivo del usuario

**Retención:**
- Cache local se limpia al cerrar sesión
- Datos legacy se mantienen hasta migración o limpieza manual

### Acceso a Datos

#### Por el Usuario

**Derechos del Usuario (GDPR):**
1. **Derecho de Acceso:**
   - Usuario puede ver todos sus Pins
   - Usuario puede ver sus notas y fotos
   - Implementación: Funcionalidad de exportación (futuro)

2. **Derecho de Rectificación:**
   - Usuario puede editar sus notas
   - Usuario puede eliminar fotos
   - Implementación: Funcionalidad de edición disponible

3. **Derecho de Eliminación:**
   - Usuario puede eliminar Pins
   - Usuario puede eliminar notas y fotos
   - Eliminación de cuenta elimina todos los datos (futuro)
   - Implementación: Eliminación de Pins disponible, eliminación de cuenta pendiente

4. **Derecho de Portabilidad:**
   - Usuario puede exportar sus datos (futuro)
   - Implementación: Pendiente para versión futura

5. **Derecho de Oposición:**
   - Usuario puede dejar de usar funcionalidades que recopilan datos
   - Usuario puede eliminar cuenta (futuro)

#### Por FLOWYA

**Acceso Interno:**
- Solo para funcionalidad de la app
- Solo personal autorizado con acceso a Supabase
- Logs de acceso (si aplica)

**Acceso de Terceros:**
- Supabase (proveedor de infraestructura)
- No se comparten datos con otros terceros sin consentimiento

### Compartir Datos

#### Compartir Mapas (V1.3 - Futuro)

**Datos Compartidos:**
- Pines del usuario (to_visit / visited)
- Solo IDs de Spots y estados
- NO se comparten notas ni fotos personales

**Consentimiento:**
- Usuario debe compartir explícitamente
- Usuario puede revocar acceso en cualquier momento

**Almacenamiento:**
- Tabla `shared_maps` en Supabase
- RLS garantiza que solo usuarios autorizados pueden ver

**Referencia:** `SISTEMA_COMPARTIR_V1_3.md`

---

## TÉRMINOS DE USO - DATOS PERSISTENTES EN SERVIDOR

### Aceptación de Términos

Al usar FLOWYA V1.3 y crear una cuenta, el usuario acepta:
- Que sus datos personales se almacenen en servidor (Supabase)
- Que sus datos se sincronicen entre dispositivos
- Que sus datos se mantengan mientras la cuenta esté activa

### Propiedad de Datos

**Datos del Usuario:**
- Usuario es propietario de sus datos personales
- Usuario puede eliminar sus datos en cualquier momento
- FLOWYA no reclama propiedad sobre datos del usuario

**Contenido Público:**
- Spots son contenido público (world content)
- Spots pueden ser creados por cualquier usuario
- Spots no son propiedad del usuario que los crea

### Uso de Datos

**Por FLOWYA:**
- Datos se usan solo para funcionalidad de la app
- Datos NO se usan para publicidad sin consentimiento
- Datos NO se venden a terceros
- Datos NO se comparten con terceros sin consentimiento explícito

**Por el Usuario:**
- Usuario puede usar sus datos libremente
- Usuario puede exportar sus datos (futuro)
- Usuario puede eliminar sus datos

### Sincronización de Datos

**Funcionalidad:**
- Datos se sincronizan automáticamente entre dispositivos
- Sincronización requiere conexión a internet
- Datos se mantienen localmente para uso offline

**Responsabilidad:**
- Usuario es responsable de mantener seguridad de su cuenta
- Usuario es responsable de no compartir credenciales
- FLOWYA no es responsable de acceso no autorizado por credenciales comprometidas

### Eliminación de Datos

**Eliminación por Usuario:**
- Usuario puede eliminar Pins individuales
- Usuario puede eliminar notas y fotos
- Eliminación de cuenta elimina todos los datos (futuro)

**Eliminación Automática:**
- Datos se eliminan al eliminar cuenta
- Datos se eliminan después de período de inactividad (futuro, según política)

**Retención:**
- Datos se mantienen mientras cuenta esté activa
- Backup automático por Supabase (política de Supabase)
- Datos eliminados pueden estar en backups por período limitado

### Servicio de Infraestructura

**Supabase:**
- FLOWYA usa Supabase como proveedor de infraestructura
- Datos se almacenan en servidores de Supabase
- Políticas de privacidad de Supabase aplican
- Ubicación de servidores puede variar según región de Supabase

**Responsabilidad:**
- FLOWYA es responsable de seguridad de aplicación
- Supabase es responsable de seguridad de infraestructura
- Usuario debe revisar políticas de Supabase

---

## CUMPLIMIENTO LEGAL

### GDPR (Reglamento General de Protección de Datos)

**Aplicabilidad:**
- FLOWYA debe cumplir con GDPR si tiene usuarios en UE
- Usuarios tienen derechos bajo GDPR

**Derechos del Usuario (GDPR):**
1. Derecho de acceso
2. Derecho de rectificación
3. Derecho de eliminación ("derecho al olvido")
4. Derecho de limitación del procesamiento
5. Derecho de portabilidad de datos
6. Derecho de oposición
7. Derecho a no ser objeto de decisiones automatizadas

**Implementación Actual:**
- ✅ Aislamiento de datos por usuario (RLS)
- ✅ Usuario puede eliminar Pins
- ✅ Usuario puede editar notas
- ⚠️ Eliminación de cuenta (pendiente)
- ⚠️ Exportación de datos (pendiente)

**Referencia:** `DECISIONES_CANONICAS_V1_3.md` - Decisiones futuras (eliminación de cuenta)

### Otras Regulaciones

**CCPA (California Consumer Privacy Act):**
- Similar a GDPR
- Usuarios de California tienen derechos similares

**LOPD (Ley Orgánica de Protección de Datos - España):**
- Similar a GDPR
- Usuarios de España tienen derechos similares

**Implementación:**
- Misma implementación que GDPR
- Políticas aplican a todos los usuarios independientemente de ubicación

---

## SEGURIDAD DE DATOS

### Medidas de Seguridad

1. **Row Level Security (RLS):**
   - Aislamiento de datos por usuario
   - Usuarios solo pueden acceder a sus propios datos
   - Políticas implementadas en Supabase

2. **Autenticación:**
   - Supabase Auth para autenticación segura
   - Contraseñas hasheadas (no almacenadas en texto plano)
   - Tokens de sesión seguros

3. **Encriptación:**
   - Encriptación en tránsito (HTTPS)
   - Encriptación en reposo (Supabase)
   - Cache local puede requerir encriptación adicional (futuro)

4. **Validación:**
   - Validación en aplicación (además de RLS)
   - Validación en servidor (RLS)
   - Múltiples capas de seguridad

**Referencia:** `SEGURIDAD_V1_3.md`

### Notificación de Brechas

**Política:**
- FLOWYA notificará a usuarios si hay brecha de seguridad
- Notificación dentro de 72 horas (según GDPR)
- Usuarios serán informados de medidas a tomar

**Implementación:**
- Proceso de notificación pendiente (futuro)
- Monitoreo de seguridad pendiente (futuro)

---

## DERECHOS DEL USUARIO

### Acceso a Datos

**Funcionalidad Actual:**
- Usuario puede ver todos sus Pins en app
- Usuario puede ver sus notas y fotos
- Usuario puede ver estados de Pins

**Funcionalidad Futura:**
- Exportación de datos en formato estándar (JSON, CSV)
- Descarga de datos personales
- Historial de cambios

### Eliminación de Datos

**Funcionalidad Actual:**
- Usuario puede eliminar Pins individuales
- Usuario puede eliminar notas
- Usuario puede eliminar fotos
- Eliminación es inmediata y permanente

**Funcionalidad Futura:**
- Eliminación de cuenta completa
- Eliminación de todos los datos asociados
- Confirmación de eliminación

### Rectificación de Datos

**Funcionalidad Actual:**
- Usuario puede editar notas
- Usuario puede cambiar estado de Pin
- Cambios se sincronizan automáticamente

**Funcionalidad Futura:**
- Edición de datos de cuenta
- Corrección de datos incorrectos

---

## POLÍTICA DE RETENCIÓN

### Retención de Datos

**Datos de Pins:**
- Se mantienen mientras cuenta esté activa
- Se eliminan al eliminar cuenta (futuro)
- No hay límite de tiempo de retención mientras cuenta esté activa

**Datos de Autenticación:**
- Se mantienen mientras cuenta esté activa
- Se eliminan al eliminar cuenta
- Política de Supabase Auth aplica

**Backups:**
- Supabase mantiene backups automáticos
- Backups pueden contener datos eliminados por período limitado
- Política de retención de backups según Supabase

### Eliminación de Datos

**Eliminación por Usuario:**
- Eliminación de Pin: Inmediata y permanente
- Eliminación de notas/fotos: Inmediata y permanente
- Eliminación de cuenta: Pendiente (futuro)

**Eliminación Automática:**
- Después de período de inactividad (pendiente, según política)
- Después de solicitud de eliminación de cuenta

---

## COMPARTIR Y TERCEROS

### Compartir con Otros Usuarios

**Funcionalidad:**
- Usuario puede compartir mapas de Pins con otros usuarios
- Solo se comparten IDs de Spots y estados
- NO se comparten notas ni fotos personales

**Control del Usuario:**
- Usuario controla qué comparte
- Usuario puede revocar acceso en cualquier momento
- Compartir es opcional

**Referencia:** `SISTEMA_COMPARTIR_V1_3.md`

### Terceros

**Supabase:**
- Proveedor de infraestructura
- Almacena datos en servidores de Supabase
- Políticas de privacidad de Supabase aplican
- No se comparten datos con otros terceros

**Otros Terceros:**
- No se comparten datos con otros terceros sin consentimiento
- No se venden datos a terceros
- No se usan datos para publicidad sin consentimiento

---

## NOTIFICACIONES Y COMUNICACIÓN

### Cambios en Políticas

**Notificación:**
- Usuarios serán notificados de cambios en políticas de privacidad
- Notificación en app o por email
- Usuario debe aceptar cambios para continuar usando app

**Implementación:**
- Sistema de notificaciones pendiente (futuro)
- Versión de políticas de privacidad (pendiente)

### Comunicación con Usuarios

**Canales:**
- Email (si usuario proporciona)
- Notificaciones en app (futuro)
- No se envía spam ni publicidad no solicitada

---

## RESPONSABILIDADES

### Responsabilidades de FLOWYA

1. **Seguridad:**
   - Proteger datos del usuario
   - Implementar medidas de seguridad adecuadas
   - Notificar brechas de seguridad

2. **Transparencia:**
   - Informar qué datos se recopilan
   - Informar cómo se usan los datos
   - Informar con quién se comparten datos

3. **Cumplimiento:**
   - Cumplir con regulaciones aplicables (GDPR, CCPA, etc.)
   - Respetar derechos del usuario
   - Proporcionar mecanismos para ejercer derechos

### Responsabilidades del Usuario

1. **Seguridad de Cuenta:**
   - Mantener credenciales seguras
   - No compartir credenciales
   - Notificar acceso no autorizado

2. **Uso Apropiado:**
   - Usar app según términos de uso
   - No usar app para actividades ilegales
   - Respetar derechos de otros usuarios

3. **Datos Compartidos:**
   - Usuario es responsable de contenido que comparte
   - Usuario es responsable de permisos otorgados
   - Usuario debe revocar acceso si es necesario

---

## CONTACTO Y RECLAMACIONES

### Contacto

**Para Preguntas sobre Privacidad:**
- Email: [pendiente definir]
- Formulario en app: [pendiente implementar]

**Para Ejercer Derechos:**
- Solicitud de acceso a datos
- Solicitud de eliminación de datos
- Solicitud de rectificación de datos
- Solicitud de portabilidad de datos

**Implementación:**
- Proceso de contacto pendiente (futuro)
- Formulario de solicitud pendiente (futuro)

### Reclamaciones

**Autoridades Supervisoras:**
- Usuarios pueden presentar reclamaciones a autoridades supervisoras
- Autoridad relevante según ubicación del usuario
- FLOWYA cooperará con autoridades supervisoras

---

## ACTUALIZACIONES DE POLÍTICAS

### Versión de Políticas

**Versión Actual:** V1.3 (2026-01-11)

**Historial:**
- V1.2: Solo datos locales (AsyncStorage)
- V1.3: Datos persistentes en servidor (Supabase)

### Cambios Futuros

**Notificación:**
- Usuarios serán notificados de cambios
- Cambios significativos requieren nueva aceptación
- Versión de políticas se actualizará

---

## DECISIONES PENDIENTES (Fuera de Alcance V1.3)

### Eliminación de Cuenta

**Estado:** Pendiente (futuro)

**Consideraciones:**
- Proceso de eliminación de cuenta
- Eliminación de todos los datos asociados
- Tiempo de retención en backups
- Confirmación de eliminación

**Referencia:** `DECISIONES_CANONICAS_V1_3.md` - Decisiones futuras

### Exportación de Datos

**Estado:** Pendiente (futuro)

**Consideraciones:**
- Formato de exportación (JSON, CSV, PDF)
- Incluir todos los datos del usuario
- Proceso de descarga
- Frecuencia de exportación

### Política de Retención Detallada

**Estado:** Pendiente (futuro)

**Consideraciones:**
- Período de retención después de inactividad
- Retención en backups
- Política de eliminación automática

---

## CHECKLIST DE CUMPLIMIENTO

### GDPR

- [x] Aislamiento de datos por usuario (RLS)
- [x] Usuario puede eliminar Pins
- [x] Usuario puede editar notas
- [ ] Eliminación de cuenta (pendiente)
- [ ] Exportación de datos (pendiente)
- [ ] Notificación de brechas (pendiente)
- [ ] Política de privacidad visible en app (pendiente)

### Términos de Uso

- [ ] Términos de uso completos (pendiente)
- [ ] Aceptación de términos al crear cuenta (pendiente)
- [ ] Versión de términos visible (pendiente)

---

**Última actualización:** 2026-01-11  
**Estado:** Documentación inicial de privacidad y términos creada

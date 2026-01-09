# Checklist de Testing - Scope 9

**Fecha:** 2024-12-20  
**Versión:** 1.0  
**Objetivo:** Checklist completo para validar todos los flujos después de la refactorización

---

## 1. Flujo de Creación de Spots

### 1.1. Creación desde Mapa (Long Press)
- [ ] Long press en mapa abre pantalla de creación
- [ ] Ubicación se inicializa correctamente desde coordenadas
- [ ] Mapa muestra pin en ubicación correcta
- [ ] Usuario puede ajustar ubicación en mapa
- [ ] Usuario puede buscar dirección
- [ ] Usuario puede subir foto
- [ ] Foto se optimiza automáticamente
- [ ] Usuario puede agregar nombre (opcional)
- [ ] Usuario puede agregar descripción (opcional)
- [ ] Usuario puede seleccionar tipo
- [ ] Campos avanzados están ocultos inicialmente
- [ ] Botón "Show advanced fields" muestra campos adicionales
- [ ] Validación: No se puede enviar sin foto
- [ ] Validación: No se puede enviar sin ubicación
- [ ] Botón "Send" se habilita solo cuando hay foto y ubicación
- [ ] Spot se crea correctamente
- [ ] Mensaje de éxito se muestra
- [ ] Navegación de regreso funciona

### 1.2. Creación desde Botón "+" en Mapa
- [ ] Botón "+" abre pantalla de creación
- [ ] Usa ubicación del usuario si está disponible
- [ ] Fallback a ubicación por defecto si no hay ubicación del usuario
- [ ] Resto del flujo igual que long press

### 1.3. Creación desde Búsqueda
- [ ] Botón de crear desde búsqueda abre pantalla de creación
- [ ] Usa ubicación del usuario o fallback
- [ ] Resto del flujo igual que long press

### 1.4. Creación con IA
- [ ] Botón "AI" aparece si API está configurada y hay ubicación
- [ ] Botón "AI" no aparece si API no está configurada
- [ ] Al presionar "AI", se genera contenido
- [ ] Preview de contenido se muestra
- [ ] Usuario puede aceptar contenido generado
- [ ] Usuario puede rechazar contenido generado
- [ ] Usuario puede editar antes de aceptar
- [ ] Contenido aceptado se pre-llena en campos
- [ ] Todos los campos generados son visibles en preview
- [ ] Manejo de errores funciona (timeout, API error, etc.)

### 1.5. Progressive Disclosure
- [ ] Campos básicos se muestran inicialmente
- [ ] Campos avanzados están ocultos
- [ ] Botón "Show advanced fields" funciona
- [ ] Botón "Hide advanced fields" funciona
- [ ] Campos avanzados incluyen: Why it matters, Cultural context

---

## 2. Flujo de Edición de Spots

### 2.1. Entrada a Modo Edición
- [ ] Menú (tres puntos) se muestra en Spot Detail
- [ ] Opción "Suggest an edit" funciona
- [ ] Modo edición se activa correctamente
- [ ] Todos los campos se inicializan con valores actuales
- [ ] Header cambia (botón close en lugar de back)
- [ ] Botones de acción (save, bookmark, share) se ocultan

### 2.2. Edición de Campos
- [ ] Nombre se puede editar
- [ ] Tipo se puede cambiar
- [ ] Why it matters se puede editar
- [ ] Cultural context se puede editar
- [ ] Ubicación se puede ajustar (mapa + inputs manuales)
- [ ] Foto se puede cambiar
- [ ] How to visit se puede editar (2 tips con iconos)
- [ ] Horarios se pueden editar (7 días)
- [ ] Costo se puede editar (amount, currency, description)
- [ ] Restrictions se puede editar
- [ ] Accessibility se puede editar

### 2.3. Selector de Iconos
- [ ] Selector de iconos se abre al presionar icono
- [ ] Grid de iconos se muestra correctamente
- [ ] Selección de icono funciona
- [ ] Selector se cierra después de seleccionar
- [ ] Icono seleccionado se actualiza en UI

### 2.4. Edición con IA
- [ ] Botón "AI" aparece en modo edición
- [ ] Al presionar "AI", se genera contenido
- [ ] Preview de contenido se muestra
- [ ] Usuario puede aceptar/rechazar/editar
- [ ] Contenido aceptado se pre-llena
- [ ] Solo se generan campos faltantes (no se duplica contenido existente)

### 2.5. Guardado de Cambios
- [ ] Botón "Save" guarda todos los cambios
- [ ] Cambios se persisten en AsyncStorage
- [ ] Mensaje de éxito se muestra
- [ ] Modo edición se desactiva
- [ ] Spot se actualiza en contexto
- [ ] UI refleja cambios guardados

### 2.6. Cancelación
- [ ] Botón "Cancel" funciona
- [ ] Si hay cambios sin guardar, se muestra confirmación
- [ ] Si no hay cambios, se cancela inmediatamente
- [ ] Confirmación permite "Keep editing" o "Discard"
- [ ] Al descartar, todos los cambios se pierden
- [ ] Modo edición se desactiva correctamente

### 2.7. How to Visit
- [ ] En visualización, se lee de `spot.howToVisit`
- [ ] Se muestran ambos tips si existen
- [ ] Iconos se muestran correctamente
- [ ] En edición, se pueden editar ambos tips
- [ ] Cambios se guardan correctamente

---

## 3. Validaciones

### 3.1. Creación
- [ ] Foto es requerida
- [ ] Ubicación es requerida
- [ ] Nombre es opcional
- [ ] Descripción es opcional
- [ ] Tipo tiene default 'other'
- [ ] Mensajes de error se muestran correctamente

### 3.2. Edición
- [ ] Todos los campos son opcionales
- [ ] Se puede guardar sin cambios
- [ ] Se puede guardar con campos vacíos
- [ ] Campos vacíos se guardan como `undefined`

---

## 4. Integración OpenAI API

### 4.1. Configuración
- [ ] Botón "AI" no aparece si API no está configurada
- [ ] Mensaje de error se muestra si se intenta usar sin configuración
- [ ] Botón "AI" aparece si API está configurada

### 4.2. Generación
- [ ] Generación funciona correctamente
- [ ] Solo se generan campos faltantes
- [ ] No se duplica contenido existente
- [ ] Preview muestra todos los campos generados
- [ ] Manejo de errores funciona (timeout, API error, rate limit)

### 4.3. Preview
- [ ] Preview se muestra correctamente
- [ ] Opción "Accept" aplica contenido
- [ ] Opción "Reject" descarta contenido
- [ ] Opción "Edit" aplica y muestra campos avanzados

### 4.4. Fallback
- [ ] Si hay error, se retorna contenido existente
- [ ] No se lanza excepción que rompa el flujo
- [ ] Mensaje de error se muestra al usuario

---

## 5. Componentes Canónicos

### 5.1. FormField
- [ ] Label se muestra correctamente
- [ ] Indicador de requerido funciona
- [ ] Mensaje de error se muestra si hay error
- [ ] Children se renderizan correctamente

### 5.2. FormTextInput
- [ ] Estados: default, focused, error, disabled
- [ ] Iconos izquierda/derecha funcionan
- [ ] Placeholder se muestra correctamente
- [ ] Área táctil mínima 48px

### 5.3. FormTextArea
- [ ] Multiline funciona
- [ ] Número de líneas se respeta
- [ ] Estados funcionan correctamente

### 5.4. FormTypeSelector
- [ ] Grid horizontal se muestra
- [ ] Selección funciona
- [ ] Estado seleccionado se muestra correctamente

### 5.5. FormImagePicker
- [ ] Placeholder se muestra si no hay imagen
- [ ] Selección de imagen funciona
- [ ] Optimización automática funciona
- [ ] Botón de remover funciona
- [ ] Estados de carga se muestran

### 5.6. FormMapSelector
- [ ] Búsqueda por dirección funciona
- [ ] Mapa interactivo funciona
- [ ] Long press en mapa actualiza ubicación
- [ ] Inputs manuales funcionan (si están habilitados)
- [ ] Coordenadas se muestran

### 5.7. FormIconSelector
- [ ] Modal se abre/cierra correctamente
- [ ] Grid de iconos se muestra
- [ ] Selección funciona
- [ ] Estado seleccionado se muestra

### 5.8. AIContentPreview
- [ ] Preview se muestra correctamente
- [ ] Todos los campos generados son visibles
- [ ] Botones Accept/Reject/Edit funcionan
- [ ] Estilos son correctos

### 5.9. AIGenerateButton
- [ ] Estados: default, loading funcionan
- [ ] Tamaños: small, medium, large
- [ ] Deshabilitado funciona
- [ ] Long press funciona (si está implementado)

---

## 6. Hook useSpotForm

### 6.1. Estados
- [ ] Todos los campos se inicializan correctamente
- [ ] Cambios se detectan correctamente
- [ ] `hasChanges` funciona correctamente

### 6.2. Validación
- [ ] `isValid` funciona correctamente
- [ ] `errors` se actualiza correctamente
- [ ] Validaciones son correctas

### 6.3. Imagen
- [ ] `pickImage` funciona
- [ ] `removeImage` funciona
- [ ] `isOptimizingImage` se actualiza correctamente

### 6.4. IA
- [ ] `generateContent` funciona
- [ ] `previewContent` se actualiza
- [ ] `isGeneratingAI` se actualiza
- [ ] `aiError` se maneja correctamente

### 6.5. Acciones
- [ ] `handleSave` funciona
- [ ] `handleCancel` funciona
- [ ] `reset` funciona

---

## 7. Spots Incompletos

### 7.1. Validación
- [ ] Spot puede existir solo con foto y ubicación
- [ ] Nombre es opcional
- [ ] Descripción es opcional
- [ ] Otros campos son opcionales

### 7.2. Visualización
- [ ] Spots incompletos se muestran correctamente
- [ ] Campos faltantes no causan errores
- [ ] UI maneja campos undefined correctamente

---

## 8. Narraciones

### 8.1. Generación
- [ ] Narraciones se generan correctamente
- [ ] Formato es correcto (anticipation, presence, transition)
- [ ] Se guardan en `spot.narration`

### 8.2. Uso en Flow
- [ ] `generateNarrationText()` prioriza `spot.narration`
- [ ] Fallbacks funcionan si no hay narración generada
- [ ] Narraciones se usan en Flow activo

---

## 9. Persistencia

### 9.1. AsyncStorage
- [ ] Spots se guardan automáticamente
- [ ] Spots se cargan correctamente al iniciar
- [ ] Merge con mockSpots funciona
- [ ] Fechas se convierten correctamente

### 9.2. Sincronización
- [ ] Cambios se persisten inmediatamente
- [ ] No hay pérdida de datos
- [ ] Múltiples cambios se guardan correctamente

---

## 10. Regresiones

### 10.1. Funcionalidad Existente
- [ ] Creación desde mapa funciona
- [ ] Creación desde búsqueda funciona
- [ ] Edición funciona
- [ ] Eliminación funciona
- [ ] Guardado funciona
- [ ] Navegación funciona
- [ ] Permisos funcionan

### 10.2. UI/UX
- [ ] Diseño es consistente
- [ ] Tokens del design system se usan correctamente
- [ ] Animaciones funcionan
- [ ] Feedback visual funciona
- [ ] Estados de carga se muestran

---

## 11. Casos Edge

### 11.1. Sin Ubicación
- [ ] App funciona sin permisos de ubicación
- [ ] Modo manual funciona
- [ ] Fallbacks funcionan

### 11.2. Sin API Key
- [ ] App funciona sin API key
- [ ] Botones AI no aparecen
- [ ] No hay errores

### 11.3. Errores de Red
- [ ] Timeout se maneja correctamente
- [ ] Errores de API se manejan
- [ ] Fallbacks funcionan

### 11.4. Imágenes
- [ ] Sin foto, placeholder se muestra
- [ ] Error al optimizar se maneja
- [ ] Permisos se manejan

---

## 12. Performance

### 12.1. Renders
- [ ] No hay renders innecesarios
- [ ] Componentes están optimizados
- [ ] Estados se actualizan eficientemente

### 12.2. Carga
- [ ] Pantallas cargan rápidamente
- [ ] Imágenes se optimizan correctamente
- [ ] No hay bloqueos de UI

---

## Notas de Testing

- Probar en diferentes dispositivos (iOS, Android, Web)
- Probar con y sin permisos
- Probar con y sin API key
- Probar con conexión lenta/intermitente
- Probar casos edge (sin datos, errores, etc.)

---

**Documento generado:** 2024-12-20  
**Versión del Proyecto:** FLOWYA V1.0  
**Última actualización:** Checklist completo de testing para validar refactorización

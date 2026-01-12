# TESTING MANUAL - FLOWYA V1.2

**Fecha:** 2026-01-11  
**Versión:** FLOWYA V1.2  
**Tipo:** Testing manual en tiempo de ejecución  
**Estado:** Pendiente

---

## PROPÓSITO

Este documento contiene el checklist completo de testing manual para validar todas las funcionalidades implementadas en FLOWYA V1.2.

**Importante:** Este testing debe realizarse en tiempo de ejecución, ejecutando la aplicación y probando cada funcionalidad manualmente.

---

## PREPARACIÓN

### Requisitos Previos
- [ ] Aplicación compilada y ejecutándose
- [ ] Acceso a cuenta de usuario (para probar validación de autenticación)
- [ ] Acceso sin cuenta (usuario no autenticado)
- [ ] Datos de prueba: spots, flows, etc.

### Ambientes de Testing
- [ ] Web (Chrome/Firefox/Safari)
- [ ] iOS (simulador o dispositivo físico)
- [ ] Android (emulador o dispositivo físico)

---

## FASE 1: MODELO DE DATOS

### 1.1 Funciones de Pin
- [ ] **pinSpot()**: Crear pin con estado 'to_visit'
- [ ] **pinSpot()**: Crear pin con estado 'visited'
- [ ] **unpinSpot()**: Eliminar pin existente
- [ ] **changePinState()**: Cambiar estado de 'to_visit' a 'visited'
- [ ] **changePinState()**: Cambiar estado de 'visited' a 'to_visit'
- [ ] **isSpotPinned()**: Verificar que retorna true para spot pinned
- [ ] **isSpotPinned()**: Verificar que retorna false para spot no pinned
- [ ] **getPinState()**: Verificar que retorna 'to_visit' para pin to_visit
- [ ] **getPinState()**: Verificar que retorna 'visited' para pin visited
- [ ] **getPinState()**: Verificar que retorna null para spot no pinned

### 1.2 Persistencia de Datos
- [ ] Crear pin y cerrar/reabrir app: pin debe persistir
- [ ] Cambiar estado de pin y cerrar/reabrir app: estado debe persistir
- [ ] Eliminar pin y cerrar/reabrir app: pin debe permanecer eliminado
- [ ] Crear múltiples pins: todos deben persistir

### 1.3 Migración de Datos (si aplica)
- [ ] Verificar que spots guardados anteriormente se migraron a pins
- [ ] Verificar que liked spots se migraron a pins
- [ ] Verificar que flag de migración se estableció correctamente

---

## FASE 2: UI - BOTONES Y ACCIONES

### 2.1 SpotMediaCard - Pin
- [ ] **Botón Pin visible**: Icono 'pin' visible en card
- [ ] **Pin desde card**: Presionar icono pin crea pin con estado 'to_visit'
- [ ] **Toast aparece**: Toast "Pinned · To visit" aparece en parte inferior de pantalla
- [ ] **Icono cambia**: Icono cambia a 'pin' coloreado cuando está pinned
- [ ] **Toggle cíclico**: 
  - [ ] 1er tap (no pinned → pinned): Crea pin 'to_visit'
  - [ ] 2do tap (pinned 'to_visit'): Cambia a 'visited', toast "Changed to Visited"
  - [ ] 3er tap (pinned 'visited'): Elimina pin, toast "Pin removido"
  - [ ] 4to tap (no pinned): Vuelve a crear pin 'to_visit'
- [ ] **Icono visited**: Cuando estado es 'visited', icono es 'check-circle' (verde)
- [ ] **Icono to_visit**: Cuando estado es 'to_visit', icono es 'pin' (azul)
- [ ] **Modal primera vez**: 
  - [ ] Primera vez que usuario hace pin (cualquier spot): Modal aparece
  - [ ] Después de primera vez: Modal NO aparece (pin directo)
  - [ ] Modal solo aparece UNA vez por usuario (no por cada spot)

### 2.2 SpotMediaCard - Validación Autenticación
- [ ] **Usuario no autenticado**: Presionar pin muestra alerta de login
- [ ] **Alerta tiene opción login**: Alerta tiene botón "Iniciar sesión"
- [ ] **Navegación a login**: Botón "Iniciar sesión" navega a pantalla de login
- [ ] **Usuario autenticado**: Puede pin normalmente sin alerta

### 2.3 spot-detail.tsx - Pin
- [ ] **Botón Pin visible**: Icono 'pin' visible en header
- [ ] **Pin desde detalle**: Presionar icono pin crea pin con estado 'to_visit'
- [ ] **Toast aparece**: Toast "Pinned · To visit" aparece en parte inferior de pantalla
- [ ] **Toggle cíclico**: Mismo comportamiento que SpotMediaCard
- [ ] **Icono visited**: Icono 'check-circle' cuando estado es 'visited'
- [ ] **Icono to_visit**: Icono 'pin' cuando estado es 'to_visit'
- [ ] **Modal primera vez**: Mismo comportamiento que SpotMediaCard

### 2.4 spot-detail.tsx - Validación Autenticación
- [ ] **Usuario no autenticado**: Presionar pin muestra alerta de login
- [ ] **Navegación a login**: Funciona correctamente

### 2.5 Toast con Modal Transparente (Ajuste 03)
- [ ] **Toast aparece en parte inferior**: Toast siempre aparece en parte inferior de pantalla (no dentro de card)
- [ ] **Toast funciona en variant small**: Toast aparece correctamente en SpotMediaCard size="small"
- [ ] **Toast funciona en variant large**: Toast aparece correctamente en SpotMediaCard size="large"
- [ ] **Mensajes correctos**: 
  - [ ] "Pinned · To visit"
  - [ ] "Pinned · Visited"
  - [ ] "Changed to Visited"
  - [ ] "Pin removido"
- [ ] **Toast desaparece**: Toast desaparece automáticamente después de timeout

### 2.6 Modal Primera Vez (Ajuste 03)
- [ ] **Modal solo una vez**: Modal se muestra solo UNA vez por usuario (no por cada spot)
- [ ] **Modal después de primera vez**: Después de primera vez, pin directo sin modal
- [ ] **Consistencia entre cards**: Modal no aparece si ya se mostró en otra card

### 2.7 Eliminación de Like
- [ ] **Botón Like eliminado**: No aparece botón Like en flow-full-player
- [ ] **Sección Liked eliminada**: No aparece sección "Liked places" en profile
- [ ] **FlowPlayerControls**: Botón Like visible pero no funcional (temporal, esperado)

---

## FASE 3: PINNED SCREEN

### 3.1 Filtro por Estado de Pin
- [ ] **PinStateFilter visible**: Filtro aparece debajo del header cuando se muestran spots
- [ ] **Opciones del filtro**: "All" | "To Visit" | "Visited" visibles
- [ ] **Filtro "All"**: Muestra todos los pins (to_visit y visited)
- [ ] **Filtro "To Visit"**: Muestra solo pins con estado 'to_visit'
- [ ] **Filtro "Visited"**: Muestra solo pins con estado 'visited'
- [ ] **Cambio de filtro**: Al cambiar filtro, lista se actualiza correctamente

### 3.2 Combinación de Filtros
- [ ] **Filtro tipo × estado**: Filtro de tipo (Spots/Flows/All) funciona con filtro de estado
- [ ] **Spots + To Visit**: Muestra solo spots pinned con estado 'to_visit'
- [ ] **Spots + Visited**: Muestra solo spots pinned con estado 'visited'
- [ ] **Spots + All**: Muestra todos los spots pinned (ambos estados)

### 3.3 Lista de Pins
- [ ] **Pins se muestran**: Spots pinned aparecen en la lista
- [ ] **Pins correctos**: Solo spots pinned aparecen (no todos los spots)
- [ ] **Orden correcto**: Pins aparecen en orden lógico
- [ ] **Actualización en tiempo real**: Si se agrega/elimina pin, lista se actualiza

---

## FASE 4: DIARIO DE VIAJE

### 4.1 Notas de Pin
- [ ] **Agregar notas**: Botón para agregar notas visible en spot-detail
- [ ] **Editor de notas**: Al presionar botón, editor de notas se abre
- [ ] **Guardar notas**: Notas se guardan correctamente
- [ ] **Notas persisten**: Notas persisten después de cerrar/reabrir app
- [ ] **Editar notas**: Notas existentes se pueden editar
- [ ] **Eliminar notas**: Notas se pueden eliminar
- [ ] **Sin límite de caracteres**: Se pueden escribir notas largas
- [ ] **Toast "Notas guardadas"**: Toast aparece al guardar notas

### 4.2 Fotos Personales de Pin
- [ ] **Agregar foto**: Botón para agregar foto personal visible
- [ ] **Selector de imagen**: Al presionar botón, selector de imagen se abre
- [ ] **Guardar foto**: Foto se guarda correctamente
- [ ] **Fotos persisten**: Fotos persisten después de cerrar/reabrir app
- [ ] **Múltiples fotos**: Se pueden agregar múltiples fotos
- [ ] **Ver fotos**: Fotos se muestran correctamente
- [ ] **Eliminar foto**: Fotos se pueden eliminar
- [ ] **Toast "Foto agregada"**: Toast aparece al agregar foto
- [ ] **Toast "Foto eliminada"**: Toast aparece al eliminar foto

### 4.3 Diario Solo para Visited
- [ ] **Notas solo visited**: Notas y fotos solo disponibles para pins con estado 'visited'
- [ ] **to_visit no tiene diario**: Pins con estado 'to_visit' no muestran opciones de diario

---

## FASE 5: COMPARTIR Y MAPA

### 5.1 Markers en Mapa
- [ ] **Markers normales**: Spots no pinned muestran markers normales
- [ ] **Markers to_visit**: Spots pinned con estado 'to_visit' muestran markers azules
- [ ] **Markers visited**: Spots pinned con estado 'visited' muestran markers verdes
- [ ] **Reemplazo de markers**: Cuando se pin un spot, marker se reemplaza correctamente
- [ ] **Markers correctos**: Markers muestran el estado correcto del pin

### 5.2 Filtro en Mapa
- [ ] **Filtro de estado visible**: Filtro aparece en mapa
- [ ] **Filtro "All"**: Muestra todos los markers (normales, to_visit, visited)
- [ ] **Filtro "To Visit"**: Muestra solo markers de pins 'to_visit'
- [ ] **Filtro "Visited"**: Muestra solo markers de pins 'visited'
- [ ] **Cambio de filtro**: Al cambiar filtro, markers se actualizan

### 5.3 Compartir Mapas de Pines
- [ ] **Botón compartir**: Botón para compartir mapa de pines visible
- [ ] **Compartir to_visit**: Compartir mapa de pines 'to_visit' funciona
- [ ] **Compartir visited**: Compartir mapa de pines 'visited' funciona
- [ ] **URL generada**: URL se genera correctamente
- [ ] **URL funciona**: URL compartida abre el mapa correcto

### 5.4 Compartir Flows
- [ ] **Botón compartir flow**: Botón para compartir flow visible
- [ ] **Compartir flow**: Compartir flow funciona
- [ ] **URL generada**: URL se genera correctamente
- [ ] **URL funciona**: URL compartida abre el flow correcto

---

## TESTING TRANSVERSAL

### Performance
- [ ] **Carga inicial**: App carga sin errores
- [ ] **Scroll fluido**: Scroll en listas es fluido
- [ ] **Sin lag**: No hay lag al hacer pin/unpin
- [ ] **Memoria**: No hay leaks de memoria aparentes

### Compatibilidad
- [ ] **Web**: Todas las funcionalidades funcionan en web
- [ ] **iOS**: Todas las funcionalidades funcionan en iOS
- [ ] **Android**: Todas las funcionalidades funcionan en Android

### UX/UI
- [ ] **Iconos claros**: Iconos son fáciles de distinguir
- [ ] **Feedback visual**: Feedback visual es claro (iconos, toasts)
- [ ] **Navegación intuitiva**: Navegación es intuitiva
- [ ] **Consistencia**: Comportamiento es consistente en todas las pantallas

---

## RESULTADOS

### Resumen
- **Total de casos de prueba**: ___
- **Casos pasados**: ___
- **Casos fallidos**: ___
- **Casos bloqueados**: ___

### Problemas Encontrados
(Registrar aquí cualquier problema encontrado durante el testing)

1. **Problema 1**:
   - Descripción:
   - Pasos para reproducir:
   - Severidad:
   - Pantalla/Componente:

2. **Problema 2**:
   - Descripción:
   - Pasos para reproducir:
   - Severidad:
   - Pantalla/Componente:

### Notas Adicionales
(Registrar aquí cualquier observación adicional)

---

**Fecha de testing:** ___  
**Tester:** ___  
**Ambiente:** ___

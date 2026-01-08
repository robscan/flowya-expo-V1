# Contratos Canónicos del Design System

**Estado**: ✅ CONGELADO - Listos para uso sin cambios necesarios

**Fecha**: 2025-01-27

---

## Resumen Ejecutivo

Todos los componentes del Design System tienen contratos claros, bien definidos y listos para uso. No se requieren cambios inmediatos. Se han identificado 3 propuestas de ajuste opcionales para futuras iteraciones.

---

## Componentes Canónicos Confirmados

### 1. SpotCard
**Ubicación**: `components/SpotCard.tsx`

**Contrato**:
```typescript
interface SpotCardProps {
  spot: Spot;
  state: 'active' | 'next' | 'add' | 'default';
  onPress?: () => void;
  distance?: number; // En metros
  orderNumber?: number; // Solo para estado 'next'
  onAdd?: () => void; // Solo para estado 'add'
  // Props de modo edición (solo para estado 'next')
  isEditMode?: boolean;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}
```

**Responsabilidad**: Representar un spot en diferentes estados contextuales

**Estados**:
- `active`: Spot actual en flow activo
- `next`: Spot siguiente en flow (con número de orden)
- `add`: Spot para agregar al flow (con icono add)
- `default`: Exploración normal (sin slot izquierdo)

**Uso por pantalla**:
- `Home`: `state="default"`
- `Search`: `state="default"`
- `Saved`: `state="default"`
- `FlowScreen`: `state="active" | "next" | "add"`
- `FlowFullPlayer`: `state="active"`

**Notas**:
- NO tiene variantes `large`/`small` explícitas (el tamaño se controla desde el layout)
- Usa `InfoMeta` con `size="small"` para metadata
- Modo edición solo disponible para estado `next`

---

### 2. SpotCardCompact
**Ubicación**: `components/SpotCardCompact.tsx`

**Contrato**:
```typescript
interface SpotCardCompactProps {
  spot: Spot;
  onPress?: () => void;
  onMapPress?: () => void;
  distance?: number; // En metros
}
```

**Responsabilidad**: Card compacta para sliders secundarios en Home

**Características**: 
- Imagen cuadrada 160px
- Título debajo de imagen
- Distancia + "View on map" debajo del título
- Sin descripción

**Uso por pantalla**:
- `Home`: Sliders secundarios (Recently Viewed, Maybe You Like, New)

**Notas**: 
- Componente separado justificado por diferencias estructurales (imagen arriba vs layout horizontal de SpotCard)
- Mantener como componente separado

---

### 3. FlowCard
**Ubicación**: `components/FlowCard.tsx`

**Contrato**:
```typescript
interface FlowCardProps {
  flow: Flow;
  spots: Spot[]; // Array completo para calcular distancia
  onPress?: () => void;
  distance?: number; // Opcional (si ya está calculada)
  customName?: string; // Nombre personalizado
}
```

**Responsabilidad**: Representar un Flow en listas de exploración

**Características**:
- Layout horizontal
- Título + movement mode chip
- Metadata (distancia, duración, spots count)

**Uso por pantalla**:
- `Home`: Listas verticales de flows
- `Search`: Resultados de búsqueda de flows
- `Saved`: Flows guardados

**Notas**:
- No tiene variantes (no las necesita)
- Usa tokens del Design System consistentemente

---

### 4. FlowSpotCard
**Ubicación**: `components/FlowSpotCard.tsx`

**Contrato**:
```typescript
interface FlowSpotCardProps {
  spot: Spot;
  index: number; // Número de orden (0-based)
  onPress?: () => void;
  distance?: number; // En metros
  estimatedTime?: number; // En minutos
  isActive?: boolean;
  isSuggested?: boolean;
  onAdd?: () => void;
  isEditMode?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
}
```

**Responsabilidad**: Card compacta para spots dentro de un Flow (listado)

**Características**:
- Layout horizontal compacto
- Número badge (activo/inactivo)
- Sin imagen
- Distancia + tiempo

**Uso por pantalla**:
- `FlowFullPlayer`: Lista completa de spots del flow
- `DesignSystem`: Documentación

**Notas**:
- Usado específicamente en FlowFullPlayer (contrato de pantalla diferente)
- Tiene estructura visual diferente a SpotCard (sin slot izquierdo circular, layout más compacto)
- Mantener como componente separado

---

### 5. InfoMeta
**Ubicación**: `components/ui/InfoMeta.tsx`

**Contrato**:
```typescript
interface InfoMetaProps {
  chip?: { label: string };
  distance?: number; // En metros
  duration?: number; // En minutos
  rating?: { value: number; count?: number };
  size?: 'large' | 'small';
}
```

**Responsabilidad**: Renderizar información secundaria debajo de títulos

**Variantes**:
- `large`: Muestra chip (si existe), distancia, duración, rating (solo si se pasa)
- `small`: Solo muestra distancia

**Reglas**:
- Distancia → siempre con icono "map"
- Duración → siempre con icono "clock"
- Rating → siempre con icono "star"
- Chip → sin icono obligatorio
- Micro-interacción km ↔ mi incluida (local al componente)

**Uso por pantalla**:
- `SpotDetail`: `size="large"` (chip, distancia, rating)
- `FlowDetail`: `size="large"` (duración, distancia)
- `SpotCard`: `size="small"` (distancia)

---

### 6. ContentHeader
**Ubicación**: `components/ui/ContentHeader.tsx`

**Contrato**:
```typescript
interface ContentHeaderProps {
  heroType: 'image' | 'map';
  heroImage?: ImageSourcePropType | { uri: string } | null;
  heroMap?: React.ReactNode;
  heroHeight?: number;
  leftActions?: ContentHeaderAction[];
  rightActions?: ContentHeaderAction[];
  showOverlay?: boolean;
  sticky?: boolean;
}

interface ContentHeaderAction {
  icon: IconName;
  onPress: () => void;
  variant?: IconButtonVariant;
  disabled?: boolean;
  tooltip?: string;
  testID?: string;
  activeColor?: string;
  isActive?: boolean;
}
```

**Responsabilidad**: Renderizar header visual con hero y acciones flotantes

**Variantes**:
- `heroType="image"`: Imagen hero (SpotDetail, FlowDetail)
- `heroType="map"`: Mapa hero embebido (FlowScreen)

**Uso por pantalla**:
- `SpotDetail`: `heroType="image"`, `sticky={false}`
- `FlowDetail`: `heroType="map"`, `sticky={true}`
- `FlowScreen`: `heroType="map"`, `sticky={true}`

**Notas**:
- Acciones declarativas con IconButton
- Soporte para tooltips y estados activos
- Modo sticky y no sticky

---

### 7. MapSpotMarker
**Ubicación**: `components/MapSpotMarker.tsx`

**Contrato**:
```typescript
interface MapSpotMarkerProps {
  spot: Spot;
  onPress: () => void;
  isHighlighted?: boolean;
}
```

**Responsabilidad**: Marcador de spot en mapas

**Estados**:
- `default`: Estado normal
- `highlighted`: Estado destacado (via `isHighlighted`)

**Uso por pantalla**:
- `Map`: Marcadores de todos los spots
- `Search` (tab Map): Marcadores de resultados

**Notas**:
- ✅ Contrato funcional
- ⚠️ **PROPUESTA**: Cambiar `isHighlighted?: boolean` → `state?: 'default' | 'highlighted'` para consistencia con FlowSpotNumberedMarker (opcional)

---

### 8. FlowSpotNumberedMarker
**Ubicación**: `components/FlowSpotNumberedMarker.tsx`

**Contrato**:
```typescript
interface FlowSpotNumberedMarkerProps {
  spot: Spot;
  orderNumber: number; // Número del spot en el flow (1, 2, 3...)
  state: 'active' | 'upNext' | 'visited';
  onPress: () => void;
}
```

**Responsabilidad**: Marcador numerado para spots en flow activo

**Estados**:
- `active`: Spot actual (color principal, opacidad 100%)
- `upNext`: Siguiente spot (color principal, opacidad ~70%)
- `visited`: Spot ya visitado (color principal, opacidad ~40%)

**Uso por pantalla**:
- `FlowScreen`: Mapa con spots del flow
- `MapView` (cuando hay flow activo): Marcadores numerados

---

### 9. IconButton
**Ubicación**: `components/ui/IconButton.tsx`

**Contrato**:
```typescript
interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  size?: number;
  testID?: string;
}
```

**Responsabilidad**: Botón de icono para headers y overlays

**Variantes**:
- `primary`: Estilo principal (default)
- `secondary`: Estilo secundario
- `ghost`: Estilo transparente/sutil

**Uso por pantalla**:
- `SpotDetail`: Acciones del header (via ContentHeader)
- `FlowDetail`: Acciones del header (via ContentHeader)
- `FlowScreen`: Acciones del header (via ContentHeader)

**Notas**:
- Área táctil mínima de 48x48px (accesibilidad)

---

### 10. Chip
**Ubicación**: `components/ui/Chip.tsx`

**Contrato**:
```typescript
interface ChipProps {
  text: string;
  variant?: 'default' | 'subtle' | 'highlighted';
  icon?: IconName;
}
```

**Responsabilidad**: Representar categorías, tipos o estados informativos

**Variantes**:
- `default`: Estilo estándar con fondo sutil
- `subtle`: Estilo más discreto
- `highlighted`: Estilo destacado para información importante

**Uso por pantalla**:
- `FlowDetail`: Movement mode tag
- `DesignSystem`: Ejemplos de variantes

**Notas**:
- NO es un botón interactivo
- NO maneja navegación

---

### 11. SettingsToggle
**Ubicación**: `components/SettingsToggle.tsx`

**Contrato**:
```typescript
interface SettingsToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
}
```

**Responsabilidad**: Toggle de configuración para Settings

**Características**:
- Switch nativo
- Label + descripción opcional

**Uso por pantalla**:
- `Profile`: Toggles de configuración

**Notas**:
- ⚠️ NO está en `ui/` (no es componente del Design System estricto)
- ✅ Propósito específico (settings)
- ⚠️ **PROPUESTA**: Mover a `ui/Toggle.tsx` y generalizar para reutilización (opcional)

---

## Componentes que NO Existen (pero se Usan)

### SectionHeader
**Estado**: NO EXISTE como componente canónico

**Uso actual**: Se usa solo como estilos inline (`sectionTitle`, `sectionHeader`)

**Patrón repetido en**:
- `Home`: Títulos de sección (Nearby, For You, Recommended, etc.)
- `Saved`: Títulos de sliders
- `FlowScreen`: "UP NEXT", "More Suggestions"
- `FlowDetail`: "PLACES IN THIS FLOW"

**Propuesta**:
- ⚠️ **PROPUESTA**: Crear componente canónico `SectionHeader` en `ui/SectionHeader.tsx`
  - Props: `title: string`, `action?: { icon, onPress }`, `variant?: 'large' | 'small'`
  - Razón: Patrón repetido en múltiples pantallas, consolidar (opcional)

---

## Componentes Legacy (Ninguno)

### ✅ Todos los componentes actuales tienen uso activo y propósitos claros

- `FlowSpotCard`: Usado en FlowFullPlayer (contrato específico)
- `SpotCardCompact`: Usado en Home (diferencias estructurales justificadas)

**No hay componentes que deban eliminarse más adelante.**

---

## Propuestas de Ajuste (Opcionales)

### 1. MapSpotMarker - Cambiar a `state`
**Prioridad**: Baja

**Cambio propuesto**:
```typescript
// Actual
interface MapSpotMarkerProps {
  isHighlighted?: boolean;
}

// Propuesto
interface MapSpotMarkerProps {
  state?: 'default' | 'highlighted';
}
```

**Razón**: Consistencia con `FlowSpotNumberedMarker` que usa `state`

**Impacto**: Bajo - solo cambio de prop, funcionalidad idéntica

---

### 2. SectionHeader - Crear componente canónico
**Prioridad**: Media

**Cambio propuesto**: Crear `components/ui/SectionHeader.tsx`

```typescript
interface SectionHeaderProps {
  title: string;
  action?: { icon: IconName; onPress: () => void };
  variant?: 'large' | 'small';
}
```

**Razón**: Patrón repetido en múltiples pantallas, consolidar

**Impacto**: Medio - requiere migración de estilos inline a componente

---

### 3. SettingsToggle - Mover a `ui/` y generalizar
**Prioridad**: Baja

**Cambio propuesto**: 
- Mover `components/SettingsToggle.tsx` → `components/ui/Toggle.tsx`
- Generalizar nombre y props para uso fuera de Settings

**Razón**: Componente genérico debería estar en `ui/`

**Impacto**: Bajo - solo reorganización y posible renombrado

---

## Resumen Final

### ✅ Contratos Confirmados y Congelados
1. SpotCard
2. SpotCardCompact
3. FlowCard
4. FlowSpotCard
5. InfoMeta
6. ContentHeader
7. MapSpotMarker
8. FlowSpotNumberedMarker
9. IconButton
10. Chip
11. SettingsToggle

### ⚠️ Propuestas de Ajuste (Opcionales, Futuras Iteraciones)
1. MapSpotMarker: Cambiar a `state` (prioridad baja)
2. SectionHeader: Crear componente canónico (prioridad media)
3. SettingsToggle: Mover a `ui/` y generalizar (prioridad baja)

### 📋 Componentes a Eliminar
**Ninguno** - Todos tienen uso activo y propósitos claros

---

## Conclusión

Todos los contratos del Design System están **congelados y listos para uso** sin cambios necesarios. Las propuestas de ajuste son opcionales y pueden implementarse en futuras iteraciones según necesidades de consistencia o consolidación.

**Estado del Design System**: ✅ ESTABLE Y LISTO PARA PRODUCCIÓN


**Pendiente de revisión en V1.4**

---

# INTERNACIONALIZACIÓN — FLOWYA V1.4

**Versión:** FLOWYA V1.3  
**Fecha:** 2026-01-11  
**Estado:** En progreso

---

## PROPÓSITO

Este documento define la arquitectura de internacionalización (i18n) para FLOWYA V1.3, preparando el sistema para soportar múltiples idiomas.

**Referencias:**
- Decisiones canónicas: `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md` - D-V1.3-06

---

## OBJETIVOS

1. **Soporte inicial:** Español e Inglés
2. **Arquitectura escalable:** Preparada para agregar más idiomas
3. **Alcance claro:** Qué se traduce y qué NO
4. **Estructura organizada:** Archivos y namespaces claros

**Referencia:** `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-06

---

## ALCANCE DE TRADUCCIÓN

### Se Traduce

1. **UI Strings:**
   - Títulos de secciones
   - Botones y acciones
   - Mensajes de error y éxito
   - Placeholders de formularios
   - Etiquetas y tooltips

2. **World Content:**
   - Nombres de Spots (si están en base de datos)
   - Descripciones de Spots
   - Nombres de Flows
   - Descripciones de Flows
   - Contenido generado por IA (si aplica)

3. **Metadata:**
   - Nombres de tipos de spots
   - Nombres de estados (To Visit, Visited)
   - Formatos de fecha y hora

### NO Se Traduce

1. **Contenido Personal del Usuario:**
   - Diario (notas personales)
   - Nombres personalizados de Flows
   - Cualquier contenido creado por el usuario

2. **Datos del Usuario:**
   - Email
   - Nombres de usuario (si aplica)

**Referencia:** `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-06

---

## ARQUITECTURA

### Stack Tecnológico

**Recomendación:** `react-i18next` (estándar de la industria)

**Alternativas evaluadas:**
1. **react-i18next:** ✅ Recomendado (maduro, bien mantenido)
2. **react-intl:** Alternativa válida
3. **Solución propia:** ❌ No recomendado (complejidad innecesaria)

### Estructura de Archivos

```
locales/
├── es/
│   ├── common.json          (Strings comunes)
│   ├── screens.json         (Strings de pantallas)
│   ├── spots.json           (World content: spots)
│   ├── flows.json           (World content: flows)
│   └── errors.json          (Mensajes de error)
├── en/
│   ├── common.json
│   ├── screens.json
│   ├── spots.json
│   ├── flows.json
│   └── errors.json
└── index.ts                 (Configuración i18n)
```

### Namespaces

1. **common:** Strings comunes (botones, acciones, etc.)
2. **screens:** Strings específicos de pantallas
3. **spots:** World content de spots
4. **flows:** World content de flows
5. **errors:** Mensajes de error

---

## IMPLEMENTACIÓN

### Configuración Inicial

```typescript
// locales/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import esCommon from './es/common.json';
import esScreens from './es/screens.json';
import enCommon from './en/common.json';
import enScreens from './en/screens.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: esCommon,
        screens: esScreens,
      },
      en: {
        common: enCommon,
        screens: enScreens,
      },
    },
    lng: Localization.locale.split('-')[0] || 'es', // Detectar idioma del dispositivo
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Uso en Componentes

```typescript
// Ejemplo de uso
import { useTranslation } from 'react-i18next';

function HomeScreen() {
  const { t } = useTranslation(['screens', 'common']);
  
  return (
    <View>
      <Text>{t('screens:home.title')}</Text>
      <Button title={t('common:actions.share')} />
    </View>
  );
}
```

### Hook Personalizado

```typescript
// hooks/useTranslation.ts
import { useTranslation as useI18nTranslation } from 'react-i18next';

export function useTranslation(namespace?: string | string[]) {
  const { t, i18n } = useI18nTranslation(namespace);
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return {
    t,
    currentLanguage: i18n.language,
    changeLanguage,
  };
}
```

---

## ESTRUCTURA DE ARCHIVOS DE TRADUCCIÓN

### common.json

```json
{
  "actions": {
    "share": "Compartir",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar"
  },
  "states": {
    "toVisit": "To Visit",
    "visited": "Visited"
  },
  "sections": {
    "nearby": "Nearby",
    "toVisit": "To Visit",
    "visited": "Visited",
    "discover": "Discover"
  }
}
```

### screens.json

```json
{
  "home": {
    "title": "Home",
    "empty": {
      "toVisit": "No places to visit yet",
      "visited": "No places visited yet"
    }
  },
  "spotDetail": {
    "title": "Spot Detail",
    "diary": {
      "title": "Diary",
      "addNotes": "Add Notes",
      "editNotes": "Edit Notes",
      "addPhoto": "Add Photo"
    }
  }
}
```

---

## DETECCIÓN DE IDIOMA

### Estrategia

1. **Detección automática:**
   - Usar idioma del dispositivo (expo-localization)
   - Fallback a Español si no se detecta

2. **Selección manual:**
   - Opción en Settings/Profile para cambiar idioma
   - Persistir preferencia en AsyncStorage

3. **Prioridad:**
   - Preferencia manual > Idioma del dispositivo > Fallback (Español)

### Implementación

```typescript
// utils/language.ts
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@flowya_language';

export async function getPreferredLanguage(): Promise<string> {
  // 1. Verificar preferencia manual
  const manualPreference = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (manualPreference) {
    return manualPreference;
  }
  
  // 2. Usar idioma del dispositivo
  const deviceLanguage = Localization.locale.split('-')[0];
  if (deviceLanguage === 'es' || deviceLanguage === 'en') {
    return deviceLanguage;
  }
  
  // 3. Fallback a Español
  return 'es';
}

export async function setPreferredLanguage(language: string): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}
```

---

## WORLD CONTENT (Spots y Flows)

### Estrategia

**Opción 1: Traducciones en Base de Datos (Recomendado)**

- Campo `translations` en tabla `spots`:
  ```json
  {
    "es": { "name": "Museo del Prado", "description": "..." },
    "en": { "name": "Prado Museum", "description": "..." }
  }
  ```

**Opción 2: Archivos JSON Separados**

- `locales/es/spots.json` y `locales/en/spots.json`
- Cargar según idioma actual

**Recomendación:** Opción 1 (más flexible, permite traducciones dinámicas)

### Implementación

```typescript
// Ejemplo de uso
function SpotCard({ spot }: { spot: Spot }) {
  const { currentLanguage } = useTranslation();
  
  const name = spot.translations?.[currentLanguage]?.name || spot.name;
  const description = spot.translations?.[currentLanguage]?.description || spot.description;
  
  return (
    <View>
      <Text>{name}</Text>
      <Text>{description}</Text>
    </View>
  );
}
```

---

## PREPARACIÓN PARA ESCALAR

### Agregar Nuevo Idioma

1. **Crear carpeta de idioma:**
   ```
   locales/fr/
   ├── common.json
   ├── screens.json
   └── ...
   ```

2. **Agregar a configuración:**
   ```typescript
   import frCommon from './fr/common.json';
   // ...
   resources: {
     // ...
     fr: {
       common: frCommon,
       // ...
     },
   }
   ```

3. **Actualizar detección de idioma:**
   ```typescript
   if (deviceLanguage === 'es' || deviceLanguage === 'en' || deviceLanguage === 'fr') {
     return deviceLanguage;
   }
   ```

### Mejores Prácticas

1. **Keys descriptivas:** Usar nombres claros y jerárquicos
2. **No hardcodear strings:** Siempre usar `t()` para strings traducibles
3. **Validar traducciones:** Asegurar que todas las keys existen en todos los idiomas
4. **Contexto:** Agregar comentarios en archivos JSON para contexto

---

## TESTING

### Casos de Prueba

1. **Detección de idioma:**
   - [ ] Detecta idioma del dispositivo correctamente
   - [ ] Respeta preferencia manual
   - [ ] Fallback a Español funciona

2. **Traducciones:**
   - [ ] Todas las strings se traducen correctamente
   - [ ] World content se traduce según idioma
   - [ ] Contenido personal NO se traduce

3. **Cambio de idioma:**
   - [ ] Cambio de idioma funciona en tiempo real
   - [ ] Preferencia se persiste correctamente
   - [ ] UI se actualiza inmediatamente

---

## ROADMAP DE IDIOMAS

### Fase 1 (V1.3)
- ✅ Español (completo)
- ✅ Inglés (completo)

### Fase 2 (Futuro)
- Francés
- Alemán
- Italiano

### Fase 3 (Futuro)
- Portugués
- Otros idiomas según demanda

---

**Última actualización:** 2026-01-11  
**Estado:** Arquitectura i18n definida

# Configuración de Repositorios Git

## Repositorios Configurados

Actualmente tienes **dos repositorios remotos** configurados:

### 1. Repositorio Original: `origin`
- **URL**: https://github.com/robscan/mini-tours-expo.git
- **Nombre del remoto**: `origin`
- **Uso**: Repositorio original del proyecto Mini Tours

### 2. Repositorio FLOWYA: `flowya`
- **URL**: https://github.com/robscan/flowya-expo.git
- **Nombre del remoto**: `flowya`
- **Uso**: Nuevo repositorio para la aplicación FLOWYA
- **Estado**: ✅ Sincronizado (último push exitoso)

## Comandos Útiles

### Verificar remotos configurados
```bash
git remote -v
```

### Push a repositorios específicos

**Push al repositorio original (mini-tours-expo):**
```bash
git push origin main
```

**Push al nuevo repositorio (flowya-expo):**
```bash
git push flowya main
```

**Push a ambos repositorios simultáneamente:**
```bash
git push origin main && git push flowya main
```

### Cambiar el remoto por defecto (upstream)

Si quieres que `flowya` sea tu remoto principal:
```bash
git branch --set-upstream-to=flowya/main main
```

Para volver a `origin`:
```bash
git branch --set-upstream-to=origin/main main
```

### Ver estado de sincronización

```bash
# Ver commits que están en origin pero no en flowya
git log flowya/main..origin/main

# Ver commits que están en flowya pero no en origin
git log origin/main..flowya/main
```

## Notas

- Ambos repositorios comparten el mismo código base
- Los commits se mantienen sincronizados manualmente (push a ambos)
- El remoto `origin` es el predeterminado de git, pero puedes trabajar con cualquiera




# Setup del Repositorio GitHub para FLOWYA

## Paso 1: Crear el Repositorio en GitHub

1. Ve a https://github.com/new
2. **Repository name**: `flowya` (o `flowya-expo` si prefieres)
3. **Description**: ""FLOWYA - Aplicación móvil para recorridos guiados con narrativa contextual
4. **Visibility**: Private (recomendado) o Public según tu preferencia
5. **NO marques** ninguna de estas opciones:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
   (Porque ya tenemos estos archivos en nuestro repositorio local)
6. Haz clic en **"Create repository"**

## Paso 2: Copiar la URL del Repositorio

Después de crear el repositorio, GitHub te mostrará una página con instrucciones. 
Copia la URL HTTPS del repositorio (será algo como):
- `https://github.com/TU_USUARIO/flowya.git`

## Paso 3: Configurar el Remoto Local

Una vez que tengas la URL, ejecuta estos comandos (o usa el script de setup):

```bash
# Reemplazar origin con el nuevo repositorio
git remote set-url origin https://github.com/TU_USUARIO/flowya.git

# Verificar que el remoto esté configurado correctamente
git remote -v

# Hacer push de todas las ramas
git push -u origin main
```

## Alternativa: Mantener el remoto anterior y agregar uno nuevo

Si quieres mantener el repositorio anterior y agregar el nuevo como remoto adicional:

```bash
# Agregar el nuevo remoto con nombre "flowya"
git remote add flowya https://github.com/TU_USUARIO/flowya.git

# Hacer push al nuevo remoto
git push -u flowya main
```

---

**Nota**: Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.




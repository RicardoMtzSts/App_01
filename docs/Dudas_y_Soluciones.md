# Dudas y Soluciones sobre el Build y Ejecución de GraphOS

## ¿Por qué mis cambios en React (frontend) no se ven al ejecutar `npm run dev`?

**Contexto:**
- El proyecto GraphOS usa Electron para el backend (main.js) y React para el frontend (renderer.js).
- El backend (main.js) se compila con `esbuild.config.js` y el frontend (renderer.js) con `esbuild.renderer.config.js`.

**Problema:**
- El script `npm run dev` solo recompilaba el backend (`main.js`) y luego lanzaba Electron.
- Si modificabas archivos en `src/renderer`, el bundle `dist/renderer.js` no se actualizaba automáticamente.
- Por eso, los cambios en la interfaz no se reflejaban al ejecutar solo `npm run dev`.

**Solución:**
- Se agregó un nuevo script npm llamado `dev:all` que compila tanto el backend como el frontend y luego lanza Electron.
- Ahora, el script `dev` ejecuta internamente `dev:all` para que todo el flujo sea automático.

## ¿Cómo funciona la compilación y ejecución?

- **Backend (main.js):**
  - Se compila desde `src/main/index.ts` usando `esbuild.config.js`.
  - Genera el archivo `dist/main.js` que es el proceso principal de Electron.
- **Frontend (renderer.js):**
  - Se compila desde `src/renderer/index.tsx` usando `esbuild.renderer.config.js`.
  - Genera el archivo `dist/renderer.js` que es el bundle de React cargado en el HTML.
- **Ejecución:**
  - Electron ejecuta el backend y carga el HTML (`public/index.html`), que a su vez carga el bundle de React.

## ¿Qué hace el nuevo script `dev:all`?

```json
"dev:all": "npm run build:main && node esbuild.renderer.config.js && electron ."
```
- Compila el backend (`main.js`).
- Compila el frontend (`renderer.js`).
- Lanza la app con Electron.

## ¿Qué ventajas tiene usar un solo comando?
- Evita olvidar compilar el frontend y ver una app desactualizada.
- Ahorra tiempo y reduce errores.
- Permite un flujo de desarrollo más ágil y confiable.

---

**Siguiente duda o solución:**

## ¿Por qué no funcionaba la creación de carpetas desde la UI de Electron?

**Problema:**
- La función de crear carpetas y documentos desde la interfaz React no funcionaba porque el preload script de Electron no se estaba cargando correctamente, lo que impedía exponer la API segura (`window.electronAPI`) al renderer.

**Diagnóstico y solución aplicada:**
- Se revisó la estructura de build y se confirmó que el preload debe estar en la ruta `dist/preload.js` al ejecutar la app empaquetada o en producción.
- Se creó un preload de diagnóstico que imprime en consola si se carga correctamente y si la API está disponible en el renderer.
- Se modificó el main process para mostrar en consola la ruta real del preload y asegurar que apunta a la ubicación correcta según el entorno (desarrollo o producción).
- Se reinició la app y se verificó en la consola que los mensajes de diagnóstico aparecen, confirmando que la API está disponible y funcional.
- Finalmente, la función de crear carpetas y documentos desde la UI funciona correctamente.

**Recomendación:**
- Si en el futuro la UI no puede acceder a funciones del backend, primero revisa la ruta y carga del preload script, y usa logs de diagnóstico para confirmar su ejecución.

---

(Agrega aquí nuevas preguntas y respuestas que surjan durante el desarrollo)

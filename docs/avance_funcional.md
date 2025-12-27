# Documentación de Avance - GraphOS

## ✅ TODO LO QUE YA ES FUNCIONAL

- Multi-canvas: Soporte para múltiples lienzos, cada uno con nombre editable y acciones independientes.
- Menú superior único: Barra de menús fija con opciones de Archivo, Editar, Ver, Insertar, Formato y Ayuda.
- Botones de edición por canvas: Deshacer, rehacer, copiar, pegar, seleccionar todo y zoom, todos funcionales y por canvas.
- Exportación: Exporta el canvas a PNG, JPG, SVG, PDF, PPTX, XML y JSON.
- Importación/Guardado: Abre y guarda archivos canvas usando IPC de Electron.
- Carpetas de proyectos: Crea carpetas y guarda múltiples documentos canvas en ellas.
- Cuadrícula: Opción de mostrar/ocultar cuadrícula en cada canvas, adaptada al zoom.
- Reglas: Opción de mostrar reglas vertical y horizontal, con unidades (mm/cm), adaptadas al zoom y con indicador de posición del puntero.
- Paneles laterales: Layout con panel izquierdo (navegación), central (canvas) y derecho (herramientas).
- Soporte para plantillas y proyectos recientes/recomendados.
- Tipado estricto TypeScript y sin warnings.
- Tests básicos de renderizado con React Testing Library y Jest.

---

## ⏳ TODO LO QUE NOS FALTA

- Herramientas avanzadas de dibujo: Figuras geométricas, conectores inteligentes, tablas, gráficos, iconos, etc.
- Notas avanzadas: Editor enriquecido, tags, búsqueda, vinculación a documentos.
- Importación de recursos externos: Imágenes, PDF, CSV, JSON, XML.
- Base de datos local: Integración real con SQLite para persistencia avanzada.
- Autoguardado y versiones: Historial de cambios y autoguardado configurable.
- Accesibilidad: Modo daltonismo, atajos de teclado personalizables, temas visuales.
- Sincronización en la nube y multi-ventana real.
- Exportación avanzada (área seleccionada, calidad, impresión directa).
- Mejorar tests y cobertura.
- Optimización de performance para grandes proyectos.
- Documentación de usuario y ayuda interactiva.

---

## 🛠️ TECNOLOGÍAS USADAS

### BACKEND (Electron Main)
- Electron: Motor principal de la app de escritorio.
- Node.js: Entorno de ejecución.
- IPC (Inter-Process Communication): Comunicación segura entre backend y frontend.
- fs, path: Módulos de Node.js para manejo de archivos y rutas.
- sqlite3: (Preparado para futura integración de base de datos local).

### FRONTEND (React Renderer)
- React: UI principal y lógica de interacción.
- TypeScript: Tipado estricto en todo el frontend.
- HTML/CSS: Estructura y estilos.
- Jest + React Testing Library: Pruebas unitarias y de integración.
- Canvas API: Dibujo y manipulación de los lienzos.
- Konva.js / React Flow / JointJS: (Preparado para futura integración de canvas avanzado).

---

## 📁 ARCHIVOS IMPORTANTES

### ARCHIVOS DE ARRANQUE DE LA APP

- src/main/index.ts: Proceso principal de Electron, crea la ventana y expone APIs.
- src/main/preload.js: Preload seguro para exponer funciones de backend al frontend.
- src/renderer/index.tsx: Punto de entrada de React, monta el componente App.
- public/index.html: HTML base donde se monta la app.
- esbuild.config.js / esbuild.renderer.config.js: Scripts de build para backend y frontend.
- package.json: Scripts, dependencias y configuración general.

#### FLUJO QUE HACE FUNCIONAR AL BACKEND Y FRONTEND

1. npm run dev:all  
   - Compila backend (main.js) y frontend (renderer.js).
   - Lanza Electron, que carga el HTML y el bundle de React.
2. Electron crea la ventana y expone APIs seguras vía preload.
3. React monta la UI y se comunica con el backend usando window.electronAPI.

#### SCRIPTS IMPORTANTES

- npm run dev:all: Compila y ejecuta todo en modo desarrollo.
- npm run build: Empaqueta la app para distribución.
- npm test: Ejecuta los tests.

---

## 🗂️ ESTRUCTURA DE PROYECTO

```
src/
  main/
    index.ts         # Proceso principal Electron
    preload.js       # Preload seguro
  renderer/
    App.tsx          # Componente principal React
    index.tsx        # Entrada React
  components/
    CanvasEditor.tsx # Lógica y UI del canvas
    PanelLayout.tsx  # Layout de paneles
  organizers/        # Plantillas de organizadores gráficos
  assets/            # Recursos gráficos
  db/                # (Preparado para SQLite)
  notes/             # (Preparado para notas avanzadas)
  utils/             # Utilidades generales
public/
  index.html         # HTML base
docs/
  arquitectura.md    # Documentación técnica
  flujo_trabajo.md   # Flujo de usuario
  avance_inicial.md  # Avance y configuración
tests/
  renderer.test.tsx  # Tests de React
  app.layout.test.tsx# Tests de layout
.github/
  copilot-instructions.md # Checklist de desarrollo asistido
```

---

## 📌 MENCIONES Y DETALLES

- Tecnologías canvas: Actualmente Canvas API nativa de HTML5. Preparado para migrar a Konva.js, React Flow o JointJS para funcionalidades avanzadas.
- Base de datos: Estructura lista para SQLite, integración pendiente.
- Opciones de arranque:  
  - npm run dev:all (desarrollo)  
  - npm run build (empaquetado)  
  - npm test (pruebas)
- Paneles y menús: Layout profesional con paneles laterales, menú superior y herramientas contextuales.
- IPC seguro: Todas las operaciones de archivos y carpetas usan canales seguros de Electron.
- Tipado estricto: Todo el código es TypeScript con tipado fuerte.
- Documentación: Archivos en /docs y checklist en .github/.

---

> Última actualización: 27 de diciembre de 2025

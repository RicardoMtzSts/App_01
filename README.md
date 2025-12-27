# GraphOS

Aplicación de escritorio para la creación y gestión de organizadores gráficos con sistema avanzado de notas y gestión local de proyectos.

## Tecnologías principales
- Electron.js
- React.js
- TypeScript
- SQLite
- Konva.js / React Flow / JointJS
- Jest / React Testing Library / Playwright

## Estructura del proyecto
- src/main: Proceso principal de Electron
- src/renderer: Interfaz de usuario (React)
- src/organizers: Plantillas y lógica de organizadores gráficos
- src/components: Componentes reutilizables
- src/assets: Recursos gráficos y temas
- src/db: Gestión de base de datos
- src/utils: Utilidades generales
- src/notes: Gestión de notas
- public: Archivos estáticos
- docs: Documentación técnica y de usuario
- tests: Pruebas unitarias y E2E

## Instalación y desarrollo
1. Instala Node.js y npm.
2. Ejecuta `npm install` para instalar dependencias.
3. Usa `npm run dev` para desarrollo y `npm run build` para empaquetar.

## Licencia
MIT

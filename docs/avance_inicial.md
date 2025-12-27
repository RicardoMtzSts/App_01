## 7. Diagrama Visual de Arquitectura (Simplificado)

```
┌─────────────────────────────┐
│        Electron Main        │
│    src/main/index.ts        │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│      public/index.html      │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│   React Renderer (App)      │
│ src/renderer/index.tsx/tsx  │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Componentes, Assets, etc.  │
└─────────────────────────────┘
```

## 8. Tabla Resumen de Carpetas y Archivos

| Carpeta/Archivo                | Descripción / Función principal                                 |
|--------------------------------|-----------------------------------------------------------------|
| src/main/index.ts              | Proceso principal de Electron, crea ventana y ciclo de vida     |
| src/main/preload.js            | Preload para exponer APIs seguras (futuro)                      |
| src/main/index.js              | Entrada JS que carga el bundle main.js                          |
| src/renderer/App.tsx           | Componente principal de React                                   |
| src/renderer/index.tsx         | Entrada de React, monta App en el DOM                           |
| public/index.html              | HTML base, contiene div root y carga renderer.js                |
| public/logo.svg                | Logo de la app                                                  |
| dist/main.js                   | Bundle backend Electron generado por esbuild                    |
| dist/renderer.js               | Bundle frontend React generado por esbuild                      |
| docs/arquitectura.md           | Documentación de arquitectura                                   |
| docs/flujo_trabajo.md          | Flujo de trabajo propuesto                                      |
| docs/avance_inicial.md         | Documentación de avance y configuración                         |
| tests/renderer.test.tsx        | Test automatizado de React                                      |
| .github/copilot-instructions.md| Checklist y guía de desarrollo asistido                         |
| package.json                   | Configuración de dependencias y scripts                         |
| electron-builder.json          | Configuración de empaquetado Electron                           |
| tsconfig.json                  | Configuración de TypeScript                                     |
| esbuild.config.js              | Configuración de build para Electron main                       |
| esbuild.renderer.config.js     | Configuración de build para React renderer                      |
| jest.config.js                 | Configuración de Jest                                           |
| babel.config.js                | Configuración de Babel para tests                               |
| jest-setup.js                  | Setup de Jest para jest-dom                                     |
| .gitignore                     | Exclusión de archivos/carpetas en git                           |
# Documentación de Avance Inicial - GraphOS

## 1. Estructura de Carpetas y Archivos

- **src/main/**
  - `index.ts`: Proceso principal de Electron. Crea la ventana, gestiona el ciclo de vida de la app y carga el frontend.
  - `preload.js`: Archivo para exponer APIs seguras entre Electron y el renderer (actualmente vacío, preparado para futuras integraciones).
  - `index.js`: Entrada JS que carga el bundle transpileado de TypeScript (dist/main.js).
- **src/renderer/**
  - `App.tsx`: Componente principal de React. Muestra la pantalla de bienvenida.
  - `index.tsx`: Punto de entrada de React. Monta el componente App en el DOM.
- **public/**
  - `index.html`: Archivo HTML base. Contiene el div root donde React renderiza la app y carga el bundle renderer.js.
  - `logo.svg`: Logo de la app mostrado en la bienvenida.
- **dist/**
  - `main.js`: Bundle generado por esbuild a partir de src/main/index.ts.
  - `renderer.js`: Bundle generado por esbuild a partir de src/renderer/index.tsx.
- **docs/**
  - `arquitectura.md`: Descripción de la arquitectura general del proyecto.
  - `flujo_trabajo.md`: Flujo de trabajo propuesto para el usuario.
  - `avance_inicial.md`: (Este archivo) Documentación detallada del avance y configuración inicial.
- **tests/**
  - `renderer.test.tsx`: Test automatizado para verificar que el mensaje de bienvenida de React se muestra correctamente.
- **.github/**
  - `copilot-instructions.md`: Checklist y guía de pasos para el desarrollo asistido.

## 2. Configuración y Dependencias

- **Electron**: Framework para crear aplicaciones de escritorio multiplataforma usando tecnologías web. Permite empaquetar la app como .exe.
- **React**: Biblioteca para construir interfaces de usuario reactivas y escalables.
- **TypeScript**: Superset de JavaScript con tipado estático, mejora la robustez y mantenibilidad del código.
- **esbuild**: Bundler/transpilador ultrarrápido para TypeScript y JavaScript. Se usa para generar los bundles main.js (backend Electron) y renderer.js (frontend React).
- **Jest**: Framework de testing para JavaScript/TypeScript. Permite pruebas unitarias y de integración.
- **@testing-library/react & jest-dom**: Utilidades para testear componentes React y hacer aserciones sobre el DOM.
- **babel**: Usado junto a Jest para transformar JSX y TypeScript en los tests.

### Dependencias principales (package.json):
- electron
- react, react-dom
- sqlite3 (preparado para futura integración de base de datos local)

### Dependencias de desarrollo:
- typescript, @types/react, @types/react-dom
- esbuild, esbuild-node-externals
- jest, ts-jest, babel-jest
- @babel/preset-env, @babel/preset-typescript, @babel/preset-react
- @testing-library/react, @testing-library/jest-dom, jest-environment-jsdom

## 3. Scripts y Build

- `npm run dev`: Transpila el backend (main) y lanza Electron.
- `npm run build:main`: Genera el bundle dist/main.js desde src/main/index.ts.
- `node esbuild.renderer.config.js`: Genera el bundle dist/renderer.js desde src/renderer/index.tsx.
- `npm test`: Ejecuta los tests con Jest.

## 4. Conexiones y Flujo

- El proceso principal de Electron (`src/main/index.ts`) crea la ventana y carga `public/index.html`.
- `index.html` carga el bundle de React (`dist/renderer.js`), que monta el componente App en el div root.
- El test automatizado verifica que la interfaz React se renderiza correctamente.

## 5. Importancia de cada parte

- **Electron (src/main/)**: Permite la ejecución como app de escritorio, gestiona ventanas, menús y comunicación con el frontend.
- **React (src/renderer/)**: Facilita la creación de interfaces modernas, escalables y reactivas.
- **esbuild**: Asegura un flujo de desarrollo rápido y eficiente, permitiendo usar TypeScript y JSX sin fricción.
- **Jest y Testing Library**: Garantizan la calidad y robustez del código mediante pruebas automatizadas.
- **public/**: Punto de entrada visual de la app, donde se monta React.
- **docs/**: Centraliza la documentación técnica y de usuario, facilitando el mantenimiento y la colaboración.
- **.github/copilot-instructions.md**: Guía y checklist para el desarrollo asistido y ordenado.

## 6. Estado actual

- Estructura base lista y funcional.
- Ventana de bienvenida operativa con React.
- Flujo de build y test automatizado funcionando.
- Documentación técnica y de arquitectura disponible.

---

Este avance sienta las bases para el desarrollo modular, escalable y profesional de GraphOS. Siguiente paso recomendado: expandir la estructura de componentes React y comenzar la integración de funcionalidades específicas.

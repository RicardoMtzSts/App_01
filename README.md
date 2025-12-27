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

Estas son las dependencias instaladas en el proyecto, según el archivo package.json:

---

## Dependencias principales (runtime)

- **@vitejs/plugin-react**: Plugin para usar React con Vite.
- **electron**: Framework para apps de escritorio multiplataforma.
- **react**: Biblioteca principal de UI.
- **react-dom**: Renderizado de React en el DOM.
- **sqlite3**: Motor de base de datos local (preparado para integración).
- **vite**: Bundler y servidor de desarrollo rápido.

---

## Dependencias de desarrollo (devDependencies)

- **@babel/preset-env**: Preset de Babel para JS moderno.
- **@babel/preset-react**: Preset de Babel para JSX/React.
- **@babel/preset-typescript**: Preset de Babel para TypeScript.
- **@testing-library/jest-dom**: Matchers para pruebas DOM con Jest.
- **@testing-library/react**: Utilidades para testear componentes React.
- **@types/react**: Tipos TypeScript para React.
- **@types/react-dom**: Tipos TypeScript para ReactDOM.
- **babel-jest**: Integración de Babel con Jest.
- **electron-builder**: Empaquetado y distribución de apps Electron.
- **esbuild**: Bundler/transpilador ultrarrápido.
- **esbuild-node-externals**: Plugin para excluir node_modules en esbuild.
- **jest**: Framework de testing.
- **jest-environment-jsdom**: Entorno jsdom para pruebas Jest.
- **ts-jest**: Soporte de TypeScript en Jest.
- **typescript**: Superset de JS con tipado estático.

---

##  Resumen de dependencias externas

- **Electron** (y electron-builder)
- **React** (react, react-dom, @vitejs/plugin-react)
- **Vite**
- **SQLite3**
- **Jest y Testing Library**
- **Babel**
- **esbuild**
- **TypeScript**

#

git init
git remote add origin https://github.com/RicardoMtzSts/App_01.git
git add .
git commit -m "Primer commit del proyecto GraphOS"
git push -u origin master

(Si el repositorio ya existe y tiene ramas protegidas, se usa main en vez de master: git push -u origin main)



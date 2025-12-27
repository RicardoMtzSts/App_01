# Arquitectura de GraphOS

## 1. Descripción General
GraphOS es una aplicación de escritorio multiplataforma basada en Electron, React y TypeScript, orientada a la creación y gestión de organizadores gráficos y notas avanzadas.

## 2. Estructura de Carpetas
- **src/main**: Proceso principal de Electron (gestión de ventanas, menús, IPC).
- **src/renderer**: Interfaz de usuario (React, componentes visuales, lógica de interacción).
- **src/organizers**: Plantillas y lógica de cada tipo de organizador gráfico.
- **src/components**: Componentes reutilizables de UI.
- **src/assets**: Recursos gráficos, iconos y temas.
- **src/db**: Gestión de base de datos local (SQLite).
- **src/utils**: Utilidades generales.
- **src/notes**: Lógica y componentes para notas avanzadas.
- **public**: Archivos estáticos.
- **docs**: Documentación técnica y de usuario.
- **tests**: Pruebas unitarias y E2E.

## 3. Flujo de Trabajo
1. El usuario inicia la app (Electron).
2. Se muestra la pantalla de inicio (React).
3. El usuario crea o abre un proyecto/carpeta.
4. Selecciona el tipo de organizador gráfico a crear.
5. Interactúa con el lienzo, añade figuras, notas, archivos, etc.
6. Los datos se guardan localmente en SQLite y archivos .neurocanvas (JSON/XML).
7. Puede exportar, imprimir o compartir el organizador.

## 4. Componentes Clave
- **Lienzo interactivo**: Renderizado con Konva.js/React Flow.
- **Gestor de notas**: Editor enriquecido, tags, búsqueda.
- **Importación/exportación**: Soporte para imágenes, PDF, CSV, JSON, XML.
- **Gestión de proyectos**: Carpetas, historial, autoguardado.
- **Paneles y menús**: Navegación por pestañas, menús contextuales.

## 5. Tecnologías
- Electron, React, TypeScript, SQLite, Konva.js/React Flow, Jest, electron-builder.

## 6. Pruebas y Build
- Pruebas unitarias y E2E en /tests.
- Empaquetado con electron-builder para generar .exe.

---

Para más detalles, consulta los archivos en cada carpeta y el README.md principal.

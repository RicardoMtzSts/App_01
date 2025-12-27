const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  createFolderWithDocs: (folderName, docs) => ipcRenderer.invoke('create-folder-with-docs', { folderName, docs })
});

// Diagnóstico: log para verificar carga del preload
console.log('[PRELOAD] preload.js cargado correctamente');
window.addEventListener('DOMContentLoaded', () => {
  if (window.electronAPI) {
    console.log('[PRELOAD] electronAPI está disponible en window');
  } else {
    console.error('[PRELOAD] electronAPI NO está disponible en window');
  }
});

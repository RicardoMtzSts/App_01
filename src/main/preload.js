const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  createFolderWithDocs: (folderName, docs) => ipcRenderer.invoke('create-folder-with-docs', { folderName, docs }),
  openCanvasFile: () => ipcRenderer.invoke('open-canvas-file'),
  saveCanvasFile: (content) => ipcRenderer.invoke('save-canvas-file', { content })
});

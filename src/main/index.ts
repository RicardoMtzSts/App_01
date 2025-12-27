// IPC: Abrir archivo canvas
ipcMain.handle('open-canvas-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Abrir documento canvas',
    properties: ['openFile'],
    filters: [
      { name: 'Canvas', extensions: ['json', 'neurocanvas', 'txt'] },
      { name: 'Todos los archivos', extensions: ['*'] }
    ]
  });
  if (canceled || !filePaths[0]) return { ok: false, error: 'cancelled' };
  try {
    const content = fs.readFileSync(filePaths[0], 'utf-8');
    return { ok: true, filePath: filePaths[0], content };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// IPC: Guardar archivo canvas
ipcMain.handle('save-canvas-file', async (event, { content }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Guardar documento canvas',
    filters: [
      { name: 'Canvas', extensions: ['json', 'neurocanvas', 'txt'] },
      { name: 'Todos los archivos', extensions: ['*'] }
    ]
  });
  if (canceled || !filePath) return { ok: false, error: 'cancelled' };
  try {
    fs.writeFileSync(filePath, content || '');
    return { ok: true, filePath };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

function createWindow() {
  // Diagnóstico: mostrar ruta real del preload
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
  // Para desarrollo apuntar a src/main/preload.js, para producción a dist/preload.js
  const preloadPath = isDev
    ? path.join(process.cwd(), 'src', 'main', 'preload.diagnose.js')
    : path.join(__dirname, 'preload.js');
  console.log('[MAIN] preloadPath usado:', preloadPath);
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile(path.join(process.cwd(), 'public', 'index.html'));
}

// IPC: Crear carpeta y guardar documentos
ipcMain.handle('create-folder-with-docs', async (event, { folderName, docs }) => {
  // docs: [{name: string, content: string}]
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Selecciona la ubicación para la nueva carpeta',
    properties: ['openDirectory', 'createDirectory']
  });
  if (canceled || !filePaths[0]) return { ok: false, error: 'cancelled' };
  const basePath = filePaths[0];
  const folderPath = path.join(basePath, folderName);
  try {
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
    for (const doc of docs) {
      const filePath = path.join(folderPath, doc.name + '.txt');
      fs.writeFileSync(filePath, doc.content || '');
    }
    return { ok: true, folderPath };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

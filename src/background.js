
import {app, BrowserWindow, globalShortcut, ipcMain} from 'electron';
import path from 'node:path';
// @ts-ignore
import RENDERER_FILE_PATH from 'renderer';
import OverlayServer from './lib/overlay';


let currentHotkeys = new Map();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });
  console.log(RENDERER_FILE_PATH);
  win.loadURL(RENDERER_FILE_PATH);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

ipcMain.handle("set-hotkey", async (e, hotkey, accelerator) => {
  if (currentHotkeys.has(hotkey)) globalShortcut.unregister(currentHotkeys.get(hotkey));
  if (accelerator) {
    currentHotkeys.set(hotkey, accelerator);
    globalShortcut.register(accelerator, () => {
      e.sender.send('hotkey-pressed', hotkey);
    })
  }
})

const overlay_server = new OverlayServer();

ipcMain.handle("overlay-enable", async (e, port) => {
  return await overlay_server.start(port)
})

ipcMain.handle("overlay-disable", async (e) => {
  return await overlay_server.stop()
})

ipcMain.handle("overlay-update", async (e, state) => {
  overlay_server.send_update(state);
})
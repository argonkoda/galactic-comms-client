import { contextBridge, ipcRenderer } from "electron";
import EventEmitter from "events";

const keyEmitter = new EventEmitter();

ipcRenderer.on('hotkey-pressed', (e, key) => {
  keyEmitter.emit(key);
})

contextBridge.exposeInMainWorld('hotkeys', {
  setKey: async (hotkey, accelerator) => {
    return await ipcRenderer.invoke('set-hotkey', hotkey, accelerator);
  },
  on: keyEmitter.on.bind(keyEmitter),
  off: keyEmitter.off.bind(keyEmitter),
  once: keyEmitter.once.bind(keyEmitter),
})
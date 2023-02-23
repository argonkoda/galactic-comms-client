import { get, writable } from "svelte/store";
import persistentSetting from "./persistentSetting";

// Connection
export const steam_id = persistentSetting('steam_id', "");
export const name = persistentSetting('name', "");
export const knownServers = persistentSetting('knownServers', "{}", true);

// Output
export const globalVolume = persistentSetting('globalVolume', 1);
export const deafenHotkey = persistentSetting('deafenHotkey', "");

// Input
export const microphoneDevice = persistentSetting('microphoneDevice', null, true);
export const microphoneSensitivity = persistentSetting('microphoneSensitivity', 0.01);
export const microphoneGain = persistentSetting('microphoneGain', 1);
export const muteHotkey = persistentSetting('muteHotkey', "");
export const pttHotkey = persistentSetting('pttHotkey', "");
export const pttEnabled = persistentSetting('pttEnabled', true, true);

// Visuals
export const muteIndicatorEnabled = persistentSetting('muteIndicatorEnabled', false, true);
export const muteIndicatorPosition = persistentSetting('muteIndicatorPosition', 'middle center');
export const theme = persistentSetting('theme', '');
export const overlayPort = persistentSetting('overlayPort', 3001, true);
export const overlayEnabled = persistentSetting('overlayEnabled', false, true);

// Incoming Connections
export const cachedVolumes = persistentSetting('cachedVolumes', "{}", true);

// Non-Persistent
export const muted = writable(true);
export const ptt = writable(false);
export const deafened = writable(false);
export const listening = writable(false);
export const overlayStatus = writable("stopped");

export async function start_overlay() {
  if (get(overlayStatus) === "stopped") {
    overlayStatus.set("starting");
    try {
      await overlay.enable(get(overlayPort));
      overlay.update(null)
      overlayStatus.set("running");
    } catch (error) {
      overlayStatus.set("error")
    }
  }
}

export async function stop_overlay() {
  if (get(overlayStatus) === "running") {
    overlayStatus.set("stopping");
    try {
      overlay.update(null)
      await overlay.disable();
      overlayStatus.set("stopped");
    } catch (error) {
      overlayStatus.set("error")
    }
  }
}

// TODO: Handle starting and stopping the overlay server. 
if (get(overlayEnabled))
  start_overlay();

// PTT Handling
let pttTimeout = null;

function pttReleased() {
  ptt.set(false);
}

hotkeys.on('ptt', () => {
  if (pttTimeout) {
    clearTimeout(pttTimeout);
  }
  pttTimeout = setTimeout(pttReleased, 600)
  ptt.set(true);
})

hotkeys.on('mute', () => {
  muted.update(muted => !muted);
});

hotkeys.on('deafen', () => {
  deafened.update(deafened => !deafened);
})

// Overlay Active/Inactive Handling
// overlayEnabled.subscribe((enabled) => {
//   if (enabled) {
//     overlay.enable(get(overlayPort))
//   }
// })
import { writable } from "svelte/store";
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

// Incoming Connections
export const cachedVolumes = persistentSetting('cachedVolumes', "{}", true);

// Non-Persistent
export const muted = writable(true);
export const ptt = writable(false);
export const deafened = writable(false);
export const listening = writable(false);


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
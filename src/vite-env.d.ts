/// <reference types="svelte" />
/// <reference types="vite/client" />

declare const hotkeys : {
  on(event: string, fn: (...args) => void) : void,
  off(event: string, fn: (...args) => void) : void,
  once(event: string, fn: (...args) => void) : void,
  setKey(hotkey: string, accelerator: string) : void,
}
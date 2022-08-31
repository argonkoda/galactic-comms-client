import { writable } from "svelte/store";

export default function persistentSetting(key, firstDefault, isJSON = false) {
  const initialValue = localStorage.getItem(key) ?? firstDefault;
  const store = writable(isJSON ? JSON.parse(initialValue) : initialValue);
  store.subscribe((v) => localStorage.setItem(key, isJSON ? JSON.stringify(v) : v));
  return store;
}
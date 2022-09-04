<script>
  export let hotkey;
  export let binding;
  let recordingHotkey = false;

  $: {
    hotkeys.setKey(hotkey, binding);
  }

  /**
   *
   * @param {KeyboardEvent} e
   */
  function hotkeyRecorderKeyDownHandler(e) {
    if (e.key === "Escape") {
      recordingHotkey = false;
    } else {
      if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) {
        saveHotkeyCombination(e);
        recordingHotkey = false;
      }
    }
  }

  // function hotkeyRecorderKeyUpHandler(e) {
  //   pressedKeys.set(e.key, false);
  //   if ([...pressedKeys].every(([keyCode, pressed]) => !pressed)) {
  //     saveHotkeyCombination([...pressedKeys.keys()]);
  //     recordingHotkey = false;
  //   }
  // }

  async function saveHotkeyCombination(combination) {
    const accelerator =
      (combination.ctrlKey || combination.metaKey ? "CommandOrControl+" : "") +
      (combination.altKey ? "Alt+" : "") +
      (combination.shiftKey ? "Shift+" : "") +
      combination.key.toUpperCase();
    binding = accelerator;
  }

  function addHotkeyRecordingHandlers() {
    window.addEventListener("keydown", hotkeyRecorderKeyDownHandler);
    // window.addEventListener("keyup", hotkeyRecorderKeyUpHandler);
  }

  function removeHotkeyRecordingHandlers() {
    window.removeEventListener("keydown", hotkeyRecorderKeyDownHandler);
    // window.removeEventListener("keyup", hotkeyRecorderKeyUpHandler);
  }

  $: {
    if (recordingHotkey) {
      addHotkeyRecordingHandlers();
    } else {
      removeHotkeyRecordingHandlers();
    }
  }
</script>

<kbd on:click={() => (recordingHotkey = true)}>
  {#if recordingHotkey}
    Recording keybind...
  {:else}
    {binding || "Not Set"}
  {/if}
</kbd>
<button aria-label="Clear" class="borderless" on:click={() => {
  recordingHotkey = false;
  binding = "";
}}><span class="material-symbols-outlined">backspace</span></button>


<style scoped>
  kbd {
    display: block;
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
    background: var(--color-bg-200);
    flex-grow: 1;
  }
</style>

<script>
import { setContext } from "svelte";
import { writable } from "svelte/store";

  export let value;

  let expanded = false;

  let menu;

  const selected = writable(value);

  const context = {selected};

  setContext("select", context);

  $: value = $selected;
</script>

<svelte:window on:click={(e) => {if (!menu.contains(e.target)) expanded = false; }}></svelte:window>

<div class="select">
  <div class="menu" on:click={() => expanded = !expanded} class:expanded bind:this={menu}>
    <slot />
  </div>
</div>

<style scoped>
  .select {
    display: block;
    position: relative;
    width: 100%;
    height: calc(1rem + 1rem);
  }

  .select::after {
    content: "▼";
    font-family: monospace;
    position: absolute;
    top: 50%;
    right: 1rem;
    transform: translate(0, -50%);
    pointer-events: none;
    z-index: 3;
  }

  .menu {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    background: var(--color-bg-200);
    max-width: 100%;
    border-radius: 0.25rem;
    overflow: clip;
  }

  .menu.expanded {
    z-index: 1;
  }

  .menu:not(.expanded) :global(.select-item:not(.selected)) {
    height: 0;
    padding-block: 0;
    margin: 0;
    overflow: clip;
  } 
</style>
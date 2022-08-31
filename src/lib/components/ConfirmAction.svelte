<script>
  import {createEventDispatcher} from 'svelte';

  const dispatch = createEventDispatcher();

  let showConfirm = false;
</script>

<div class="action">
  <button class:hidden={showConfirm} on:click|stopPropagation={() => {showConfirm = true;}} {...$$restProps}><slot /></button>
  {#if showConfirm}
  <div class="confirm-dialog">
    <button type="button" class="borderless" on:click|stopPropagation={() => {dispatch("confirm"); showConfirm = false;}}>
      <span class="material-symbols-outlined">done</span>
    </button>
    <button type="button" on:click|stopPropagation={() => {showConfirm = false;}} class="borderless">
      <span class="material-symbols-outlined">close</span>
    </button>
  </div>
  {/if}
</div>

<style>
  .action {
    position: relative;
  }
  .confirm-dialog {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    background: var(--color-bg-300);
    border-radius: var(--border-radius);
  }
  .hidden {
    visibility: hidden;
  }
</style>
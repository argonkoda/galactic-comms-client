<script>
  import { getContext } from "svelte";

  export let value;

  const {selected} = getContext('select');
</script>

<div class="select-item" on:click={() => $selected = value} class:selected={$selected === value}>
  <slot />
</div>

<style scoped>
  .select-item {
    padding: 0.5rem 2rem 0.5rem 1rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 1;
    order: 2;
    max-width: 100%;
    overflow: clip;
  }

  .select-item:hover {
    background-color: var(--color-bg-300);
  }

  .select-item.selected {
    display: block;
    order: 1;
  }
</style>
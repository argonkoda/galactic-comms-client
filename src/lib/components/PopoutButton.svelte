<script>
  export let popout = false;
  export let side = "right";
</script>

<div class="popout-container">
  <slot name="activator" open={() => popout = true} />
  {#if popout}
  <div class="popout {side}">
    <slot />
  </div>
  {/if}
</div>

<style>
  .popout-container {
    position: relative;
  }

  .popout {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    background: var(--color-bg-300);
    border-radius: var(--border-radius);
  }

  .popout.right {
    right: 0;
  }

  .popout.left {
    left: 0;
  }
</style>
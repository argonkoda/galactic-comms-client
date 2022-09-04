<script>
  import CommsScreen from "./lib/screens/CommsScreen.svelte";

  import ConnectionScreen from "./lib/screens/ConnectionScreen.svelte";

  import {theme} from "./lib/settings";

  $: document.documentElement.classList.value = $theme;

  let room = null;
  let error = null;

  function showReason(reason) {
    error = reason
    room = null;
  }

  $: closed = room?.closed ?? null;
  $: if (closed) closed.then(showReason);
</script>

{#if room !== null}
  <CommsScreen bind:room />
{:else}
  <ConnectionScreen bind:room bind:error />
{/if}
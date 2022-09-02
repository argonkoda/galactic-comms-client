<script>
import CommsScreen from "./lib/screens/CommsScreen.svelte";

import ConnectionScreen from "./lib/screens/ConnectionScreen.svelte";


  let room = null;
</script>

{#if room !== null}
  <CommsScreen bind:room />
{:else}
  <ConnectionScreen bind:room />
{/if}

<style>
  
</style>

<script>
import ConnectionScreen from "./lib/screens/ConnectionScreen.svelte";


  let room = null;
</script>

{#if room !== null}
  <h1>ROOM</h1>
{:else}
  <ConnectionScreen bind:room />
{/if}

<style>
  
</style>

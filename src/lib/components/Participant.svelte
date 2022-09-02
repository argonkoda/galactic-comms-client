<script>
import FFTGraph from "./FFTGraph.svelte";

  export let participant;
  let {
    steam_id,
    name,
    volume,
    muted,
    quality,
    fft,
    speaking
  } = participant;

  

</script>

<div class="participant">
  <span class="cutoff-text">{$name}</span>
  <div class="volume-controls">
    <input type="range" min=0 max=5 step=0.01 bind:value={$volume} disabled={$muted}>
    <button class="borderless" on:click={() => muted.update(muted => !muted)}><span class="material-symbols-outlined">{$muted ? "volume_off" : "volume_up"}</span></button>
  </div>
  <FFTGraph fft={$fft} />
  <!-- <span>{$quality}</span> -->
</div>

<style>
  .participant {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .volume-controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
</style>
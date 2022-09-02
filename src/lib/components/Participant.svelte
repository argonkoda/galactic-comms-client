<script>
import FFTGraph from "./FFTGraph.svelte";
import PopoutButton from "./PopoutButton.svelte";

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

  let popout = false;

  

</script>
<div class="participant">
  <span class="material-symbols-outlined">
    signal_cellular_{Math.max((quality * 5) | 0, 4)}_bar
  </span>
  <span class="cutoff-text">{name}</span>
  <FFTGraph fft={$fft} />
  <PopoutButton bind:popout>
    <button class="borderless" slot="activator" let:open on:click|stopPropagation={open}><span class="material-symbols-outlined">more_vert</span></button>
    <input type="range" min=0 max=5 step=0.01 bind:value={$volume}>
    <button class="borderless" on:click={() => muted.update(muted => !muted)}><span class="material-symbols-outlined">{$muted ? "volume_off" : "volume_up"}</span></button>
  </PopoutButton>
</div>

<style>
  .participant {
    display: grid;
    grid-template-columns: auto 1fr 1fr auto;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  input {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
</style>
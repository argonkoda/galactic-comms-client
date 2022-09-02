<script>
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

  function updateFFTGraph(ctx, fft) {
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "#42ff9e";
    // ctx.strokeStyle = "var(--color-primary-200)";
    ctx.beginPath();
    ctx.moveTo(0, ctx.canvas.height/2);
    const fRange = (fft.length * 2 / 5) | 0;
    for (let i = 0; i < fRange; i ++) {
      ctx.lineTo(ctx.canvas.width / (fRange + 2) * (i + 1), ctx.canvas.height / 2 - (fft[i]/256 * ctx.canvas.height / 2))
    }
    ctx.lineTo(ctx.canvas.width,ctx.canvas.height / 2);
    for (let i = fRange-1; i >= 0; i --) {
      ctx.lineTo(ctx.canvas.width / (fRange + 2) * (i + 1), ctx.canvas.height / 2 + (fft[i]/256 * ctx.canvas.height / 2))
    }
    ctx.lineTo(0, ctx.canvas.height/2);

    ctx.stroke();
  }

  let canvas = null;
  $: ctx = canvas?.getContext('2d') ?? null;
  $: if (ctx) updateFFTGraph(ctx, $fft);

  let clientWidth, clientHeight;

</script>

<div class="participant">
  <span class="cutoff-text">{$name}</span>
  <div class="volume-controls">
    <input type="range" min=0 max=5 step=0.01 bind:value={$volume} disabled={$muted}>
    <button class="borderless" on:click={() => muted.update(muted => !muted)}><span class="material-symbols-outlined">{$muted ? "volume_off" : "volume_up"}</span></button>
  </div>
  <canvas bind:clientWidth bind:clientHeight width={clientWidth} height={clientHeight} bind:this={canvas}></canvas>
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

  canvas {
    border: 1px solid var(--color-bg-300);
    background: var(--color-bg-100);
    box-shadow: inset 0 0 0.25rem 0 rgba(0,0,0,0.1);
    border-radius: var(--border-radius);
    width: 100%;
    height: 2rem;
  }
</style>
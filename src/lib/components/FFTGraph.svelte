<script>
import { steam_id } from "../settings";


  export let fft;

  function updateFFTGraph(ctx, fft) {
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "#42ff9e";
    ctx.fillStyle = "#42ff9e77";
    // ctx.strokeStyle = "var(--color-primary-200)";
    ctx.beginPath();
    ctx.moveTo(0, ctx.canvas.height/2);
    const fRange = (fft.length * 2 / 5) | 0;
    const stepSize = ctx.canvas.width / (fRange + 2);
    let [lastX, lastY] = [0, ctx.canvas.height/2];

    for (let i = 0; i < fRange; i ++) {
      let [x, y] = [stepSize * (i + 1), ctx.canvas.height / 2 - (fft[i]/256 * ctx.canvas.height / 2)];
      ctx.bezierCurveTo(lastX + stepSize/2 ,lastY, x - stepSize/2, y, x, y);
      [lastX, lastY] = [x, y];
    }
    ctx.lineTo(ctx.canvas.width,ctx.canvas.height / 2);
    [lastX, lastY] = [ctx.canvas.width,ctx.canvas.height / 2];
    for (let i = fRange-1; i >= 0; i --) {
      let [x, y] = [stepSize * (i + 1), ctx.canvas.height / 2 + (fft[i]/256 * ctx.canvas.height / 2)];
      ctx.bezierCurveTo(lastX - stepSize/2 ,lastY, x + stepSize/2, y, x, y);
      [lastX, lastY] = [x, y];
    }
    ctx.bezierCurveTo(lastX - stepSize/2, lastY, stepSize/2, ctx.canvas.height/2, 0, ctx.canvas.height/2);
    ctx.fill();
    ctx.stroke();
  }

  let canvas = null;
  $: ctx = canvas?.getContext('2d') ?? null;
  $: if (ctx) updateFFTGraph(ctx, fft);

  let clientWidth, clientHeight;
</script>

<canvas bind:clientWidth bind:clientHeight width={clientWidth} height={clientHeight} bind:this={canvas}></canvas>

<style>
  

  canvas {
    border: 1px solid var(--color-bg-300);
    background: var(--color-bg-100);
    box-shadow: inset 0 0 0.25rem 0 rgba(0,0,0,0.1);
    border-radius: var(--border-radius);
    width: 100%;
    height: 2rem;
  }
</style>
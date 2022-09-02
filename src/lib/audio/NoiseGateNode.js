// @ts-ignore
import NoiseGateProcessor from './noise-gate?worker&url';
import { readable } from 'svelte/store';

export default class NoiseGateNode extends AudioWorkletNode {
  constructor(audioCtx) {
    super(audioCtx, 'noise-gate-processor', {
      parameterData: {
        threshold: 0.02,
        attackTime: 2048,
      },
      numberOfOutputs: 1,
      outputChannelCount: [1]
    })

    this.volume = readable(0, (set) => {
      /**
       * 
       * @param {MessageEvent} e 
       */
      const handler = (e) => {
        set(e.data.volume ?? 0)
      }

      this.port.addEventListener('message', handler);
      return () => {
        this.port.removeEventListener('message', handler)
      }
    })
    this.port.start();
  }

  static async loadWorklets(audioCtx) {
    await audioCtx.audioWorklet.addModule(NoiseGateProcessor);
  }
}
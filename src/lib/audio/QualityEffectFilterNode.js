// @ts-ignore
import QualityEffectFilterProcessor from './quality-effect-filter?worker&url';

export default class QualityEffectFilterNode extends AudioWorkletNode {
  constructor(audioCtx) {
    super(audioCtx, 'quality-effect-filter-processor', {
      parameterData: {
        quality: 1
      },
      numberOfOutputs: 1,
      numberOfInputs: 2,
      outputChannelCount: [1]
    });
    const bufferSize = audioCtx.sampleRate * 2;
    this.buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    let data = this.buffer.getChannelData(0);
    let lastRandoms = new Array(25).fill(0)
    for (let i = 0; i < bufferSize; i++) {
      for (let j = 0; j < lastRandoms.length; j ++) {
        if (j === 0 || i%j === 0) {
          lastRandoms[j] = Math.random() * 2 - 1;
        }
      }
      data[i] = lastRandoms.reduce((sum, n, j) => sum + n / ((lastRandoms.length - j)), 0) / 2;
    }
    this.noiseNode = new AudioBufferSourceNode(audioCtx, {buffer: this.buffer, loop: true});
    // TODO: Check if filter needed on noise.
    this.filterNode = audioCtx.createBiquadFilter();
    this.filterNode.frequency.value = 3000;
    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this, 0, 1);
    this.noiseNode.start();
  }

  static async loadWorklets(audioCtx) {
    await audioCtx.audioWorklet.addModule(QualityEffectFilterProcessor);
  }
}
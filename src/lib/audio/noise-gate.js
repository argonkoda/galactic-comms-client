// @ts-ignore
class NoiseGateProcessor extends AudioWorkletProcessor {
  constructor(opts) {
    super(opts);
    const { numberOfInputs, numberOfOutputs, outputChannelCount, parameterData, processorOptions } = opts;
    this.buffers = Array.from({ length: outputChannelCount?.[0] || 1 }, _ => new Float32Array(128));
    this.volumeSum = 0;
    this.currentSample = 0;
    this.attack = 0;
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'threshold',
        automationRate: 'a-rate',
        minValue: 0,
        maxValue: 1,
        defaultValue: 0.1,
      },
      {
        name: 'attackTime',
        automationRate: 'k-rate',
        minValue: 1,
        defaultValue: 200,
      }
    ]
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const c = 0;
    for (let s = 0; s < inputs[0]?.[c]?.length ?? 0; s++) {
      const threshold = parameters.threshold.length > 1 ? parameters.threshold[s] : parameters.threshold[0]
      const avgSample = inputs[0][c][s];
      const buffer = this.buffers[c];
      const avgVolume = this.volumeSum / buffer.length;
      this.currentSample = (this.currentSample + 1) % buffer.length;
      this.volumeSum -= buffer[this.currentSample];
      this.volumeSum += (buffer[this.currentSample] = Math.abs(avgSample));
      this.attack = Math.min(parameters.attackTime[0], Math.max(0, this.attack + (avgVolume > threshold ? +1 : -1)))
      output[c][s] = avgSample * this.attack / parameters.attackTime[0];
    }
    // @ts-ignore
    this.port.postMessage({volume: this.volumeSum / buffer.length});
    return true;
  }
}

// @ts-ignore
registerProcessor('noise-gate-processor', NoiseGateProcessor);
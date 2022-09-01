
const random = Float32Array.from({length: 1e6}, _=>Math.random());
let i = 0;
const nextRandom = () => ++i >= random.length ? random[i=0] : random[i];

// @ts-ignore
class QualityEffectFilterProcessor extends AudioWorkletProcessor {
  constructor(opts) {
    super(opts);
    const { numberOfInputs, numberOfOutputs, outputChannelCount, parameterData, processorOptions } = opts;
    this.corruption = 0;
    this.sampled = new Float32Array(50 | 0);
    this.sampleIndex = 0;
    this.sampleSum = 0;
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'quality',
        automationRate: 'a-rate',
        minValue: 0,
        maxValue: 1,
        defaultValue: 1,
      },
    ]
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const c = 0;
    // for (let [c, channel] of inputs[0].entries()) {
      for (let s = 0; s < (inputs[0]?.[c]?.length ?? 0); s++) {
        this.corruption = Math.max(0, Math.min(1, this.corruption + (nextRandom() - 0.5) / 100));
        const quality = parameters.quality.length > 1 ? parameters.quality[s] : parameters.quality[0]
        let avgSample = inputs[0]?.[c]?.[s] ?? 0;
        this.sampleSum -= this.sampled[this.sampleIndex];
        this.sampleSum += this.sampled[this.sampleIndex] = Math.abs(avgSample);
        this.sampleIndex = (this.sampleIndex + 1) % this.sampled.length;

        output[c][s] = quality > 0 ? avgSample * quality + (inputs[1][0][s] * (1-quality) * this.sampleSum / this.sampled.length) : 0;

      }
    return true;
  }
}

// @ts-ignore
registerProcessor('quality-effect-filter-processor', QualityEffectFilterProcessor);
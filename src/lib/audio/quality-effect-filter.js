
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
    let sampleRate = 48000;
    let frequency = 2000;
    let k = Math.tan(Math.PI * frequency / sampleRate);
    let Q = 1;
    let norm = 1 / (1 + k / Q + k * k);
    this.A0 = k / Q * norm;
    this.A1 = 0;
    this.A2 = -this.A0;
    this.B1 = 2 * (k * k - 1) * norm;
    this.B2 = (1 - k / Q + k * k) * norm;
    this.Z1 = 0;
    this.Z2 = 0;
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
        let sample = (inputs[0]?.[c]?.[s] ?? 0);
        let o = sample * this.A0 + this.Z1;
        this.Z1 = sample * this.A1 + this.Z2 - this.B1 * o;
        this.Z2 = sample * this.A2 - this.B2 * o;
        output[c][s] = Math.min(1.0, Math.max(-1.0, o * 10));

        this.corruption = Math.max(0, Math.min(1, this.corruption + (nextRandom() - 0.5) / 100));
        const quality = parameters.quality.length > 1 ? parameters.quality[s] : parameters.quality[0]
        let avgSample = output[c][s];
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
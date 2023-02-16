export class AudioPlayer {
  private audioCtx: AudioContext;
  private buffer: AudioBuffer;
  private sourceNode: AudioBufferSourceNode;
  private gainNode: GainNode;
  private analyserNode: AnalyserNode;
  private isPlaying: boolean;
  private isLoop: boolean;
  private vuMeter: number;


  constructor(private audioUrl: string, private volume: number = 1, private meterCallback?: (level: number) => void) {
    this.audioCtx = new AudioContext();
    this.buffer = null;
    this.sourceNode = null;
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = volume;
    this.isPlaying = false;
    this.vuMeter = 0;

    // Create an AnalyserNode to use as a vu-meter
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 256;

    // Connect nodes to the graph
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioCtx.destination);

    if (meterCallback) {
      this.startMeter();
    }
  }

  private startMeter(): void {
    const meterDataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    const updateMeter = (): void => {
      this.analyserNode.getByteTimeDomainData(meterDataArray);
      let sum = 0;
      for (let i = 0; i < meterDataArray.length; i++) {
        sum += (meterDataArray[i] - 128) * (meterDataArray[i] - 128);
      }
      const rms = Math.sqrt(sum / meterDataArray.length);
      this.vuMeter = Math.max(this.vuMeter * 0.9, rms);
      if (this.meterCallback) {
        this.meterCallback(this.vuMeter);
      }
      requestAnimationFrame(updateMeter);
    };
    requestAnimationFrame(updateMeter);
  }

  async loadAudio(): Promise<void> {
    const response = await fetch(this.audioUrl);
    const audioData = await response.arrayBuffer();
    this.buffer = await this.audioCtx.decodeAudioData(audioData);
  }

  play(): void {
    if (this.buffer) {
      this.sourceNode = this.audioCtx.createBufferSource();
      this.sourceNode.buffer = this.buffer;
      this.sourceNode.connect(this.gainNode);
      this.sourceNode.start(0, this.getCurrentTime());
      this.isPlaying = true;
    }
  }

  stop() {
    if (this.sourceNode) {
      this.sourceNode.stop()
    }
  }

  loop(isLoop: boolean) {
    this.isLoop = isLoop
  }

  pause(): void {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.isPlaying = false;
    }
  }

  getIsplaying() {
    return this.isPlaying
  }

  getDuration(): number {
    if (this.buffer) {
      return this.buffer.duration;
    }
    return 0;
  }

  getCurrentTime(): number {
    if (this.sourceNode) {
      return this.audioCtx.currentTime - this.sourceNode.startTime;
    }
    return 0;
  }

  setCurrentTime(time: number): void {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.start(0, time);
    }
  }

  setVolume(volume: number): void {
    this.volume = volume;
    this.gainNode.gain.value = volume;
  }
}

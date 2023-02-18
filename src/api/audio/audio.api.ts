type AudioPlayerEvents = {
  end: () => void;
};
export class AudioPlayer {
  private audioCtx: AudioContext;
  private buffer: AudioBuffer;
  private sourceNode: AudioBufferSourceNode;
  private gainNode: GainNode;
  private isPlaying: boolean;
  private isPaused: boolean;
  private startTime: number;
  private events: Partial<AudioPlayerEvents> = {};


  constructor(
    private audioUrl: string,
    private volume: number = 1
  ) {
    this.startTime = 0
    this.audioCtx = new AudioContext();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = volume;
    this.isPlaying = false;
    this.isPaused = false;
    this.gainNode.connect(this.audioCtx.destination);

  }

  on(event: string, callback: unknown) {
    if (!this.events) return
    this.events[event] = callback
  }

  async loadAudio(): Promise<void> {
    const response = await fetch(this.audioUrl);
    const audioData = await response.arrayBuffer();
    this.buffer = await this.audioCtx.decodeAudioData(audioData);
  }

  initEvent() {
    this.sourceNode.addEventListener('ended', () => {
      const currentTime = Math.floor(this.getCurrentTime())
      const duration = Math.floor(this.buffer.duration)
      if (currentTime >= duration && this.events?.end) {
        this.events.end()
      }
    });
  }

  play(): void {
    if (this.buffer) {
      this.sourceNode = this.audioCtx.createBufferSource();
      this.sourceNode.buffer = this.buffer;
      this.initEvent()
      this.sourceNode.connect(this.gainNode);
      this.sourceNode.start(0, 0);
      this.isPlaying = true;
      this.isPaused = false;
    }
  }

  stop() {
    if (this.sourceNode && this.isPlaying) {
      this.sourceNode.stop()
      this.isPlaying = false;
      this.isPaused = false;
    }
  }

  pause(): void {
    if (this.sourceNode) {
      if (this.isPlaying) {
        this.sourceNode.stop();
        this.audioCtx.suspend();
        this.isPlaying = false;
        this.isPaused = true;
      } else if (this.isPaused) {
        this.audioCtx.resume();
        const offset = this.getCurrentTime();
        this.sourceNode = this.audioCtx.createBufferSource();
        this.sourceNode.buffer = this.buffer;
        this.sourceNode.connect(this.gainNode);
        this.sourceNode.start(0, offset);
        this.isPlaying = true;
        this.isPaused = false;
      }
    }
  }

  getIsplaying() {
    return this.isPlaying
  }

  getIsPaused() {
    return this.isPaused
  }

  getDuration(): number {
    if (this.buffer) {
      return this.buffer.duration;
    }
    return 0;
  }

  getCurrentTime(): number {
    if (this.audioCtx) {
      return this.audioCtx.currentTime - this.startTime
    }
    return 0;
  }

  setCurrentTime(time: number): void {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
    }
    this.sourceNode = this.audioCtx.createBufferSource();
    this.sourceNode.buffer = this.buffer;
    this.sourceNode.connect(this.gainNode);
    this.sourceNode.start(0, time);
    this.initEvent()
    this.startTime = this.audioCtx.currentTime - time;
  }

  setVolume(volume: number): void {
    this.volume = volume;
    this.gainNode.gain.value = volume;
  }
}

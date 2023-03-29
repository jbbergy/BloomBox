type AudioPlayerEvents = {
  end: () => void
}
export class AudioPlayer {
  private audioCtx: AudioContext
  private buffer: AudioBuffer
  private sourceNode: AudioBufferSourceNode
  private gainNode: GainNode
  private isPlaying: boolean
  private isPaused: boolean
  private startTime: number
  private events: Partial<AudioPlayerEvents> = {}
  private volume: number
  private audioUrl: string
  private analyserNode: AnalyserNode

  constructor(
    audioUrl: string,
    volume = 1
  ) {
    this.startTime = 0
    this.isPlaying = false
    this.isPaused = false
    this.volume = volume
    this.audioUrl = audioUrl
  }

  getRMSLevel(): number | string {
    if (!this.isPlaying && !this.sourceNode && !this.analyserNode) return 0
    const bufferLength = this.analyserNode.fftSize
    const buffer = new Float32Array(bufferLength)

    this.analyserNode.getFloatTimeDomainData(buffer)

    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      const val = buffer[i]
      sum += val * val
    }

    const rms = Math.sqrt(sum / bufferLength)
    const rmsdB = 20 * Math.log10(rms)
    return rmsdB
  }

  getPeakLevel(): number {
    if (!this.isPlaying && !this.sourceNode && !this.analyserNode) return 0
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount)
    this.analyserNode.getByteTimeDomainData(dataArray)
    let peak = -Infinity

    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i] / 128 - 1
      if (value > peak) {
        peak = value
      }
    }

    const dBFS = 20 * Math.log10(Math.abs(peak))
    return dBFS
  }

  on(event: string, callback: unknown) {
    if (!this.events) return
    this.events[event] = callback
  }

  async loadAudio(): Promise<void> {
    this.audioCtx = new AudioContext()
    const response = await fetch(this.audioUrl)
    const audioData = await response.arrayBuffer()
    this.buffer = await this.audioCtx.decodeAudioData(audioData)

    this.sourceNode = this.audioCtx.createBufferSource()
    this.sourceNode.buffer = this.buffer
    this.initEvent()

    this.gainNode = this.audioCtx.createGain()
    this.gainNode.gain.value = this.volume

    this.analyserNode = this.audioCtx.createAnalyser()
    this.analyserNode.fftSize = 2048
    this.analyserNode.maxDecibels = 0
    this.analyserNode.minDecibels = -70
    this.analyserNode.smoothingTimeConstant = 0.1

    this.sourceNode.connect(this.analyserNode)
    this.analyserNode.connect(this.gainNode)
    this.gainNode.connect(this.audioCtx.destination)
  }

  private checkTime() {
    const currentTime = this.audioCtx.currentTime - this.startTime
    const time = Math.floor(currentTime)
    const duration = Math.floor(this.buffer.duration)
    if (time >= duration && this.events?.end) {
      this.events.end()
    }
    return currentTime
  }

  initEvent() {
    this.sourceNode.addEventListener('ended', () => {
      this.checkTime()
    })
  }

  play(): void {
    if (this.buffer) {
      this.sourceNode.start(0, 0)
      this.isPlaying = true
      this.isPaused = false
    }
  }

  stop() {
    if (this.sourceNode && this.isPlaying) {
      this.sourceNode.stop()
      this.isPlaying = false
      this.isPaused = false
    }
  }

  pause(): void {
    if (this.sourceNode) {
      if (this.isPlaying) {
        this.sourceNode.stop()
        this.audioCtx.suspend()
        this.isPlaying = false
        this.isPaused = true
      } else if (this.isPaused) {
        this.audioCtx.resume()
        const offset = this.getCurrentTime()
        this.sourceNode = this.audioCtx.createBufferSource()
        this.sourceNode.buffer = this.buffer
        this.sourceNode.connect(this.analyserNode)
        this.sourceNode.start(0, offset)
        this.isPlaying = true
        this.isPaused = false
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
      return this.buffer.duration
    }
    return 0
  }

  getCurrentTime(): number {
    if (this.audioCtx && this.buffer) {
      return this.checkTime()
    }
    return 0
  }

  setCurrentTime(time: number): void {
    if (this.sourceNode) {
      this.sourceNode.stop()
      this.sourceNode.disconnect()
    }
    this.sourceNode = this.audioCtx.createBufferSource()
    this.sourceNode.buffer = this.buffer
    this.sourceNode.connect(this.analyserNode)
    this.sourceNode.start(0, time)
    this.initEvent()
    this.startTime = this.audioCtx.currentTime - time
  }

  setVolume(volume: number): void {
    if (!this.gainNode) return
    this.volume = volume
    this.gainNode.gain.value = volume
  }
}

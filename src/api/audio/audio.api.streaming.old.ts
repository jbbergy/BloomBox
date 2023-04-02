type AudioPlayerEvents = {
  end: () => void
}
export class AudioPlayer {
  private file: Blob
  private audioUrl: string
  private fileReader: ReadableStreamDefaultReader<Uint8Array>
  private audioContext: AudioContext
  private sourceNode: AudioBufferSourceNode
  private audioBuffer: AudioBuffer
  private isPlaying: boolean
  private isPaused: boolean
  private gainNode: GainNode
  private volume: number
  private analyserNode: AnalyserNode
  private startTime: number
  private events: Partial<AudioPlayerEvents> = {}
  private audioStack: AudioBuffer[] = [] as AudioBuffer[]
  private nextTime = 0

  constructor(
    audioUrl: string,
    volume = 0.8
  ) {
    this.audioContext = new AudioContext()
    this.audioUrl = audioUrl
    this.startTime = 0
    this.volume = volume
    this.isPlaying = false
    this.isPaused = false
  }

  initEvent() {
    console.log('🚀 ~ AudioPlayer ~ initEvent')
    if (this.sourceNode) {
      this.sourceNode.addEventListener('ended', () => {
        this.checkTime()
      })
    }
  }

  private checkTime() {
    console.log('🚀 ~ AudioPlayer ~ checkTime')
    const currentTime = this.audioContext.currentTime - this.startTime
    const time = Math.floor(currentTime)
    const duration = Math.floor(this.audioBuffer.duration)
    if (time >= duration && this.events?.end) {
      this.events.end()
    }
    return currentTime
  }

  async readFile() {
    console.log('🚀 ~ AudioPlayer ~ readFile')
    const { value, done } = await this.fileReader.read()
    if (value?.buffer) {
      this.audioContext.decodeAudioData(
        value.buffer,
        (buffer: AudioBuffer) => {
          this.audioStack.push(buffer)
          if (this.audioStack.length) {
            this.scheduleBuffers()
          }
        },
        (err) => {
          console.log('err(decodeAudioData): ' + err);
        }
      )
    }
    if (done) {
      console.log('done')
      return
    }
    await this.readFile()
  }

  async play() {
    console.log('🚀 ~ AudioPlayer ~ play')
    if (!this.isPlaying) {
      const response = await fetch(this.audioUrl)
      if (response?.body) {
        this.fileReader = response.body.getReader()
        await this.readFile()
      }
    }
  }

  scheduleBuffers() {
    console.log('🚀 ~ AudioPlayer ~ scheduleBuffers')
    while (this.audioStack.length) {
      const stack = this.audioStack.shift()
      this.sourceNode = this.audioContext.createBufferSource()
      this.sourceNode.buffer = stack || null

      this.gainNode = this.audioContext.createGain()
      this.gainNode.gain.value = this.volume

      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = 1024
      this.analyserNode.maxDecibels = 0
      this.analyserNode.minDecibels = -70
      this.analyserNode.smoothingTimeConstant = 0.1

      console.log('connect sourceNode')
      this.sourceNode.connect(this.analyserNode)
      console.log('sourceNode connected')

      console.log('connect gainNode')
      this.analyserNode.connect(this.gainNode)
      console.log('gainNode connected')

      console.log('connect destination')
      this.gainNode.connect(this.audioContext.destination)
      console.log('destination connected')

      if (this.nextTime == 0)
        this.nextTime = this.audioContext.currentTime + 0.01  /// add 50ms latency to work well across systems - tune this if you like
      this.sourceNode.start(this.nextTime)
      this.nextTime += this.sourceNode.buffer.duration // Make the next buffer wait the length of the last buffer before being played
      this.isPlaying = true
    }
  }

  async stop() {
    console.log('🚀 ~ AudioPlayer ~ stop')

    if (this.sourceNode && this.isPlaying) {
      this.sourceNode.stop()
      this.isPlaying = false
      this.isPaused = false
      this.audioStack = [] as AudioBuffer[]
      await this.audioContext.close()
      this.audioContext = null
      this.sourceNode.disconnect()
      this.analyserNode.disconnect()
      this.gainNode.disconnect()
      this.sourceNode = null
      this.analyserNode = null
      this.gainNode = null
    }
  }

  pause() {
    console.log('🚀 ~ AudioPlayer ~ pause')
    if (this.sourceNode) {
      if (this.isPlaying) {
        this.sourceNode.stop()
        this.audioContext.suspend()
        this.isPlaying = false
        this.isPaused = true
      } else if (this.isPaused) {
        this.audioContext.resume()
        const offset = this.getCurrentTime()
        this.sourceNode = this.audioContext.createBufferSource()
        this.sourceNode.buffer = this.audioBuffer
        this.sourceNode.connect(this.analyserNode)
        this.sourceNode.start(0, offset)
        this.isPlaying = true
        this.isPaused = false
      }
    }
  }

  setVolume(volume: number): void {
    console.log('🚀 ~ AudioPlayer ~ setVolume')
    if (!this.gainNode) return
    this.volume = volume
    this.gainNode.gain.value = volume
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


  getIsplaying() {
    console.log('🚀 ~ AudioPlayer ~ getIsplaying')
    return this.isPlaying
  }

  getIsPaused() {
    console.log('🚀 ~ AudioPlayer ~ getIsPaused')
    return this.isPaused
  }

  getDuration(): number {
    if (this.audioBuffer) {
      return this.audioBuffer.duration
    }
    return 0
  }

  getCurrentTime(): number {
    if (this.audioContext && this.audioBuffer) {
      return this.checkTime()
    }
    return 0
  }

  setCurrentTime(time: number): void {
    this.startTime = this.audioContext.currentTime - time
  }
}

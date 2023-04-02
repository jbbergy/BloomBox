type AudioPlayerEvents = {
  end: CallableFunction
}
export class AudioPlayer {
  private fileReader: ReadableStreamDefaultReader<Uint8Array>
  private audioContext: AudioContext
  private sourceNode: AudioBufferSourceNode
  private analyserNode: AnalyserNode
  private gainNode: GainNode
  private audioStack: AudioBuffer[]
  private fileUrl: string
  private fileVolume: number
  private fftSize = 2048
  private maxDecibels = 0
  private minDecibels = -70
  private smoothingTimeConstant = 0.1
  private nextTime = 0
  private nexTimeLatency = 0.01
  private isPlaying = false
  private startTime = 0
  private bufferDuration = 0
  private fadeTime = 0.5
  private events: Partial<AudioPlayerEvents> = {}

  constructor(
    fileUrl: string,
    volume = 0.8
  ) {
    this.fileUrl = fileUrl
    this.fileVolume = volume
  }

  private initBuffer(buffer: AudioBuffer) {
    this.sourceNode = this.audioContext.createBufferSource()
    this.sourceNode.buffer = buffer
    this.bufferDuration += buffer.duration

    this.gainNode = this.audioContext.createGain()
    this.gainNode.gain.value = this.fileVolume

    this.analyserNode = this.audioContext.createAnalyser()
    this.analyserNode.fftSize = this.fftSize
    this.analyserNode.maxDecibels = this.maxDecibels
    this.analyserNode.minDecibels = this.minDecibels
    this.analyserNode.smoothingTimeConstant = this.smoothingTimeConstant

    this.sourceNode.connect(this.analyserNode)
    this.analyserNode.connect(this.gainNode)
    this.gainNode.connect(this.audioContext.destination)

    if (this.nextTime == 0) {
      this.nextTime = this.audioContext.currentTime + this.nexTimeLatency
    }
    this.sourceNode.start(this.nextTime)
    this.nextTime += this.sourceNode.buffer.duration
    console.log('🚀 ~ AudioPlayer ~ initBuffer ~ this.nextTime:', this.nextTime)

    this.isPlaying = true
  }

  private checkTime() {
    const currentTime = this.audioContext.currentTime - this.startTime
    const time = Math.floor(currentTime)
    const duration = Math.floor(this.bufferDuration)
    if (time >= duration && this.events?.end) {
      this.events.end()
    }
    return currentTime
  }

  load(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const recursiveLoad = async () => {
        let chunk: ReadableStreamReadResult<Uint8Array> | null = null
        let audioBuffer: AudioBuffer

        try {
          chunk = await this.fileReader.read()
        } catch (error) {
          reject(new Error(`AudioPlayer::load()::read() error : ${error}`))
          return
        }

        if (!chunk) {
          reject(new Error(`AudioPlayer::load() error : Unable to load current chunk`))
          return
        }

        if (chunk.value?.buffer) {
          try {
            audioBuffer = await this.audioContext.decodeAudioData(chunk.value.buffer)
          } catch (error) {
            reject(new Error(`AudioPlayer::load()::decodeAudioData() error : ${error}`))
            return
          }

          if (audioBuffer) {
            this.audioStack.push(audioBuffer)
          }
        }

        if (chunk.done) {
          resolve()
          return
        }

        recursiveLoad()
      }

      if (!this.fileUrl) {
        reject(new Error(`AudioPlayer::load() : no file provided`))
        return
      }

      const response: Response = await fetch(this.fileUrl)

      if (response?.body) {
        this.fileReader = response.body.getReader()
        this.nextTime = 0
        this.startTime = 0
        this.bufferDuration = 0
        this.audioContext = new AudioContext()
        this.audioStack = [] as AudioBuffer[]
        recursiveLoad()
      }
    })
  }

  play(): void {
    if (this.audioStack?.length > 0) {
      this.audioStack.forEach((buffer: AudioBuffer) => {
        this.initBuffer(buffer)
      })
    }
  }

  async stop(): Promise<void> {
    if (this.sourceNode && this.isPlaying) {
      this.sourceNode.stop()
      this.isPlaying = false
      this.audioStack = [] as AudioBuffer[]
      await this.audioContext.close()
      this.sourceNode.disconnect()
      this.gainNode.disconnect()
      this.analyserNode.disconnect()
    }
  }

  pause(): void { return }

  setVolume(volume: number): void {
    console.log('🚀 ~ AudioPlayer ~ setVolume ~ volume:', volume)

    if (!this.gainNode) return
    this.fileVolume = volume
    const currentTime = this.audioContext.currentTime
    this.gainNode.disconnect()
    this.gainNode.gain.setValueAtTime(volume, currentTime)
    this.gainNode.gain.value = volume
    this.gainNode.connect(this.audioContext.destination)
  }

  getRMSLevel(): number { return 1 }
  getPeakLevel(): number { return 1 }

  getIsplaying(): boolean {
    return this.isPlaying
  }

  getIsPaused(): boolean { return true }

  getDuration(): number {
    return this.bufferDuration
  }

  getCurrentTime(): number {
    if (this.audioContext) {
      return this.checkTime()
    }
    return 0
  }

  setCurrentTime(time: number): void {
    this.startTime = this.audioContext.currentTime - time
  }

  on(event: string, callback: CallableFunction) {
    if (!this.events) return
    this.events[event] = callback
  }
}

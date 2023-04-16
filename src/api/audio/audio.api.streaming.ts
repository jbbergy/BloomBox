type AudioPlayerEvents = {
  end: CallableFunction
}
type NodeQueue = {
  time: number,
  node: AudioBufferSourceNode
}
export class AudioPlayer {
  private queue: NodeQueue[] = []
  private fileReader: ReadableStreamDefaultReader<Uint8Array>
  private audioContext: AudioContext
  private sourceNode: AudioBufferSourceNode
  private analyserNode: AnalyserNode
  private gainNode: GainNode
  private fileUrl: string
  private fileVolume: number
  private fftSize = 2048
  private maxDecibels = 0
  private minDecibels = -70
  private smoothingTimeConstant = 0.1
  private nextTime = 0
  private nexTimeLatency = 0.01
  private isPlaying = false
  private isPaused = false
  private startTime = 0
  private bufferDuration = 0
  private events: Partial<AudioPlayerEvents> = {}
  private seekTimer: NodeJS.Timeout

  constructor(
    fileUrl: string,
    volume = 0.8
  ) {
    this.fileUrl = fileUrl
    this.fileVolume = volume
  }

  private initBuffer(buffer: AudioBuffer) {
    const newSourceNode = this.audioContext.createBufferSource()
    newSourceNode.buffer = buffer
    this.bufferDuration += buffer.duration

    this.gainNode = this.gainNode || this.audioContext.createGain()
    this.gainNode.gain.value = this.fileVolume

    this.analyserNode = this.analyserNode || this.audioContext.createAnalyser()
    this.analyserNode.fftSize = this.fftSize
    this.analyserNode.maxDecibels = this.maxDecibels
    this.analyserNode.minDecibels = this.minDecibels
    this.analyserNode.smoothingTimeConstant = this.smoothingTimeConstant

    newSourceNode.connect(this.analyserNode)
    this.analyserNode.connect(this.gainNode)
    this.gainNode.connect(this.audioContext.destination)
    if (this.nextTime === 0) {
      this.nextTime = this.audioContext.currentTime + this.nexTimeLatency
    }
    this.queue.push({
      time: this.nextTime,
      node: newSourceNode
    })

    newSourceNode.start(this.nextTime)
    this.nextTime += newSourceNode.buffer.duration
    this.bufferDuration += newSourceNode.buffer.duration

    this.isPlaying = true
  }

  private checkTime() {
    const currentTime = this.audioContext.currentTime - this.startTime
    const time = Math.floor(currentTime)
    const duration = Math.floor(this.bufferDuration)
    if (duration > 0 && time >= duration && this.events?.end) {
      this.events.end()
    }
    return currentTime
  }

  async play(): Promise<void | Error> {
    if (!this.fileUrl) {
      return new Error('AudioPlayer::play() : no file provided')
    }
    console.log('🚀 ~ AudioPlayer ~ play ~ this.fileUrl:', this.fileUrl)

    const recursiveLoad = async () => {
      let chunk: ReadableStreamReadResult<Uint8Array> | null = null
      let audioBuffer: AudioBuffer

      try {
        chunk = await this.fileReader.read()
      } catch (error) {
        return new Error(`AudioPlayer::load()::read() error : ${error}`)
      }

      if (!chunk) {
        return new Error(`AudioPlayer::load() error : Unable to load current chunk`)
      }

      console.log('🚀 ~ AudioPlayer ~ recursiveLoad ~ chunk.done:', chunk.done)
      if (chunk.done) {
        console.log('🚀 ~ AudioPlayer ~ initBuffer ~ this.queue:', this.queue)
        return
      }

      if (chunk.value?.buffer) {
        try {
          audioBuffer = await this.audioContext.decodeAudioData(chunk.value.buffer)
        } catch (error) {
          return new Error(`AudioPlayer::load()::decodeAudioData() error : ${error}`)
        }

        if (audioBuffer) {
          this.initBuffer(audioBuffer)
        } else {
          return
        }
      }

      await recursiveLoad()
    }

    this.queue = []
    const response: Response = await fetch(this.fileUrl)
    const readableStream = response.body

    if (readableStream) {
      this.nextTime = 0
      this.startTime = 0
      this.bufferDuration = 0
      this.audioContext = new AudioContext()
      this.fileReader = readableStream.getReader()
      console.log('🚀 ~ AudioPlayer ~ play ~ this.fileReader:', this.fileReader)
      this.fileReader.closed.then(() => {
        console.log('reader closed');
      })
      await recursiveLoad()
    }
  }

  private getCurrentsourceNode(): AudioBufferSourceNode | null {
    const nodes = this.queue.filter(n => n.time <= this.audioContext.currentTime)
    const lastNode = nodes[nodes.length - 1]
    return lastNode?.node || null
  }

  async stop(): Promise<void> {
    if (this.getCurrentsourceNode() && this.isPlaying) {
      this.getCurrentsourceNode()?.stop()
      this.isPlaying = false
      await this.audioContext.close()
      this.getCurrentsourceNode()?.disconnect()
      this.gainNode.disconnect()
      this.analyserNode.disconnect()
      this.queue = []
    }
  }

  pause(): void {
    if (this.audioContext) {
      if (this.isPlaying) {
        this.audioContext.suspend()
        this.isPlaying = false
        this.isPaused = true
      } else if (this.isPaused) {
        this.audioContext.resume()
        this.isPlaying = true
        this.isPaused = false
      }
    }
  }

  setVolume(volume: number): void {
    if (!this.gainNode) return
    this.fileVolume = volume
    const currentTime = this.audioContext.currentTime
    this.gainNode.gain.setValueAtTime(volume, currentTime)
  }

  getRMSLevel(): number {
    if (!this.isPlaying && !this.analyserNode) return 0
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
    if (!this.isPlaying && !this.analyserNode) return 0
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

  getIsplaying(): boolean {
    return this.isPlaying
  }

  getIsPaused(): boolean {
    return this.isPaused
  }

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
    if (this.seekTimer) clearTimeout(this.seekTimer)
    this.seekTimer = setTimeout(() => {
      if (!this.audioContext || !this.getCurrentsourceNode()) return
      this.startTime = time
      this.getCurrentsourceNode()?.stop()
      this.getCurrentsourceNode()?.start(0, this.startTime)
      clearTimeout(this.seekTimer)
    }, 50)
  }

  on(event: string, callback: CallableFunction) {
    if (!this.events) return
    this.events[event] = callback
  }
}

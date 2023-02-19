import { AudioPlayer } from '../../api/audio/audio.api'

export class AudioService {
  private _instance: AudioPlayer | null
  private _instanceId: number | undefined = undefined

  constructor(file: string) {
    this._instance = new AudioPlayer(file)
  }

  destroy() {
    this._instance = null
  }

  getVolume(): number {
    return this._instance?.getVolume() || 0
  }

  getInstance() {
    return this._instance
  }

  getInstanceId() {
    return this._instanceId
  }

  getIsPaused() {
    return this._instance?.getIsPaused()
  }

  getIsPlaying() {
    return this._instance?.getIsplaying()
  }

  getDuration() {
    if (!this._instance) return
    return this._instance.getDuration()
  }

  setVolume(volume = 0.3) {
    this._instance?.setVolume(volume)
  }

  async play() {
    if (!this._instance) return
    await this._instance.loadAudio()
    this._instance.play()
  }

  pause() {
    if (!this._instance) return
    this._instance.pause()
  }


  stop() {
    if (!this._instance) return
    if (this.getIsPlaying() || this.getIsPaused() === true) {
      this._instance.stop()
    }
  }

  seek(seekTo) {
    if (this._instance) {
      this._instance?.setCurrentTime(seekTo)
    }
  }
}

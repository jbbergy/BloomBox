import { AudioPlayer } from 'src/api/audio/audio.api'

export class AudioService {
  private _instance: AudioPlayer | null
  private _instanceId: number | undefined = undefined

  constructor(file: string, volume: number) {
    this._instance = new AudioPlayer(file, volume)
  }

  destroy() {
    this._instance = null
  }

  getRMSLevel(): number | string {
    return this._instance?.getRMSLevel() || 0
  }

  getPeakLevel(): number {
    return this._instance?.getPeakLevel() || 0
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
    if (this._instance) {
      await this._instance.loadAudio()
      this._instance.play()
    }
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

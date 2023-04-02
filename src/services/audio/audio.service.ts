import { AudioPlayer } from '../../api/audio/audio.api.streaming'

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
      try {
        await this._instance.load()
      } catch (error) {
        console.error(error)
      }
      this._instance.play()
    }
  }

  pause() {
    if (!this._instance) return
    this._instance.pause()
  }


  async stop() {
    if (!this._instance) return
    if (this.getIsPlaying() || this.getIsPaused() === true) {
      await this._instance.stop()
    }
  }

  seek(seekTo: number) {
    if (this._instance) {
      this._instance?.setCurrentTime(seekTo)
    }
  }
}

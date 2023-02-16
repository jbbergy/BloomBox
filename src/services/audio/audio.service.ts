import { Howl, Howler } from 'howler'
import { AudioPlayer } from '../../api/audio/audio.api'

export class AudioService {
  private _instance: AudioPlayer | null
  private _isPaused = true
  private _isPlaying = false
  private _instanceId: number | undefined = undefined

  constructor(file: string) {
    this._instance = new AudioPlayer(file)
  }

  destroy() {
    this._instance = null
  }

  getInstance() {
    return this._instance
  }

  getInstanceId() {
    return this._instanceId
  }

  getIsPaused() {
    return this._isPaused
  }

  getIsPlaying() {
    return this._isPlaying
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
    this._isPaused = false
    this._isPlaying = true
  }

  pause() {
    if (!this._instance) return
    this._instance.pause()
    this._isPaused = true
    this._isPlaying = false
  }


  stop() {
    if (!this._instance) return
    if (this._isPlaying || this._isPaused === true) {
      this._instance.stop()
      this._isPaused = false
      this._isPlaying = false
    }
  }

  seek(seekTo) {
    if (this._instanceId) {
      this._instance?.setCurrentTime(seekTo)
    }
  }

  loop(loop) {
    if (this._instanceId) {
      this._instance?.loop(loop)
    }
  }
}

import { defineStore } from 'pinia'
import { AudioService } from '../services/audio/audio.service'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentInstance: null as AudioService | null,
    defaultVolume: 0.5,
    currentVolume: 0,
  }),
  actions: {
    pause() {
      if (!this.currentInstance) return
      this.currentInstance.pause()
    },
    updateRmsLevel() {
      if (this.currentInstance) {
        const newVolume = this.currentInstance.getVolume()
        this.currentVolume = newVolume > 100 ? 100 : newVolume
        requestAnimationFrame(this.updateRmsLevel)
      }
    },
    play(filePath: string, callback: CallableFunction) {
      if (this.currentInstance) {
        this.currentInstance.stop()
        this.currentInstance.destroy()
      }
      this.currentInstance = new AudioService(filePath, this.defaultVolume)
      this.currentInstance.play()
      requestAnimationFrame(this.updateRmsLevel)
      if (callback) {
        this.currentInstance.getInstance().on('end', () => {
          callback()
        })
      }
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'player-store',
        paths: [
          'defaultVolume'
        ]
      }
    ],
  },
})

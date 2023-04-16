import { defineStore } from 'pinia'
import { AudioService } from '../services/audio/audio.service'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentInstance: null as AudioService | null,
    defaultVolume: 0.5,
    currentRMSLevel: 0,
    currentPeakLevel: 0,
    maxRMSLevel: 0,
  }),
  actions: {
    pause() {
      if (!this.currentInstance) return
      this.currentInstance.pause()
    },
    updateRmsLevel() {
      if (this.currentInstance) {
        const rmsdB = this.currentInstance.getRMSLevel()
        if (rmsdB != '-Infinity') {
          this.currentRMSLevel = Math.pow(10, rmsdB / 20) * 100
        }
        requestAnimationFrame(this.updateRmsLevel)
      }
    },
    updatePeakLevel() {
      if (this.currentInstance) {
        const dbFS = this.currentInstance.getPeakLevel()
        this.currentPeakLevel = Math.pow(10, dbFS / 20) * 100
        requestAnimationFrame(this.updatePeakLevel)
      }
    },
    async play(filePath: string, callback: CallableFunction) {
      if (this.currentInstance) {
        await this.currentInstance.stop()
      }
      this.currentInstance = new AudioService(filePath, this.defaultVolume)
      await this.currentInstance.play()
      // await this.currentInstance.seek(0)
      requestAnimationFrame(this.updateRmsLevel)
      requestAnimationFrame(this.updatePeakLevel)
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

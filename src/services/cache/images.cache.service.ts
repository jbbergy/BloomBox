import dayjs from 'dayjs'

const IMAGE_CACHE_LAST_UPDATE = 'image-cache-last-update'

export class CacheImageService {

  addToCache(key: string, value: string) {
    if (!localStorage.getItem(key.toLowerCase())) {
      localStorage.setItem(key.toLowerCase(), value)
      this.setLastUpdate()
    }
  }

  getFromCache(key: string): string | null {
    return localStorage.getItem(key.toLowerCase())
  }

  getLastUpdate() {
    const date = localStorage.getItem(IMAGE_CACHE_LAST_UPDATE)
    const lastUpdate = date ? dayjs(date) : null
    return lastUpdate
  }

  setLastUpdate() {
    const date = dayjs().toISOString()
    localStorage.setItem(IMAGE_CACHE_LAST_UPDATE, date)
  }

  setForceUpdate() {
    const date = dayjs().add(-1, 'year').toISOString()
    localStorage.setItem(IMAGE_CACHE_LAST_UPDATE, date)
  }

}

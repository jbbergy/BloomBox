import { defineStore } from 'pinia'
import { v4 as uuid } from 'uuid'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    isLoading: false as boolean,
    loadingMessage: null as string | null,
    loadingTarget: null as string | null,
    refreshSidebarKey: uuid() as string
  }),
  actions: {
    setRefreshSidebar() {
      this.refreshSidebarKey = uuid()
    }
  }
})

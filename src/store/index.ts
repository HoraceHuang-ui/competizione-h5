import { defineStore } from 'pinia'

export const useStore = defineStore('userStore', {
  state: () => ({
    general: {
      favTracks: [] as string[],
      favCars: {
        GT3: [] as string[],
        GT4: [] as string[],
        GTC: [] as string[],
        TCX: [] as string[],
      },
      msgId: 0,
    },
    servers: {
      listView: false,
    },
    settings: {
      general: {
        lang: 'zh_CN',
        darkMode: 2,
        themeColor: '#785abf',
        customBgThemeColor: '#785abf',
        bgOpacity: 0.85,
      },
      status: {
        serverDownMsg: 'Time for maimai DX!',
      },
      setup: {
        carDisplay: 2, // 1: 英文全写, 2: 英文缩写, 3: 中文缩写
        trackDisplay: 2, // 1: 英文全写, 2: 英文缩写, 3: 中文缩写
        setupLabelEn: false,
        alwaysViewOnly: false,
      },
    },
  }),
  actions: {
    clear() {
      // this.$state = { ...initState }
      this.$reset()
    },
  },
  persist: true,
})

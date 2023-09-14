import { defineStore } from 'pinia'

export const useThemeStore = defineStore('themeStore', {
  state: () => ({ 
    theme: 'light' as 'light' | 'dark' | 'cupcake',
   }),
  actions: {
    toggle() {
      if (this.theme === 'light') {
        this.theme = 'dark'
      } else {
        this.theme = 'light'
      }
    }
  },
  persist: true,
})
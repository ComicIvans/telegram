import { defineStore } from 'pinia'

export const useTagsStore = defineStore('tags', {
  state: () => ({
    tags: ['lol', 'wow'] as string[]
  }),
  persist: true
})

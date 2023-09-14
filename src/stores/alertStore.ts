import { defineStore } from 'pinia'

export const useAlertStore = defineStore('alertStore', {
  state: () => ({
    alert: null as null | {
      message: string,
      type: '' | 'alert-info' | 'alert-success' | 'alert-warning' | 'alert-error',
    },
  }),
  actions: {
    normal(message: string) {
      this.alert = {
        message,
        type: ''
      }
    },
    info(message: string) {
      this.alert = {
        message,
        type: 'alert-info'
      }
    },
    success(message: string) {
      this.alert = {
        message,
        type: 'alert-success'
      }
    },
    warning(message: string) {
      this.alert = {
        message,
        type: 'alert-warning'
      }
    },
    error(message: string) {
      this.alert = {
        message,
        type: 'alert-error'
      }
    },
    clear() {
      this.alert = null
    }
  }
})
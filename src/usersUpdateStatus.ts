import { until } from '@vueuse/core'
import { ref } from 'vue'

export const userUpdatesStatus = ref([] as boolean[])

export const areAllUsersUpdated = () => userUpdatesStatus.value.every((stat) => stat)

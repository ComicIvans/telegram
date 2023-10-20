<template>
  <details
    v-on-click-outside="() => (showDropdown = false)"
    class="dropdown dropdown-end ml-2"
    :open="showDropdown ? 'true' : undefined"
  >
    <summary
      @click.prevent="() => (showDropdown = !showDropdown)"
      class="m-1 btn btn-circle btn-ghost"
    >
      <IconListCheck class="w-6 h-6" />
    </summary>
    <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box min-w-[18rem]">
      <li>
        <label class="cursor-pointer flex items-center">
          <input
            type="checkbox"
            class="checkbox"
            v-model="allowDelete"
            @click.prevent="toggleDelete"
          />
          <span class="label-text font-bold">Eliminar personas sin etiqueta de los grupos</span>
        </label>
      </li>
    </ul>
  </details>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { vOnClickOutside } from '@vueuse/components'
import { IconListCheck } from '@tabler/icons-vue'
import { useTotalUsersStore } from '@/stores/totalUsersStore'

const showDropdown = ref(false)
const allowDelete = ref(true)
const totalUsersStore = useTotalUsersStore()

function toggleDelete() {
  allowDelete.value = !allowDelete.value
  totalUsersStore.allowDelete = allowDelete.value
}
</script>

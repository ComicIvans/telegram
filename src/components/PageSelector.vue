<template>
  <div v-if="totalPages > 1 && totalPages < 5" class="join flex justify-center items-center mb-4">
    <button
      v-for="number of pageNumbers"
      :key="number"
      @click="$emit('changePage', number)"
      class="join-item btn"
      :class="currentPage === number ? 'btn-active' : ''"
    >
      {{ number }}
    </button>
  </div>
  <div v-else-if="totalPages >= 5" class="join flex justify-center items-center mb-4">
    <button
      @click="$emit('changePage', currentPage === 1 ? 1 : currentPage - 1)"
      class="join-item btn"
    >
      <IconChevronsLeft class="w-5 h-5" />
    </button>
    <div class="join-item dropdown dropdown-top">
      <label
        v-on-click-outside="() => (showPagesDropdown = false)"
        @click="togglePagesDropdown"
        tabindex="0"
        class="btn rounded-none w-28"
        >Página {{ currentPage }}</label
      >
      <ul
        tabindex="0"
        class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box flex flex-row items-center justify-center max-h-40 overflow-y-auto"
      >
        <li v-for="number of pageNumbers" :key="number">
          <a
            @click="
              () => {
                $emit('changePage', number)
                activeElement?.blur()
              }
            "
            >Página {{ number }}</a
          >
        </li>
      </ul>
    </div>
    <button
      @click="$emit('changePage', currentPage === totalPages ? totalPages : currentPage + 1)"
      class="join-item btn"
    >
      <IconChevronsRight class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useActiveElement } from '@vueuse/core'
import { IconChevronsRight } from '@tabler/icons-vue'
import { IconChevronsLeft } from '@tabler/icons-vue'
import { vOnClickOutside } from '@vueuse/components'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const showPagesDropdown = ref(false)
const activeElement = useActiveElement()

const pageNumbers = computed(() => {
  const numbers = []
  for (let i = 1; i <= props.totalPages; i++) {
    numbers.push(i)
  }
  return numbers
})

function togglePagesDropdown() {
  if (showPagesDropdown.value) {
    activeElement.value?.blur()
    showPagesDropdown.value = false
  } else {
    showPagesDropdown.value = true
  }
}
</script>

<template>
  <div v-for="tag in tags" :key="tags.indexOf(tag)" class="badge badge-info gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    {{ tag }}
  </div>
  <div class="text-center">
    <div class="dropdown dropdown-left">
      <label v-on-click-outside="() => showTagsDropdown = false" @click.stop="toggleTagsDropdown" tabindex="0"><IconCirclePlus /></label>
      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box flex flex-row items-center justify-center max-h-40 overflow-y-auto w-48">
        <li>
          <div class="join">
            <input type="text" placeholder="Etiqueta..." class="input input-bordered join-item w-28" />
            <button class="btn join-item">S</button>
          </div>
        </li>
        <li v-for="tag in tags" :key="tags.indexOf(tag)">{{ tag }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconCirclePlus } from '@tabler/icons-vue'
import { useActiveElement } from '@vueuse/core'
import { vOnClickOutside } from '@vueuse/components'

defineProps<{
  tags: string[]
}>()

const showTagsDropdown = ref(false)
const activeElement = useActiveElement()

function toggleTagsDropdown() {
  if(showTagsDropdown.value) {
    activeElement.value?.blur()
    showTagsDropdown.value = false
  } else {
    showTagsDropdown.value = true
  }
}

</script>
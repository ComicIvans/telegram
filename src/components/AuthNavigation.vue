<template>
  <header class="sticky top-0 shadow-lg bg-white">
    <nav class="min-w-full flex flex-row-reverse items-center justify-between py-4 pr-4">
      <div class="flex items-center gap-3">
        <button @click.prevent="showDropdown = !showDropdown" class="flex items-center gap-2">
          <IconSettingsFilled class="w-5 h-5 text-gray-800" />
        </button>
        <div v-show="showDropdown" class="absolute top-full right-0 mt-2 mr-2 py-2 bg-white rounded-lg shadow-md">
          <button @click.prevent="editApi" class="block px-4 py-2 hover:bg-gray-100">Editar API</button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconSettingsFilled } from '@tabler/icons-vue';

const emit = defineEmits(['editApi'])
const showDropdown = ref(false)

function editApi() {
  showDropdown.value = false
  emit('editApi')
}

</script>
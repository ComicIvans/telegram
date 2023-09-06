<template>
  <div v-if="tags.length === 0" class="text-center">
    <button  @click.stop=""><IconCirclePlus /></button>
  </div>
  <div v-else v-for="tag in tags" :key="tags.indexOf(tag)" class="badge badge-info gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    {{ tag }}
  </div>
</template>

<script setup lang="ts">
import { IconCirclePlus } from '@tabler/icons-vue';

defineProps<{
  tags: string[]
}>()

</script>
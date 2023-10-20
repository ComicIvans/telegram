<template>
  <div
    class="badge h-fit text-center"
    :class="
      colored
        ? tagColor(tag).isLight
          ? 'text-gray-950'
          : 'text-gray-50'
        : 'bg-neutral-content text-neutral-focus'
    "
    :style="colored ? { 'background-color': tagColor(tag).color } : ''"
  >
    <IconCircleX
      v-if="removable"
      class="inline-block min-h-4 min-w-fit aspect-square -ml-2 mr-1 stroke-current"
      @click="$emit('updateTag', tag)"
    />
    {{ tag }}
  </div>
</template>
<script setup lang="ts">
import uniqolor from 'uniqolor'
import { IconCircleX } from '@tabler/icons-vue'
import { computed } from 'vue'

defineProps<{
  tag: string
  removable: boolean
  colored: boolean
}>()

const tagColor = computed(() => (tag: string) => uniqolor(tag))
</script>

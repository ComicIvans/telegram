<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
</script>

<template>
  <RouterView :data-theme="themeStore.theme" />
  <notifications class="px-2" classes="alert mb-2" position="bottom left" />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()

</script>

<template>
  <RouterView :data-theme="themeStore.theme" />
</template>
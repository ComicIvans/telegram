<template>
  <div class="bg-base-100 rounded-xl">
    <h2 class="text-center flex justify-center items-center font-bold text-xl m-6">Personas</h2>
    <div class="form-control flex-row items-center">
      <input type="text" v-model="searchTerm" placeholder="Buscar" class="input input-bordered flex-grow rounded-full w-auto m-4" />
      <span v-if="usersLoading" class="mr-5 loading loading-spinner loading-md"></span>
      <button class="mr-5 btn btn-circle btn-ghost"><IconReload /></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconReload } from '@tabler/icons-vue'

const searchTerm = ref('')
const usersLoading = ref(false)

</script>
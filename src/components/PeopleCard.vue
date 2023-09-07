<template>
  <div class="bg-base-100 rounded-xl h-fit">
    <h2 class="text-center flex justify-center items-center font-bold text-xl m-6">Personas</h2>
    <div v-if="usersStore.users.length > 0" class="form-control flex-row items-center">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Buscar"
        class="input input-bordered flex-grow rounded-full w-auto m-4"
      />
      <button @click="() => (usersStore.users = [])" class="mr-5 btn btn-circle btn-ghost">
        <IconX />
      </button>
    </div>
    <div class="divider mx-auto w-11/12 m-2"></div>
    <FileSelector v-if="usersStore.users.length === 0" />
    <UsersList v-else :searchTerm="searchTerm" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconX } from '@tabler/icons-vue'
import FileSelector from './FileSelector.vue'
import UsersList from './UsersList.vue'
import { useUsersStore } from '@/stores/usersStore'

const usersStore = useUsersStore()

const searchTerm = ref('')
</script>

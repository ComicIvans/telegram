<template>
  <div class="min-h-screen flex flex-col bg-base-200">
    <header class="border-b top-0 left-0 w-full fixed z-10">
      <DashNav :img="logo" :title="'Gestión de los grupos de Telegram'" />
    </header>

    <main class="flex flex-col flex-grow items-center pt-24">
      <Alert class="mb-4" />
      <button @click="cancelSelection" v-if="groupsSelected && peopleSelected" class="btn">
        Confirmado, click para volver atrás
      </button>
      <div v-else class="flex flex-grow w-10/12 md:justify-center">
        <GroupsCard @toggleSelection="(selection) => (groupsSelected = selection)" class="flex-1" />
        <div class="divider divider-horizontal"></div>
        <PeopleCard @toggleSelection="(selection) => (peopleSelected = selection)" class="flex-1" />
      </div>
    </main>
    <Footer class="mt-4" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import DashNav from '@/components/DashNav.vue'
import Footer from '@/components/Footer.vue'
import Alert from '@/components/Alert.vue'
import GroupsCard from '@/components/GroupsCard.vue'
import PeopleCard from '@/components/PeopleCard.vue'
import logo from '@/assets/images/logo.png'

const groupsSelected = ref(false)
const peopleSelected = ref(false)

function cancelSelection() {
  groupsSelected.value = false
  peopleSelected.value = false
}
</script>

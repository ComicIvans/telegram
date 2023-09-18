<template>
  <div class="min-h-screen flex flex-col bg-base-200">
    <header class="top-0 left-0 w-full fixed z-10 border-b">
      <DashNav :img="logo" :title="'Gestión de los grupos de Telegram'" />
    </header>
    <main class="flex flex-col flex-grow items-center pt-24">
      <Alert class="mb-4" />
      <div v-if="groupsSelected && peopleSelected" class="w-screen">
        <nav class="flex justify-center items-center">
          <div class="flex flex-1 ml-2">
            <button @click="cancelSelection" class="btn btn-circle">
              <IconArrowLeft />
            </button>
          </div>
          <div class="flex flex-grow"></div>
          <div class="tabs tabs-boxed">
            <a
              @click="changeTab('Chats')"
              class="tab tab-lg"
              :class="activeTab === 'Chats' ? 'tab-active' : ''"
              >Vista por chats</a
            >
            <a
              @click="changeTab('Usuarios')"
              class="tab tab-lg"
              :class="activeTab === 'Usuarios' ? 'tab-active' : ''"
              >Vista por usuarios</a
            >
          </div>
          <div class="flex flex-grow"></div>
          <div class="flex flex-1 flex-row-reverse mr-2">
            <button class="btn btn-success">
              Actualizar
              {{ activeTab === 'Chats' ? 'chats' : activeTab === 'Usuarios' ? 'usuarios' : '' }}
            </button>
          </div>
        </nav>
        <div class="divider mx-auto m-2"></div>
        <ConfirmationChatsList v-if="activeTab === 'Chats'" />
        <ConfirmationUsersList v-else-if="activeTab === 'Usuarios'" />
      </div>
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
import ConfirmationChatsList from '@/components/ConfirmationChatsList.vue'
import ConfirmationUsersList from '@/components/ConfirmationUsersList.vue'
import { IconArrowLeft } from '@tabler/icons-vue'
import logo from '@/assets/images/logo.png'

const groupsSelected = ref(false)
const peopleSelected = ref(false)
const activeTab = ref('Chats')

function cancelSelection() {
  groupsSelected.value = false
  peopleSelected.value = false
}

function changeTab(tab: string) {
  activeTab.value = tab
}
</script>

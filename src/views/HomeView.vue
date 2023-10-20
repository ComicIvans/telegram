<template>
  <div class="min-h-screen flex flex-col bg-base-200">
    <header class="top-0 left-0 w-full fixed z-[1] border-b">
      <DashNav
        :img="logo"
        :title="'Gestión de los grupos de Telegram'"
        @delete-all-tags="
          () => {
            groupsSelected = false
            peopleSelected = false
          }
        "
      />
    </header>
    <main class="flex flex-col flex-grow items-center pt-24">
      <Alert class="mb-4" />
      <div v-if="groupsSelected && peopleSelected" class="w-screen">
        <nav class="flex justify-center items-center">
          <div class="flex flex-1 ml-4">
            <button @click="cancelSelection" class="btn btn-circle">
              <IconArrowLeft />
            </button>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Buscar"
              class="input input-bordered rounded-full w-auto mx-2"
            />
            <span
              v-if="statusLoading || statusUpdating"
              class="loading loading-spinner loading-md mx-2"
            ></span>
            <span v-else class="tooltip" data-tip="Actualizar información de chats y usuarios">
              <button @click="reloadAllInfo" class="btn btn-circle">
                <IconReload /></button
            ></span>
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
          <div class="flex flex-1 flex-row-reverse mr-4 items-center">
            <ConfirmationOptions />
            <button
              @click="updateAll()"
              class="btn btn-accent"
              :class="statusLoading || statusUpdating ? 'btn-disabled' : ''"
            >
              Actualizar
              {{ activeTab === 'Chats' ? 'chats' : activeTab === 'Usuarios' ? 'usuarios' : '' }}
            </button>
            <button
              v-if="!statusLoading && !statusUpdating"
              class="tooltip mx-4"
              :class="`text-${status.type}`"
              :data-tip="status.message"
            >
              <IconCheck v-if="status.type === 'success'" />
              <IconAlertTriangle v-else-if="status.type === 'warning'" />
              <IconAlertCircle v-else-if="status.type === 'error'" />
              <IconQuestionMark v-else />
            </button>
          </div>
        </nav>
        <div class="divider mx-auto m-2"></div>
        <p v-if="statusLoading" class="font-bold text-xl text-center m-4">Cargando...</p>
        <ConfirmationChatsList :searchTerm="searchTerm" v-else-if="activeTab === 'Chats'" />
        <ConfirmationUsersList v-else-if="activeTab === 'Usuarios'" />
      </div>
      <div v-else class="flex flex-grow w-10/12 md:justify-center">
        <ChatsCard @toggleSelection="(selection) => (groupsSelected = selection)" class="flex-1" />
        <div class="divider divider-horizontal"></div>
        <UsersCard @toggleSelection="(selection) => (peopleSelected = selection)" class="flex-1" />
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
import ChatsCard from '@/components/ChatsCard.vue'
import UsersCard from '@/components/UsersCard.vue'
import ConfirmationOptions from '@/components/ConfirmationOptions.vue'
import ConfirmationChatsList from '@/components/ConfirmationChatsList.vue'
import ConfirmationUsersList from '@/components/ConfirmationUsersList.vue'
import {
  IconArrowLeft,
  IconCheck,
  IconAlertTriangle,
  IconAlertCircle,
  IconQuestionMark,
  IconReload
} from '@tabler/icons-vue'
import logo from '@/assets/images/logo.png'
import {
  addSelections,
  deleteSelections,
  reloadInfo,
  confirmActions,
  test
} from '@/utils/chatManager'

const groupsSelected = ref(false)
const peopleSelected = ref(false)
const activeTab = ref('Chats')
const searchTerm = ref('')
const statusLoading = ref(false)
const statusUpdating = ref(false)
const status = ref({
  type: 'success',
  message: 'Todo parece correcto'
})

function cancelSelection() {
  groupsSelected.value = false
  peopleSelected.value = false
  deleteSelections()
}

function changeTab(tab: string) {
  activeTab.value = tab
}

watch(
  () => groupsSelected.value && peopleSelected.value,
  (selected) => {
    if (selected) {
      deleteSelections() // Necesario mientras se esté desarrollando
      addSelections()
      reloadAllInfo()
    }
  }
)

function reloadAllInfo() {
  statusLoading.value = true
  reloadInfo(true)
    .then(() => {
      status.value = {
        type: 'success',
        message: 'Todo parece correcto'
      }
    })
    .catch(() => {
      status.value = {
        type: 'warning',
        message: 'Ha habido algún problema, revisa cada chat para más información'
      }
    })
    .finally(() => {
      statusLoading.value = false
    })
}

async function updateAll() {
  statusUpdating.value = true
  await confirmActions()
  statusUpdating.value = false
}

test()
</script>

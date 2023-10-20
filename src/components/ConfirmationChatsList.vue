<template>
  <div class="w-11/12 mx-auto overflow-y-hidden">
    <div class="bg-base-100 mb-4 rounded-xl flex items-center p-2 font-bold text-lg text-center">
      <span class="mx-2 flex-[3]">Chat</span>
      <span class="mx-2 flex-1">Integrantes actuales</span>
      <span class="mx-2 flex-1">Integrantes nuevos</span>
      <span class="mx-2 flex-1">Acción a realizar</span>
      <span class="mx-2 flex-1">Estado actual</span>
      <span class="mx-2 flex-1">Mostrar/Ocultar usuarios</span>
    </div>
    <p v-if="paginatedChats.length === 0" class="text-center">No se ha encontrado ningún chat</p>
    <div
      v-else
      v-for="(chat, index) in paginatedChats"
      :key="index"
      class="collapse overflow-visible"
      :class="checkedChat === chat.id.toString() ? 'bg-base-100' : ''"
      @click="() => (checkedChat = chat.id.toString())"
    >
      <input
        type="radio"
        name="chatsStore.chats-accordion"
        :checked="checkedChat === chat.id.toString()"
      />
      <div class="collapse-title flex flex-row items-center p-2">
        <div class="mx-2 flex items-center flex-[3]">
          <img v-if="chat.photo" class="w-12 h-12 rounded-full" :src="chat.photo" />
          <IconUsersGroup v-else class="inline w-12 h-12" />
          <span class="text-xl font-medium m-2">{{ chat.title }}</span>
        </div>
        <div v-if="chat.participants.length" class="mx-2 flex-1 grid place-items-center">
          {{ chat.participants.length }}
        </div>
        <div v-else class="mx-2 flex-1 grid place-items-center text-warning">
          <span
            class="text-warning tooltip z-[1]"
            data-tip="No se ha podido conseguir el número de usuarios"
            ><IconQuestionMark
          /></span>
        </div>
        <div v-if="chat.participants.length" class="mx-2 flex-1 grid place-items-center">
          {{ countNewUsers(chat.id) }}
        </div>
        <div v-else class="mx-2 flex-1 grid place-items-center text-warning">
          <span
            class="text-warning tooltip z-[1]"
            data-tip="No se ha podido conseguir el número de usuarios"
            ><IconQuestionMark
          /></span>
        </div>
        <div class="mx-2 flex-1 grid place-items-center">
          <span class="text-success tooltip z-[1]" data-tip="Añadir usuarios"><IconPlus /></span>
        </div>
        <div class="mx-2 flex-1 grid place-items-center">
          <span class="text-primary tooltip z-[1]" data-tip="En espera, todo correcto"
            ><IconZzz
          /></span>
        </div>
        <div class="mx-2 flex-1 grid place-items-center">
          <button
            class="btn btn-ghost btn-circle z-[1]"
            @click.stop="
              () => {
                if (checkedChat === chat.id.toString()) checkedChat = ''
                else checkedChat = chat.id.toString()
              }
            "
          >
            <IconChevronUp v-if="checkedChat === chat.id.toString()" /><IconChevronDown v-else />
          </button>
        </div>
      </div>
      <div
        v-if="paginatedUsers.length === 0"
        class="collapse-content flex flex-grow items-center justify-center font-bold text-error"
      >
        No hay usuarios para este chat
      </div>
      <div v-else class="collapse-content w-11/12 mx-auto">
        <div class="divider m-0"></div>
        <div
          class="bg-base-100 mb-4 rounded-xl flex items-center p-2 font-bold text-lg text-center"
        >
          <span class="mx-2 flex-[2]">Usuario</span>
          <span class="mx-2 flex-1">Acción a realizar</span>
          <span class="mx-2 flex-1">Estado actual</span>
          <span class="mx-2 flex-1">Más info</span>
        </div>
        <div
          v-for="user in paginatedUsers"
          :key="user.id.toString()"
          class="flex flex-row items-center my-3"
        >
          <div class="mx-2 flex items-center flex-[2]">
            <img v-if="user.photo" class="w-12 h-12 rounded-full" :src="user.photo" />
            <IconUser v-else class="inline w-12 h-12" />
            <span class="text-xl font-medium m-2">{{ user.firstName + ' ' + user.lastName }}</span>
          </div>
          <div class="mx-2 flex-1 grid place-items-center">
            <button
              v-if="user.action === 'add'"
              class="text-success tooltip"
              data-tip="Añadir al chat"
            >
              <IconPlus />
            </button>
            <button
              v-else-if="user.action === 'remove'"
              class="text-error tooltip"
              data-tip="Eliminar del chat"
            >
              <IconMinus />
            </button>
            <button v-else class="text-info tooltip" data-tip="Mantener en el chat">
              <IconCircleMinus />
            </button>
          </div>
          <div class="mx-2 flex-1 grid place-items-center">
            <button
              v-if="user.status === 'info'"
              class="text-primary tooltip"
              data-tip="En espera, correcto"
            >
              <IconZzz />
            </button>
            <button
              v-else-if="user.status === 'warning'"
              :class="`text-${user.status}`"
              class="tooltip"
              data-tip="Algo está raro"
            >
              <IconAlertTriangle />
            </button>
            <button
              v-else-if="user.status === 'error'"
              :class="`text-${user.status}`"
              class="tooltip"
              data-tip="Ha ocurrido un problema"
            >
              <IconExclamationCircle />
            </button>
            <button
              v-else-if="user.status === 'success'"
              :class="`text-${user.status}`"
              class="tooltip"
              data-tip="Éxito"
            >
              <IconCheck />
            </button>
            <button v-else :class="`text-error`" class="tooltip" data-tip="Error fatídico">
              <IconSkull />
            </button>
          </div>
          <div class="mx-2 flex-1 grid place-items-center">
            <button class="btn btn-ghost btn-circle text-info">
              <IconInfoCircleFilled />
            </button>
          </div>
        </div>
        <div v-if="totalUsersPages > 1" class="divider my-2"></div>
        <PageSelector
          :current-page="currentUsersPage"
          :totalPages="totalUsersPages"
          @change-page="(number) => (currentUsersPage = number)"
        />
      </div>
    </div>
  </div>
  <div v-if="totalChatsPages > 1" class="divider my-2"></div>
  <PageSelector
    :current-page="currentChatsPage"
    :totalPages="totalChatsPages"
    @change-page="(number) => (currentChatsPage = number)"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useChatsStore } from '@/stores/chatsStore'
import { useTotalUsersStore } from '@/stores/totalUsersStore'
import {
  IconUsersGroup,
  IconUser,
  IconChevronDown,
  IconChevronUp,
  IconZzz,
  IconPlus,
  IconQuestionMark,
  IconExclamationMark,
  IconInfoCircleFilled,
  IconAlertTriangle,
  IconExclamationCircle,
  IconCheck,
  IconSkull,
  IconMinus,
  IconCircleMinus,
  IconPlusMinus
} from '@tabler/icons-vue'
import PageSelector from '@/components/PageSelector.vue'
import { useActionsStore } from '@/stores/actionsStore'

// This refers to the number of chats per page and the number of users per page inside each chat
const ROWS_PER_PAGE = 10

const props = defineProps<{
  searchTerm: string
}>()

const chatsStore = useChatsStore()
const totalUsersStore = useTotalUsersStore()
const actionsStore = useActionsStore()

const checkedChat = ref('')
const currentChatsPage = ref(1)
const currentUsersPage = ref(1)

const filteredChats = computed(() => {
  return chatsStore.chats.filter((chat) => {
    return chat.title.toLowerCase().includes(props.searchTerm.toLowerCase())
  })
})

const totalChatsPages = computed(() => {
  return Math.ceil(filteredChats.value.length / ROWS_PER_PAGE)
})

const paginatedChats = computed(() => {
  const startIndex = (currentChatsPage.value - 1) * ROWS_PER_PAGE
  const endIndex = startIndex + ROWS_PER_PAGE
  return filteredChats.value.slice(startIndex, endIndex)
})

const usersInChat = computed(() => {
  if (!checkedChat.value) return []
  const chat = chatsStore.chats.find((chat) => chat.id.toString() === checkedChat.value)
  if (!chat) return []
  const chatActions = actionsStore.actions.filter(
    (action) => action.chatId.toString() === checkedChat.value
  )
  let users = []
  for (const user of totalUsersStore.users) {
    const action = chatActions.find((action) => action.userId.toString() === user.id.toString())
    if (action) {
      users.push({
        ...user,
        status: action.status,
        action: action.action,
        message: action.message
      })
    }
  }
  return users
})

const totalUsersPages = computed(() => {
  return Math.ceil(usersInChat.value.length / ROWS_PER_PAGE)
})

const paginatedUsers = computed(() => {
  const startIndex = (currentUsersPage.value - 1) * ROWS_PER_PAGE
  const endIndex = startIndex + ROWS_PER_PAGE
  return usersInChat.value.slice(startIndex, endIndex)
})

function countNewUsers(chatId: bigInt.BigInteger) {
  const chat = chatsStore.chats.find((chat) => chat.id.toString() === chatId.toString())
  if (!chat) return 0
  const chatActions = actionsStore.actions.filter(
    (action) => action.chatId.toString() === chatId.toString()
  )
  let count = 0
  for (const action of chatActions) {
    if (action.action === 'add' || 'none') count++
    else count--
  }
  return count
}

watch(
  () => checkedChat.value,
  () => {
    currentUsersPage.value = 1
  }
)
</script>

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
      <input type="radio" name="chats-accordion" :checked="checkedChat === chat.id.toString()" />
      <div class="collapse-title flex flex-row items-center p-2">
        <div class="mx-2 flex items-center flex-[3]">
          <img v-if="chat.photo" class="w-12 h-12 rounded-full" :src="chat.photo" />
          <IconUsersGroup v-else class="inline w-12 h-12" />
          <span class="text-xl font-medium m-2">{{ chat.title }}</span>
        </div>
        <div class="mx-2 flex-1 grid place-items-center">10</div>
        <div class="mx-2 flex-1 grid place-items-center">15</div>
        <div class="mx-2 flex-1 grid place-items-center">
          <span class="text-success tooltip z-[1]" data-tip="Añadir usuarios"><IconPlus /></span>
        </div>
        <div class="mx-2 flex-1 grid place-items-center">
          <span class="text-info tooltip z-[1]" data-tip="En espera"><IconZzz /></span>
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
        </div>
        <div
          v-for="user in paginatedUsers"
          :key="user.id?.toString()"
          class="flex flex-row items-center my-3"
        >
          <div class="mx-2 flex items-center flex-[2]">
            <img v-if="user.photo" class="w-12 h-12 rounded-full" :src="user.photo" />
            <IconUser v-else class="inline w-12 h-12" />
            <span class="text-xl font-medium m-2">{{ user.firstName + ' ' + user.lastName }}</span>
          </div>
          <div class="mx-2 flex-1 grid place-items-center">
            <button class="text-success tooltip" data-tip="Añadir al chat">
              <IconPlus />
            </button>
          </div>
          <div class="mx-2 flex-1 grid place-items-center">
            <button class="text-info tooltip" data-tip="En espera"><IconZzz /></button>
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
import { ref, computed } from 'vue'
import { useChatsStore } from '@/stores/chatsStore'
import { useUsersStore } from '@/stores/usersStore'
import {
  IconUsersGroup,
  IconUser,
  IconChevronDown,
  IconChevronUp,
  IconZzz,
  IconPlus
} from '@tabler/icons-vue'
import PageSelector from '@/components/PageSelector.vue'

// This refers to the number of chats per page and the number of users per page inside each chat
const ROWS_PER_PAGE = 10

const props = defineProps<{
  searchTerm: string
}>()

const chatsStore = useChatsStore()
const usersStore = useUsersStore()

const chats = chatsStore.chats.filter((chat) => chat.selected)
const users = usersStore.users.filter((user) => user.selected)
const checkedChat = ref('')
const currentChatsPage = ref(1)
const currentUsersPage = ref(1)

const filteredChats = computed(() => {
  return chats.filter((chat) => {
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
  const chat = chats.find((chat) => chat.id.toString() === checkedChat.value)
  if (!chat) return []
  return users.filter((user) => {
    return user.tags.some((tag) => chat.tags.includes(tag))
  })
})

const totalUsersPages = computed(() => {
  return Math.ceil(usersInChat.value.length / ROWS_PER_PAGE)
})

const paginatedUsers = computed(() => {
  const startIndex = (currentUsersPage.value - 1) * ROWS_PER_PAGE
  const endIndex = startIndex + ROWS_PER_PAGE
  return usersInChat.value.slice(startIndex, endIndex)
})
</script>

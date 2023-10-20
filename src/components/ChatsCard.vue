<template>
  <div class="bg-base-100 rounded-xl h-fit">
    <h2 class="text-center flex justify-center items-center font-bold text-xl m-6">
      Grupos y canales
    </h2>
    <div class="form-control flex-row items-center">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Buscar"
        class="input input-bordered flex-grow rounded-full w-auto m-4"
        @input="() => (currentPage = 1)"
      />
      <span v-if="chatsLoading" class="mr-5 loading loading-spinner loading-md"></span>
      <div v-else class="tooltip" data-tip="Recargar lista de chats">
        <button @click="getAllChats(true)" class="mr-5 btn btn-circle btn-ghost">
          <IconReload />
        </button>
      </div>
    </div>
    <div v-if="selectedChats > 0" class="flex flex-row items-center">
      <button @click="cancelSelection" class="ml-6 btn btn-ghost btn-circle p-1">
        <IconCircleX class="w-7 h-7" />
      </button>
      <p class="mx-2 text-lg flex-grow">
        {{ selectedChats }}
        {{ selectedChats === 1 ? 'chat seleccionado' : 'chats seleccionados' }}
      </p>
      <button
        @click="editSelection"
        class="btn btn-accent mr-6"
        :class="selectionConfirmed ? 'btn-warning' : ''"
      >
        {{ selectionConfirmed ? 'Editar' : 'Confirmar' }}
      </button>
    </div>
    <div class="divider mx-auto w-11/12 m-2"></div>
    <i v-if="chatsLoading" class="text-center flex justify-center items-center text-base mx-4 mb-4"
      >Cargando chats...</i
    >
    <i
      v-else-if="filteredChats.length === 0"
      class="text-center flex justify-center items-center text-base mx-4 mb-4"
      >No se ha encontrado ningún chat</i
    >
    <div v-else class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>
              <label>
                <input
                  @click="toggleCheckAll"
                  v-model="checkAll"
                  type="checkbox"
                  class="checkbox"
                  :disabled="selectionConfirmed"
                />
              </label>
            </th>
            <th>Foto</th>
            <th>Nombre</th>
            <th>Etiquetas</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(chat, index) in paginatedChats"
            :key="index"
            class="hover"
            @click="chat.selected = chat.isAdmin ? !chat.selected : chat.selected"
          >
            <td>
              <label
                :class="!chat.isAdmin ? 'tooltip tooltip-right' : ''"
                :data-tip="
                  !chat.isAdmin ? 'No se puede seleccionar porque no eres admin del chat' : ''
                "
              >
                <input
                  :checked="chat.selected"
                  type="checkbox"
                  class="checkbox"
                  :disabled="selectionConfirmed || !chat.isAdmin"
                />
              </label>
            </td>
            <td class="min-w-[80px]">
              <div
                class="tooltip"
                :data-tip="isSupported && copied ? '¡Copiado!' : 'ID: ' + chat.id"
                @click.stop="
                  () => {
                    if (isSupported) copy(chat.id.toString())
                  }
                "
              >
                <img v-if="chat.photo" class="w-12 h-12 rounded-full" :src="chat.photo" />
                <IconUsersGroup v-else class="w-12 h-12" />
              </div>
            </td>
            <td>{{ chat.title }}</td>
            <td @click.stop="">
              <TagSeletor v-model:tags="chat.tags" :name="chat.title" :id="chat.id.toString()" />
            </td>
            <td>{{ chat.type }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <PageSelector
      :current-page="currentPage"
      :totalPages="totalPages"
      @change-page="(number) => (currentPage = number)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TagSeletor from '@/components/TagSelector.vue'
import PageSelector from '@/components/PageSelector.vue'
import { useClipboard, usePermission } from '@vueuse/core'
import { useTelegramClientStore } from '@/stores/telegramClient'
import { useTotalChatsStore } from '@/stores/totalChatsStore'
import { IconUsersGroup, IconReload, IconCircleX } from '@tabler/icons-vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '@/stores/alertStore'
import { updateChatsPhotos } from '@/utils/chatManager'

const ROWS_PER_PAGE = 10
const emit = defineEmits(['toggleSelection'])

const router = useRouter()

const clientStore = useTelegramClientStore()
const totalChatsStore = useTotalChatsStore()
const alertStore = useAlertStore()

const checkAll = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const chatsLoading = ref(true)
const selectionConfirmed = ref(false)
const oldTags = ref<{ id: bigInt.BigInteger; title: string; tags: string[] }[]>([])

const { copied, isSupported, copy } = useClipboard()
const permissionRead = usePermission('clipboard-read')
const permissionWrite = usePermission('clipboard-write')

async function getAllChats(forceReplace = false) {
  if (!clientStore.client) {
    router.replace('/auth')
    alertStore.error('Se ha cerrado la sesión en Telegram.')
  } else {
    if (
      forceReplace ||
      !totalChatsStore.date ||
      totalChatsStore.chats.length === 0 ||
      (totalChatsStore.date && totalChatsStore.date < Date.now() - 86400000)
    ) {
      chatsLoading.value = true
      storeTags()
      totalChatsStore.date = Date.now()
      totalChatsStore.chats = []
    } else {
      chatsLoading.value = false
      return
    }
    const result = (await clientStore.client.getDialogs()).filter(
      // @ts-ignore
      (chat) => !chat.isUser && chat.title !== '' && !chat.deactivated
    )
    result.forEach((chat) => {
      if (chat.entity && chat.title && clientStore.client && chat.id) {
        totalChatsStore.chats.push({
          id: chat.id,
          title: chat.title,
          type: chat.isGroup ? 'Grupo' : chat.isChannel ? 'Canal' : 'Desconocido',
          photo: null,
          // @ts-ignore
          isAdmin: chat.entity.adminRights || chat.entity.creator ? true : false,
          selected: false,
          tags: []
        })
      }
    })
    // Put the chats with admin rights at the top
    totalChatsStore.chats.sort((a, b) => {
      if (a.isAdmin && !b.isAdmin) return -1
      if (!a.isAdmin && b.isAdmin) return 1
      return 0
    })
    restoreTags()
    chatsLoading.value = false
    updateChatsPhotos(false)
  }
}

function storeTags() {
  oldTags.value = []
  totalChatsStore.chats.forEach((chat) => {
    if (chat.tags.length > 0) {
      oldTags.value.push({
        id: chat.id,
        title: chat.title,
        tags: chat.tags
      })
    }
  })
}

function restoreTags() {
  const notFound: { id: bigInt.BigInteger; title: string; tags: string[] }[] = []
  oldTags.value.forEach((chatTags) => {
    const chat = totalChatsStore.chats.find((chat) => chat.id.toString() === chatTags.id.toString())
    if (chat) {
      chat.tags = chatTags.tags
    } else {
      notFound.push(chatTags)
    }
  })
  if (notFound.length === 1) {
    alertStore.error(
      'Al intentar restaurar las etiquetas de los chats, no se ha podido encontrar ' +
        notFound.length +
        ' de ellos. Se han descartado las etiquetas en este chat.'
    )
  } else if (notFound.length > 1) {
    alertStore.error(
      'Al intentar restaurar las etiquetas de los chats, no se han podido encontrar ' +
        notFound.length +
        ' de ellos. Se han descartado las etiquetas en estos chats.'
    )
  }
}

function toggleCheckAll() {
  filteredChats.value.forEach((chat) => {
    if (!chat.isAdmin) return
    chat.selected = !checkAll.value
  })
}

function cancelSelection() {
  selectionConfirmed.value = false
  checkAll.value = false
  totalChatsStore.chats.forEach((chat) => (chat.selected = false))
}

function editSelection() {
  selectionConfirmed.value = !selectionConfirmed.value
  emit('toggleSelection', selectionConfirmed.value)
}

const filteredChats = computed(() => {
  return totalChatsStore.chats.filter((chat) => {
    return chat.title.toLowerCase().includes(searchTerm.value.toLowerCase())
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredChats.value.length / ROWS_PER_PAGE)
})

const paginatedChats = computed(() => {
  const startIndex = (currentPage.value - 1) * ROWS_PER_PAGE
  const endIndex = startIndex + ROWS_PER_PAGE
  return filteredChats.value.slice(startIndex, endIndex)
})

const selectedChats = computed(() => {
  return totalChatsStore.chats.filter((chat) => chat.selected).length
})

getAllChats(false)

// TODO: Remove all chats and users when logged in with another account
</script>

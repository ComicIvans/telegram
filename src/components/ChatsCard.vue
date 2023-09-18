<template>
  <div class="bg-base-100 rounded-xl h-fit">
    <h2 class="text-center flex justify-center items-center font-bold text-xl m-6">
      Grupos y canales disponibles
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
      <div v-else class="tooltip" data-tip="Recargar lista de grupos">
        <button @click="getAllChats(true)" class="mr-5 btn btn-circle btn-ghost">
          <IconReload />
        </button>
      </div>
    </div>
    <div v-if="selectedGroups > 0" class="flex flex-row items-center">
      <button @click="cancelSelection" class="ml-6 btn btn-ghost btn-circle p-1">
        <IconCircleX class="w-7 h-7" />
      </button>
      <p class="mx-2 text-lg flex-grow">
        {{ selectedGroups }}
        {{ selectedGroups === 1 ? 'chat seleccionado' : 'chats seleccionados' }}
      </p>
      <button
        @click="editSelection"
        class="btn btn-success mr-6"
        :class="selectionConfirmed ? 'btn-warning' : ''"
      >
        {{ selectionConfirmed ? 'Editar' : 'Confirmar' }}
      </button>
    </div>
    <div class="divider mx-auto w-11/12 m-2"></div>
    <i v-if="chatsLoading" class="text-center flex justify-center items-center text-base mx-4 mb-4"
      >Cargando grupos...</i
    >
    <i
      v-else-if="filteredGroups.length === 0"
      class="text-center flex justify-center items-center text-base mx-4 mb-4"
      >No se ha encontrado ningún grupo</i
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
            v-for="group in paginatedGroups"
            :key="paginatedGroups.indexOf(group)"
            class="hover"
            @click="group.selected = !group.selected"
          >
            <td>
              <label>
                <input
                  :checked="group.selected"
                  type="checkbox"
                  class="checkbox"
                  :disabled="selectionConfirmed"
                />
              </label>
            </td>
            <td>
              <div
                class="tooltip"
                :data-tip="isSupported && copied ? '¡Copiado!' : 'ID: ' + group.id"
                @click.stop="
                  () => {
                    if (isSupported) copy(group.id.toString())
                  }
                "
              >
                <img v-if="group.photo" class="w-12 h-12 rounded-full" :src="group.photo" />
                <IconUsersGroup v-else class="w-12 h-12" />
              </div>
            </td>
            <td>{{ group.title }}</td>
            <td @click.stop="">
              <TagSeletor v-model:tags="group.tags" :name="group.title" :id="group.id.toString()" />
            </td>
            <td>{{ group.type }}</td>
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
import { useChatsStore } from '@/stores/chatsStore'
import { IconUsersGroup, IconReload, IconCircleX } from '@tabler/icons-vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '@/stores/alertStore'

const ROWS_PER_PAGE = 50
const emit = defineEmits(['toggleSelection'])

const router = useRouter()

const clientStore = useTelegramClientStore()
const chatsStore = useChatsStore()
const alertStore = useAlertStore()

const checkAll = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const chatsLoading = ref(true)
const selectionConfirmed = ref(false)
const oldTags = ref<{ id: BigInt; title: string; tags: string[] }[]>([])

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
      !chatsStore.date ||
      chatsStore.chats.length === 0 ||
      (chatsStore.date && chatsStore.date < Date.now() - 86400000)
    ) {
      chatsLoading.value = true
      storeTags()
      chatsStore.date = Date.now()
      chatsStore.chats = []
    } else {
      chatsLoading.value = false
      return
    }
    const result = (await clientStore.client.getDialogs()).filter(
      (chat) => !chat.isUser && chat.title !== ''
    )
    result.forEach((chat) => {
      if (chat.entity && chat.title && clientStore.client) {
        chatsStore.chats.push({
          // @ts-expect-error
          id: chat.id,
          title: chat.title,
          type: chat.isChannel ? 'Canal' : chat.isGroup ? 'Grupo' : 'Desconocido',
          photo: null,
          // @ts-ignore
          canAddUsersAsAdmin: chat.entity.adminRights && chat.entity.adminRights.inviteUsers,
          canAddUsersAsUser: false,
          selected: false,
          tags: []
        })
      }
    })
    restoreTags()
    chatsLoading.value = false
    getPhotos(true)
  }
}

function storeTags() {
  oldTags.value = []
  chatsStore.chats.forEach((chat) => {
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
  const notFound: { id: BigInt; title: string; tags: string[] }[] = []
  oldTags.value.forEach((chatTags) => {
    const chat = chatsStore.chats.find((chat) => chat.id.toString() === chatTags.id.toString())
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

async function getPhotos(forceReplace = false) {
  const chats = forceReplace ? chatsStore.chats : paginatedGroups.value
  chats.forEach(async (chat) => {
    if (chat.id && clientStore.client && (!chat.photo || forceReplace)) {
      // @ts-expect-error
      const result = await clientStore.client.downloadProfilePhoto(chat.id)
      if (result) {
        const base64 = result.toString('base64')
        if (base64) {
          chat.photo = 'data:image/jpeg;base64,' + base64
        }
      }
    }
  })
}

function toggleCheckAll() {
  filteredGroups.value.forEach((group) => {
    group.selected = !checkAll.value
  })
}

function cancelSelection() {
  selectionConfirmed.value = false
  checkAll.value = false
  chatsStore.chats.forEach((chat) => (chat.selected = false))
}

function editSelection() {
  selectionConfirmed.value = !selectionConfirmed.value
  emit('toggleSelection', selectionConfirmed.value)
}

const filteredGroups = computed(() => {
  return chatsStore.chats.filter((group) => {
    return group.title.toLowerCase().includes(searchTerm.value.toLowerCase())
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredGroups.value.length / ROWS_PER_PAGE)
})

const paginatedGroups = computed(() => {
  const startIndex = (currentPage.value - 1) * ROWS_PER_PAGE
  const endIndex = startIndex + ROWS_PER_PAGE
  return filteredGroups.value.slice(startIndex, endIndex)
})

const selectedGroups = computed(() => {
  return chatsStore.chats.filter((chat) => chat.selected).length
})

getAllChats()
</script>
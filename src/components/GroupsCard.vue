<template>
  <div class="bg-base-100 rounded-xl">
    <h2 class="text-center flex justify-center items-center font-bold text-xl m-6">
      Grupos y canales disponibles
    </h2>
    <div class="form-control flex-row items-center">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Buscar"
        class="input input-bordered flex-grow rounded-full w-auto m-4"
      />
      <span v-if="chatsLoading" class="mr-5 loading loading-spinner loading-md"></span>
      <button v-else @click="getAllChats(true)" class="mr-5 btn btn-circle btn-ghost">
        <IconReload />
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
                <input :checked="group.selected" type="checkbox" class="checkbox" />
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
              <TagSeletor v-model:tags="group.tags" :group-name="group.id.toString()" />
            </td>
            <td>{{ group.type }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="totalPages > 1 && totalPages < 5" class="join flex justify-center items-center mb-4">
      <button
        v-for="number of pageNumbers"
        :key="number"
        @click="() => (currentPage = number)"
        class="join-item btn"
        :class="currentPage === number ? 'btn-active' : ''"
      >
        {{ number }}
      </button>
    </div>
    <div v-else-if="totalPages >= 5" class="join flex justify-center items-center mb-4">
      <button
        @click="() => (currentPage = currentPage === 1 ? 1 : currentPage - 1)"
        class="join-item btn"
      >
        <IconChevronsLeft class="w-5 h-5" />
      </button>
      <div class="join-item dropdown dropdown-top">
        <label
          v-on-click-outside="() => (showPagesDropdown = false)"
          @click="togglePagesDropdown"
          tabindex="0"
          class="btn rounded-none w-28"
          >Página {{ currentPage }}</label
        >
        <ul
          tabindex="0"
          class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box flex flex-row items-center justify-center max-h-40 overflow-y-auto"
        >
          <li v-for="number of pageNumbers" :key="number">
            <a
              @click="
                () => {
                  currentPage = number
                  activeElement?.blur()
                }
              "
              >Página {{ number }}</a
            >
          </li>
        </ul>
      </div>
      <button
        @click="() => (currentPage = currentPage === totalPages ? totalPages : currentPage + 1)"
        class="join-item btn"
      >
        <IconChevronsRight class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TagSeletor from '@/components/TagSelector.vue'
import { vOnClickOutside } from '@vueuse/components'
import { useActiveElement } from '@vueuse/core'
import { useClipboard, usePermission } from '@vueuse/core'
import { useTelegramClientStore } from '@/stores/telegramClient'
import { useChatsStore } from '@/stores/chatsStore'
import router from '@/router'
import { IconChevronsRight } from '@tabler/icons-vue'
import { IconChevronsLeft } from '@tabler/icons-vue'
import { IconReload } from '@tabler/icons-vue'
import { IconUsersGroup } from '@tabler/icons-vue'

const ROWS_PER_PAGE = 50

const clientStore = useTelegramClientStore()
const chatsStore = useChatsStore()

const checkAll = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const showPagesDropdown = ref(false)
const activeElement = useActiveElement()
const chatsLoading = ref(true)

const { copied, isSupported, copy } = useClipboard()
const permissionRead = usePermission('clipboard-read')
const permissionWrite = usePermission('clipboard-write')

async function getAllChats(forceReplace = false) {
  if (!clientStore.client) {
    router.replace('/auth')
  } else {
    if (
      forceReplace ||
      !chatsStore.date ||
      chatsStore.chats.length === 0 ||
      (chatsStore.date && chatsStore.date < Date.now() - 86400000)
    ) {
      chatsLoading.value = true
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
          id: chat.id,
          title: chat.title,
          type: chat.isChannel ? 'Canal' : chat.isGroup ? 'Grupo' : 'Desconocido',
          photo: null,
          canAddUsersAsAdmin:
            chat.entity.adminRights && chat.entity.adminRights.inviteUsers ? true : false,
          canAddUsersAsUser: false,
          selected: false,
          tags: []
        })
      }
    })
    chatsLoading.value = false
    getPhotos(true)
  }
}

async function getPhotos(forceReplace = false) {
  const chats = forceReplace ? chatsStore.chats : paginatedGroups.value
  chats.forEach(async (chat) => {
    if (chat.id && clientStore.client && (!chat.photo || forceReplace)) {
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

const filteredGroups = computed(() => {
  currentPage.value = 1
  return chatsStore.chats.filter((group) => {
    return group.title.toLowerCase().includes(searchTerm.value.toLowerCase())
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredGroups.value.length / ROWS_PER_PAGE)
})

const pageNumbers = computed(() => {
  const numbers = []
  for (let i = 1; i <= totalPages.value; i++) {
    numbers.push(i)
  }
  return numbers
})

const paginatedGroups = computed(() => {
  const startIndex = (currentPage.value - 1) * ROWS_PER_PAGE
  const endIndex = startIndex + ROWS_PER_PAGE
  return filteredGroups.value.slice(startIndex, endIndex)
})

function togglePagesDropdown() {
  if (showPagesDropdown.value) {
    activeElement.value?.blur()
    showPagesDropdown.value = false
  } else {
    showPagesDropdown.value = true
  }
}

getAllChats()
</script>

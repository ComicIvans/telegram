<template>
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>
            <label>
              <input @click="toggleCheckAll" v-model="checkAll" type="checkbox" class="checkbox" />
            </label>
          </th>
          <th>Foto</th>
          <th>Nombre</th>
          <th>Etiquetas</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in paginatedUsers"
          :key="paginatedUsers.indexOf(user)"
          class="hover"
          @click="user.selected = !user.selected"
        >
          <td>
            <label>
              <input :checked="user.selected" type="checkbox" class="checkbox" />
            </label>
          </td>
          <td>
            <div
              v-if="user.id"
              class="tooltip"
              :data-tip="isSupported && copied ? '¡Copiado!' : 'ID: ' + user.id"
              @click.stop="
                () => {
                  if (isSupported) copy(user.id.toString())
                }
              "
            >
              <img v-if="user.photo" class="w-12 h-12 rounded-full" :src="user.photo" />
              <IconUsersGroup v-else class="w-12 h-12" />
            </div>
          </td>
          <td>{{ user.first_name + ' ' + user.last_name }}</td>
          <td @click.stop="">
            <TagSeletor
              v-if="user.id"
              v-model:tags="user.tags"
              :name="user.first_name + ' ' + user.last_name"
              :id="user.id.toString()"
            />
            <IconCircleX v-else />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <PageSelector
    :current-page="currentPage"
    :totalPages="totalPages"
    @change-page="(number) => (currentPage = number)"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TagSeletor from '@/components/TagSelector.vue'
import PageSelector from '@/components/PageSelector.vue'
import { useClipboard, usePermission } from '@vueuse/core'
import { useTelegramClientStore } from '@/stores/telegramClient'
import { useUsersStore } from '@/stores/usersStore'
import { IconUsersGroup, IconCircleX } from '@tabler/icons-vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  searchTerm: string
}>()

const ROWS_PER_PAGE = 50

const router = useRouter()

const clientStore = useTelegramClientStore()
const usersStore = useUsersStore()

const checkAll = ref(false)
const currentPage = ref(1)
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
  const users = forceReplace ? usersStore.users : paginatedUsers.value
  users.forEach(async (user) => {
    if (user.id && clientStore.client && (!user.photo || forceReplace)) {
      const result = await clientStore.client.downloadProfilePhoto(user.id)
      if (result) {
        const base64 = result.toString('base64')
        if (base64) {
          user.photo = 'data:image/jpeg;base64,' + base64
        }
      }
    }
  })
}

function toggleCheckAll() {
  filteredUsers.value.forEach((user) => {
    user.selected = !checkAll.value
  })
}

const filteredUsers = computed(() => {
  currentPage.value = 1
  return usersStore.users.filter((user) => {
    return (user.first_name + ' ' + user.last_name)
      .toLowerCase()
      .includes(props.searchTerm.toLowerCase())
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / ROWS_PER_PAGE)
})

const paginatedUsers = computed(() => {
  const startIndex = (currentPage.value - 1) * ROWS_PER_PAGE
  const endIndex = startIndex + ROWS_PER_PAGE
  return filteredUsers.value.slice(startIndex, endIndex)
})

//getAllUsers()
</script>

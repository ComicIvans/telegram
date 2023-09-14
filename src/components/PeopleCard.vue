<template>
  <div class="bg-base-100 rounded-xl h-fit">
    <h2 class="text-center flex justify-center items-center font-bold text-xl m-6">Personas</h2>
    <div v-if="usersStore.users.length > 0">
      <div class="form-control flex-row items-center">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Buscar"
          class="input input-bordered flex-grow rounded-full w-auto m-4"
          @input="() => (currentPage = 1)"
        />
        <div class="tooltip" data-tip="Intentar localizar en Telegram">
          <button @click="niceFun" class="mr-5 btn btn-circle btn-ghost">
            <IconCloudDownload />
          </button>
        </div>
      </div>
      <div class="divider mx-auto w-11/12 m-2"></div>
      <div class="overflow-x-auto">
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
                  :class="user.id ? 'tooltip' : ''"
                  :data-tip="isSupported && copied ? '¡Copiado!' : 'ID: ' + user.id"
                  @click.stop="
                    () => {
                      if (user.id && isSupported) copy(user.id.toString())
                    }
                  "
                >
                  <img v-if="user.photo" class="w-12 h-12 rounded-full" :src="user.photo" />
                  <IconUser v-else class="w-12 h-12" />
                </div>
              </td>
              <td>{{ user.first_name + ' ' + user.last_name }}</td>
              <td @click.stop="">
                <TagSeletor
                  v-model:tags="user.tags"
                  :name="user.first_name + ' ' + user.last_name"
                  :id="user.id ? user.id.toString() : 'NotFound' + paginatedUsers.indexOf(user)"
                />
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
    </div>
    <FileSelector v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IconCloudDownload } from '@tabler/icons-vue'
import FileSelector from './FileSelector.vue'
import { useUsersStore } from '@/stores/usersStore'
import TagSeletor from '@/components/TagSelector.vue'
import PageSelector from '@/components/PageSelector.vue'
import { useClipboard, usePermission } from '@vueuse/core'
import { useTelegramClientStore } from '@/stores/telegramClient'
import { IconUser } from '@tabler/icons-vue'
import { useRouter } from 'vue-router'

// BORRAR
const niceFun = () => {
  console.info('nice')
  usersStore.users = []
  console.info('really nice')
}

const ROWS_PER_PAGE = 50

const router = useRouter()

const clientStore = useTelegramClientStore()
const usersStore = useUsersStore()

const searchTerm = ref('')
const checkAll = ref(false)
const currentPage = ref(1)
const usersLoading = ref(true)

const { copied, isSupported, copy } = useClipboard()
const permissionRead = usePermission('clipboard-read')
const permissionWrite = usePermission('clipboard-write')

async function getAllUsers(forceReplace = false) {
  if (!clientStore.client) {
    router.replace('/auth')
  } else {
    if (
      forceReplace ||
      !usersStore.date ||
      (usersStore.date && usersStore.date < Date.now() - 86400000)
    ) {
      usersLoading.value = true
      usersStore.date = Date.now()
    } else {
      usersLoading.value = false
      return
    }
    //const result =
    usersLoading.value = false
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
  return usersStore.users.filter((user) => {
    return (user.first_name + ' ' + user.last_name)
      .toLowerCase()
      .includes(searchTerm.value.toLowerCase())
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

getAllUsers()
</script>

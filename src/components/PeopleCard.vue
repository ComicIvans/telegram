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
        <span v-if="usersLoading" class="mr-5 loading loading-spinner loading-md"></span>
        <div v-else class="tooltip" data-tip="Intentar localizar en Telegram">
          <button @click="() => getAllUsers(true)" class="mr-5 btn btn-circle btn-ghost">
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
                  <IconUser v-else-if="user.id" class="w-12 h-12" />
                  <IconUserExclamation
                    v-else-if="user.failedTelegram"
                    class="w-12 h-12 text-error"
                  />
                  <IconUserQuestion v-else class="w-12 h-12" />
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
import {
  IconCloudDownload,
  IconUser,
  IconUserQuestion,
  IconUserExclamation
} from '@tabler/icons-vue'
import FileSelector from './FileSelector.vue'
import { useUsersStore } from '@/stores/usersStore'
import TagSeletor from '@/components/TagSelector.vue'
import PageSelector from '@/components/PageSelector.vue'
import { useClipboard, usePermission } from '@vueuse/core'
import { useTelegramClientStore } from '@/stores/telegramClient'
import { useRouter } from 'vue-router'
import { useAlertStore } from '@/stores/alertStore'
import type { Entity } from 'telegram/define'
import { Api } from 'telegram'

const ROWS_PER_PAGE = 50

const router = useRouter()

const clientStore = useTelegramClientStore()
const usersStore = useUsersStore()
const alertStore = useAlertStore()

const searchTerm = ref('')
const checkAll = ref(false)
const currentPage = ref(1)
const usersLoading = ref(false)

const { copied, isSupported, copy } = useClipboard()
const permissionRead = usePermission('clipboard-read')
const permissionWrite = usePermission('clipboard-write')

async function getAllUsers(forceReplace = false) {
  if (!clientStore.client) {
    router.replace('/auth')
    alertStore.error('Se ha cerrado la sesión en Telegram.')
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
    for (const user of usersStore.users) {
      try {
        let result: Promise<Entity | undefined>
        if (user.username) {
          result = clientStore.client.getEntity(user.username)
        } else if (user.phone) {
          let id = await clientStore.client.invoke(
            new Api.contacts.ResolvePhone({
              phone: user.phone
            })
          )
          if (!id || !id.users || id.users.length === 0 || !id.users[0].id) {
            throw new Error('Could not find user')
          }
          await clientStore.client.invoke(
            new Api.contacts.AddContact({
              id: id.users[0].id,
              firstName: user.first_name,
              lastName: user.last_name,
              phone: user.phone,
              addPhonePrivacyException: false
            })
          )
          result = clientStore.client.getEntity(user.phone)
        } else {
          throw new Error('No username or phone number found')
        }
        await result
          .then((entity) => {
            if (entity) {
              // @ts-expect-error
              user.id = entity.id
            } else {
              user.failedTelegram = true
            }
          })
          .catch(() => {
            user.failedTelegram = true
          })
      } catch (error) {
        console.log(error)
        user.failedTelegram = true
      }
    }
    usersLoading.value = false
    getPhotos(true)
  }
}

async function getPhotos(forceReplace = false) {
  const users = forceReplace ? usersStore.users : paginatedUsers.value
  users.forEach(async (user) => {
    if (user.id && clientStore.client && (!user.photo || forceReplace)) {
      // @ts-expect-error
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

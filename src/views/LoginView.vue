<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <AuthNavigation @edit-api="changeApiCredentials" />
    <div class="flex flex-grow flex-col items-center justify-center w-full">
      <div class="max-w-sm w-full p-6 bg-white rounded-lg shadow-md text-center">
        <h1 class="text-2xl font-bold">Inicia sesión en Telegram</h1>
        <div v-if="isLoading" class="mt-4">Iniciando sesión...</div>
        <div v-else>
          <form v-if="!store.apiId || !store.apiHash" @submit.prevent="setApiCredentials" class="mt-4">
            <div class="mb-4 w-1/3 mx-auto">
              <label for="api-id" class="block mb-2 font-bold">API ID</label>
              <input type="text" id="api-id" v-model="apiId" v-maska data-maska="Z" data-maska-tokens="Z:[0-9]:multiple" class="text-center w-full px-3 py-2 border-2 rounded-lg caret-transparent" placeholder="0000000" />
            </div>
            <div class="mb-4">
              <label for="api-hash" class="block mb-2 font-bold">API Hash</label>
              <input type="text" id="api-hash" v-model="apiHash" class="text-center w-full px-3 py-2 border-2 rounded-lg caret-transparent" placeholder="zzitz5xexaoy8d86d6sc7oyu932fq8t8" />
            </div>
            <button type="submit" @click.prevent="setApiCredentials" class="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">Guardar</button>
          </form>
          <form v-else-if="!store.stringSession" @submit.prevent="login" class="mt-4">
            <div class="mb-4">
              <label for="phone-number" class="block mb-2 font-bold">Teléfono</label>
              <input type="text" id="phone-number" v-model="phoneNumber" class="w-full px-3 py-2 border-2 rounded-lg" />
            </div>
            <div class="mb-4">
              <label for="password" class="block mb-2 font-bold">Constraseña</label>
              <input type="password" id="password" v-model="password" class="w-full px-3 py-2 border-2 rounded-lg" />
            </div>
            <div v-if="showCodeInput" class="mb-4">
              <label for="code" class="block mb-2 font-bold">Código</label>
              <input type="text" id="code" v-model="code" class="w-full px-3 py-2 border-2 rounded-lg" />
            </div>
            <button v-if="!showCodeInput" type="button" @click="sendCode" class="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">Enviar código</button>
            <button v-else type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">Iniciar sesión</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { vMaska } from "maska"
import { useTelegramSessionStore } from '@/stores/telegramSession'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import AuthNavigation from '@/components/AuthNavigation.vue'

const store = useTelegramSessionStore()

const apiId = ref('')
const apiHash = ref('')
const phoneNumber = ref('')
const password = ref('')
const code = ref('')
const isLoading = ref(false)
const showCodeInput = ref(false)

async function setApiCredentials() {
  store.apiId = Number.parseInt(apiId.value)
  store.apiHash = apiHash.value
}

async function changeApiCredentials() {
  apiId.value = store.apiId?.toString() ?? ''
  apiHash.value = store.apiHash ?? ''
  store.apiId = null
  store.apiHash = null
}

async function login() {
  isLoading.value = true

  const client = new TelegramClient(new StringSession(store.stringSession ?? ''), store.apiId ?? 0, store.apiHash ?? '', {
    connectionRetries: 5,
  })
  try {
    await client.connect()
    isLoading.value = false
    store.stringSession = (client.session as StringSession).save()
    // Navigate to home page
  } catch (error) {
    console.error(error)
    isLoading.value = false
    showCodeInput.value = true
  }
}

async function sendCode() {
  isLoading.value = true

  const client = new TelegramClient(new StringSession(store.stringSession ?? ''), store.apiId ?? 0, store.apiHash ?? '', {
    connectionRetries: 5,
  })
  try {
    await client.connect()
    const sentCode = await client.invoke({
      _: 'auth.sendCode',
      phone_number: phoneNumber.value,
      settings: {
        _: 'codeSettings'
      }
    })
    isLoading.value = false
    showCodeInput.value = true
  } catch (error) {
    console.error(error)
    isLoading.value = false
  }
}

</script>
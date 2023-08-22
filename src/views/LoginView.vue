<template>
  <div class="min-h-screen flex flex-col bg-base-200">
    <header class="border-b top-0 left-0 w-full fixed z-10">
      <LoginNav @editApi="editApi = true" :img="imgDGE" :title="'Gestión de los grupos de Telegram'" :can-search="false" />
    </header>
    
    <main class="flex flex-col flex-grow items-center pt-24">
      <Alert class="mb-4" />
      <div class="flex flex-col flex-grow md:justify-center">
        <div  v-if="editApi || !authStore.apiId || !authStore.apiHash" class="card w-96 bg-base-100 shadow-xl">
          <div class="card-body items-center text-center">
            <h2 class="card-title">Inicia sesión en Telegram</h2>
            <h3 class="font-bold text-lg">API ID</h3>
            <input type="text" id="api-id" v-model="apiId" v-maska data-maska="Z" data-maska-tokens="Z:[0-9]:multiple" class="input input-bordered w-full max-w-xs" :class="missingApiId ? 'input-error' : ''" placeholder="0000000" />
            <h3 class="font-bold text-lg">API Hash</h3>
            <input type="text" id="api-hash" v-model="apiHash" v-maska data-maska="Z" data-maska-tokens="Z:[0-9a-zA-Z]:multiple" class="input input-bordered w-full max-w-xs" :class="missingApiHash ? 'input-error' : ''" placeholder="zzitz5xexaoy8d86d6sc7oyu932fq8t8" />
            <p>Puedes encontrar los datos de la API en la <a class="link-accent" href="https://my.telegram.org/auth">página de Telegram</a></p>
            <div class="card-actions">
              <button @click.prevent="setApiCredentials" class="mt-2 btn btn-primary">Guardar</button>
            </div>
          </div>
        </div>
        <div v-else class="card w-96 bg-base-100 shadow-xl">
          <div v-if="showInfoOnly" class="card-body items-center text-center">
            <h2 class="card-title">Inicia sesión en Telegram</h2>
            <div class="card-actions">
              <i>{{ loadingStatus }}</i>
            </div>
          </div>
          <div @keyup.enter="() => { if(!loading) !codeSent ? setPhone() : resumeLogin() }" v-else class="card-body items-center text-center">
            <h2 class="card-title">Inicia sesión en Telegram</h2>
            <h3 class="font-bold text-lg">Teléfono</h3>
            <input type="text" id="phone" v-model="phoneNumber" class="input input-bordered w-full max-w-xs" :class="badPhone ? 'input-error' : ''" :disabled="phoneSet" placeholder="+12223334455" />
            <div v-if="codeSent">
              <h3 class="font-bold text-lg mb-2">Código</h3>
              <input type="text" id="code" v-model="code" v-maska data-maska="Z" data-maska-tokens="Z:[0-9]:multiple" class="input input-bordered w-full max-w-xs" :disabled="codeSet" :class="badCode ? 'input-error' : ''" placeholder="12345" />
            </div>
            <div v-if="passwordNeeded">
              <h3 class="font-bold text-lg mb-2">Contraseña</h3>
              <input type="password" id="password" v-model="password" class="input input-bordered w-full max-w-xs" :class="badPassword ? 'input-error' : ''" :disabled="passwordSet" />
            </div>
            <div class="card-actions">
              <button class="mt-2 btn btn-primary w-40">
                <span v-if="loading" class="loading loading-spinner loading-md"></span>
                <span v-else-if="!codeSent" @click.prevent="setPhone">Enviar código</span>
                <span v-else-if="codeSent" @click.prevent="resumeLogin">Iniciar sesión</span>
              </button>
            </div>
            <i>{{ loadingStatus }}</i>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { ref, watch } from 'vue'
import LoginNav from '@/components/LoginNav.vue'
import Footer from '@/components/Footer.vue'
import Alert from '@/components/Alert.vue'
import { vMaska } from "maska"
import validator from 'validator'
import { useTelegramAuthStore } from '@/stores/telegramAuth'
import { useTelegramClientStore } from '@/stores/telegramClient'
import { useAlertStore } from '@/stores/alertStore'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import imgDGE from '@/assets/images/dge.png'
import router from '@/router'

const clientStore = useTelegramClientStore()
const alertStore = useAlertStore()
const authStore = useTelegramAuthStore()

const editApi = ref(false)
const apiId = ref(authStore.apiId?.toString() ?? '')
const apiHash = ref(authStore.apiHash?.toString() ?? '')
const missingApiId = ref(false)
const missingApiHash = ref(false)

const loading = ref(false)
const loadingStatus = ref('')
const showInfoOnly = ref(false)

const phoneNumber = ref('')
const phoneSet = ref(false)
const badPhone = ref(false)

const code = ref('')
const badCode = ref(false)
const codeSent = ref(false)
const codeSet = ref(false)

const password = ref('')
const badPassword = ref(false)
const passwordNeeded = ref(false)
const passwordSet = ref(false)


onBeforeMount(() => {
  if(authStore.apiId && authStore.apiHash) {
    if(!clientStore.client || !clientStore.client.checkAuthorization()) {
      tryLogIn()
    } else {
      router.replace('/dashboard')
    }
  }
})

async function setApiCredentials() {
  if(!apiId.value || !apiHash.value) {
    alertStore.error('Debes introducir los datos de la API')
    if(!apiId.value) missingApiId.value = true
    else missingApiId.value = false
    if(!apiHash.value) missingApiHash.value = true
    else missingApiHash.value = false
  } else {
    alertStore.clear()
    missingApiId.value = false
    missingApiHash.value = false
    authStore.apiId = parseInt(apiId.value)
    authStore.apiHash = apiHash.value
    editApi.value = false
    tryLogIn()
  }
}

function resetLogin() {
  loading.value = false
  loadingStatus.value = ''
  showInfoOnly.value = false

  phoneSet.value = false
  badPhone.value = false

  code.value = ''
  badCode.value = false
  codeSent.value = false
  codeSet.value = false

  password.value = ''
  badPassword.value = false
  passwordNeeded.value = false
  passwordSet.value = false
}

function setPhone() {
  if(!validator.isMobilePhone(phoneNumber.value)) {
    badPhone.value = true
    alertStore.error('El número de teléfono no es válido')
    return
  } else {
    alertStore.clear()
    badPhone.value = false
    phoneSet.value = true
    loading.value = true
    login()
  }
}

async function login() {
  try {
    const response = await clientStore.client?.signInUser({
        apiId: authStore.apiId!,
        apiHash: authStore.apiHash!,
      }, {
        phoneNumber: phoneNumber.value,
        password: (hint) => askPassword(hint),
        phoneCode: (isCodeViaApp) => askCode(isCodeViaApp),
        onError: (error) => {
          alertStore.error('No se ha podido iniciar sesión: ' + error)
          resetLogin()
        },
      }
    )
    showInfoOnly.value = true
    loading.value = false
    loadingStatus.value = '¡Sesión iniciada!'
    authStore.stringSession = clientStore.client?.session.save() ?? null
    router.replace('/dashboard')
  } catch(error) {
    alertStore.error('No se ha podido iniciar sesión: ' + error)
    resetLogin()
  }
}

async function askCode(isCodeViaApp: boolean | undefined): Promise<string> {
  loading.value = false
  codeSent.value = true
  loadingStatus.value = isCodeViaApp ? 'Código enviado al Telegram' : 'Código enviado'
  return new Promise<string>((resolve, reject) => {
    watch(codeSet, () => {
      if(codeSet.value) {
        resolve(code.value)
      }
      else {
        reject()
      }
      loading.value = true
      loadingStatus.value = 'Iniciando sesión...'
    })
  })
}

async function askPassword(hint: string | undefined): Promise<string> {
  loading.value = false
  loadingStatus.value = 'Es necesaria la contraseña de verificación en dos pasos' + (hint ? '. Pista: ' + hint : '')
  passwordNeeded.value = true
  return new Promise<string>((resolve, reject) => {
    watch(passwordSet, () => {
      if(passwordSet.value) {
        resolve(password.value)
      } else {
        reject()
      }
      loading.value = true
      loadingStatus.value = 'Iniciando sesión...'
    })
  })
}

async function tryLogIn() {
  showInfoOnly.value = true
  alertStore.clear()
  try {
    loadingStatus.value = 'Conectando a los servidores de Telegram...'
    clientStore.client = new TelegramClient(
      new StringSession(authStore.stringSession ?? ''),
      authStore.apiId!,
      authStore.apiHash!,
      {
        connectionRetries: 5,
      }
    )
    await clientStore.client.connect()
    loadingStatus.value = '¡Conectando!'
    if(await clientStore.client.checkAuthorization()) {
      loadingStatus.value = '¡Sesión iniciada!'
      router.replace('/dashboard')
    } else {
      resetLogin()
    }
  } catch(error) {
    alertStore.error('No se ha podido conectar a los servidores de Telegram: ' + error)
    resetLogin()
  }
}

async function resumeLogin() {

  if(!code.value) {
    badCode.value = true
    alertStore.error('Debes introducir el código')
    return
  } else if(!codeSet.value) {
    alertStore.clear()
    badCode.value = false
    loading.value = true
    loadingStatus.value = 'Iniciando sesión...'
    codeSet.value = true
  }

  if(passwordNeeded.value) {
    if(!password.value) {
      badPassword.value = true
      alertStore.error('Debes introducir la contraseña')
    } else {
      alertStore.clear()
      badPassword.value = false
      loading.value = true
      loadingStatus.value = 'Iniciando sesión...'
      passwordSet.value = true
    }
  }
}

</script>
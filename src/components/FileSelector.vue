<template>
  <i v-if="loading" class="text-center flex justify-center items-center text-base mx-4 mb-4"
    >Cargando archivo...</i
  >
  <div v-else class="mx-auto w-11/12">
    <div
      ref="dropZoneRef"
      class="mb-2 border-dashed border-2 rounded-md py-12 flex flex-col justify-center items-center"
      :class="
        isOverDropZone
          ? 'outline outline-4 outline-accent'
          : fileError
          ? 'outline outline-4 outline-error'
          : ''
      "
    >
      <p class="mb-3 font-bold flex flex-wrap justify-center">Arrastra un archivo o</p>
      <input id="hidden-input" type="file" multiple class="hidden" />
      <button @click="() => open()" class="mt-2 btn px-3 py-1">Elegir archivo</button>
    </div>
    <p class="mb-3 flex flex-wrap justify-center mt-2">
      El archivo debe tener el siguiente formato JSON:
    </p>
    <div class="mockup-code mb-4">
      <pre><code>[</code></pre>
      <pre><code>  {</code></pre>
      <pre><code>    first_name: 'Name',</code></pre>
      <pre><code>    last_name: 'Name' | '',</code></pre>
      <pre><code>    phone: '+34666666666',</code></pre>
      <pre><code>    username: 'username' | '',</code></pre>
      <pre><code>    tags: ['tag1', 'tag2'] | []</code></pre>
      <pre><code>  }</code></pre>
      <pre><code>]</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFileDialog } from '@vueuse/core'
import { useDropZone } from '@vueuse/core'
import { useAlertStore } from '@/stores/alertStore'
import { z } from 'zod'

const { files, open, reset, onChange } = useFileDialog()
const dropZoneRef = ref<HTMLDivElement>()
const alertStore = useAlertStore()

const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)
const fileError = ref(false)
const loading = ref(false)

function onDrop(files: File[] | null) {
  fileError.value = false
  alertStore.clear()
  if (files && files.length > 0) {
    if (files.length === 1) {
      loading.value = true
      loadFile(files[0])
    } else {
      fileError.value = true
      alertStore.error('No puedes arrastrar más de un archivo')
    }
  } else {
    fileError.value = true
    alertStore.error('No se ha podido conseguir el archivo')
  }
}

onChange((files) => {
  alertStore.clear()
  if (files && files.length > 0) {
    if (files.length === 1) {
      loading.value = true
      loadFile(files[0])
    } else {
      fileError.value = true
      alertStore.error('No puedes elegir más de un archivo')
    }
  } else {
    fileError.value = true
    alertStore.error('No se ha podido conseguir el archivo')
  }
})

function loadFile(file: File) {
  parseJsonFile(file)
    .then((data) => {
      if (areUsers(data)) {
        console.log(data)
      } else {
        fileError.value = true
        alertStore.error('El archivo no tiene el formato correcto')
      }
      loading.value = false
    })
    .catch((error) => {
      loading.value = false
      fileError.value = true
      alertStore.error('El archivo no tiene un formato JSON')
    })
}

function parseJsonFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsText(file)
  })
}

const UserSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
  username: z.string(),
  tags: z.array(z.string())
})

type User = z.infer<typeof UserSchema>

function areUsers(data: any): data is User[] {
  try {
    const parsedUsers = UserSchema.array().parse(data)
    return parsedUsers.length === data.length
  } catch (error) {
    return false
  }
}
</script>

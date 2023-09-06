<template>
  <div class="bg-base-100 rounded-xl">
    <h2 class="text-center flex justify-center items-center font-bold text-xl m-6">Personas</h2>
    <div class="form-control flex-row items-center">
      <input type="text" v-model="searchTerm" placeholder="Buscar" class="input input-bordered flex-grow rounded-full w-auto m-4" />
      <span v-if="loading" class="mr-5 loading loading-spinner loading-md"></span>
      <button v-else class="mr-5 btn btn-circle btn-ghost"><IconReload /></button>
    </div>
    <div class="divider mx-auto w-11/12 m-2"></div>
      <i v-if="loading" class="text-center flex justify-center items-center text-base mx-4 mb-4">Cargando archivo...</i>
      <div v-else class="mx-auto w-11/12">
        <div ref="dropZoneRef" class="mb-2 border-dashed border-2 rounded-md py-12 flex flex-col justify-center items-center" :class="isOverDropZone ? 'outline outline-4 outline-accent' : fileError ? 'outline outline-4 outline-error' : ''">
        <p class="mb-3 font-bold flex flex-wrap justify-center">Arrastra un archivo o</p>
        <input id="hidden-input" type="file" multiple class="hidden" />
        <button @click="() => open()" class="mt-2 btn px-3 py-1">
          Elegir archivo
        </button>
      </div>
      <p class="mb-3 flex flex-wrap justify-center mt-2">El archivo debe tener el siguiente formato JSON:</p>
      <div class="mockup-code">
        <pre><code>[</code></pre>
        <pre><code>  {</code></pre>
        <pre><code>    first_name: 'Name',</code></pre>
        <pre><code>    last_name: 'Name' | '',</code></pre>
        <pre><code>    phone: '+34666666666',</code></pre>
        <pre><code>    username: 'username' | '',</code></pre>
        <pre><code>    tags: ['tag1', 'tag2'] | [],</code></pre>
        <pre><code>  },</code></pre>
        <pre><code>]</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconReload } from '@tabler/icons-vue'
import { useFileDialog } from '@vueuse/core'
import { useDropZone } from '@vueuse/core'
import { useAlertStore } from '@/stores/alertStore'

const { files, open, reset, onChange } = useFileDialog()
const dropZoneRef = ref<HTMLDivElement>()
const alertStore = useAlertStore()

const searchTerm = ref('')
const usersLoading = ref(false)
const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)
const fileError = ref(false)
const loading = ref(false)

function onDrop(files: File[] | null) {
  fileError.value = false
  alertStore.clear()
  if(files && files.length > 0) {
    if(files.length === 1) {
      loading.value = true
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
  if(files && files.length > 0) {
    if(files.length === 1) {
      loading.value = true
    } else {
      fileError.value = true
      alertStore.error('No puedes elegir más de un archivo')
    }
  } else {
    fileError.value = true
    alertStore.error('No se ha podido conseguir el archivo')
  }
})

</script>
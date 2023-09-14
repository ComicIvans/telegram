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
import { useDropZone } from '@vueuse/core'
import { useFileSelector } from '@/composables/useFileSelector'

const dropZoneRef = ref<HTMLDivElement>()

const { isOverDropZone } = useDropZone(dropZoneRef, (files) =>
  fileHandler(files, `No puedes arrastrar más de un archivo`)
)
const {
  loading,
  fileError,
  fileHandler,
  dialogOpen: open
} = useFileSelector(dropZoneRef, (data, usersStore) => {
  usersStore.users = []
  data.forEach((user) => {
    usersStore.users.push({
      ...user,
      id: null,
      photo: null,
      selected: false,
      failedTelegram: false
    })
  })
})
</script>

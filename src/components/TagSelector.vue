<template>
  <div class="min-w-[100px] max-w-[120px]">
    <div
      v-for="tag in tags"
      :key="tags.indexOf(tag)"
      class="badge h-fit text-center"
      :class="tagColor(tag).isLight ? 'text-gray-950' : 'text-gray-50'"
      :style="{ 'background-color': tagColor(tag).color }"
    >
      <IconCircleX
        class="inline-block min-h-4 min-w-fit aspect-square -ml-2 mr-1 stroke-current"
        @click="updateTag(tag)"
      />
      {{ tag }}
    </div>
    <div>
      <button :onclick="`mod${id.replace('-', '_')}.showModal()`" tabindex="0">
        <IconCirclePlus />
      </button>
    </div>
    <dialog :id="`mod${id.replace('-', '_')}`" class="modal">
      <div class="modal-box flex flex-col">
        <div class="flex flex-row mb-4">
          <h3 class="font-bold text-lg pb-4 flex-grow">Etiquetas para {{ name }}</h3>
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost">
              <IconX />
            </button>
          </form>
        </div>
        <div class="overflow-y-scroll max-h-[70vh]">
          <div class="form-control flex-row" v-for="tag in tagsStore.tags" :key="tag">
            <label class="label cursor-pointer justify-start flex-grow">
              <input
                type="checkbox"
                :checked="tags.includes(tag)"
                class="checkbox mr-3"
                @change="updateTag(tag)"
              />
              <span class="label-text">{{ tag }}</span> </label
            ><button @click="deleteTag(tag)" class="btn btn-ghost btn-circle mr-2">
              <IconTrash class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="join mt-4 mx-auto">
          <input
            class="input input-bordered join-item"
            placeholder="Nueva etiqueta..."
            v-model="newTag"
          />
          <button class="btn join-item" @click="addTag" :disabled="newTag.length === 0">
            Añadir
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { IconCirclePlus, IconCircleX, IconX, IconTrash } from '@tabler/icons-vue'
import { useTagsStore } from '@/stores/tagsStore'
import uniqolor from 'uniqolor'
import { computed, ref } from 'vue'
import { useNotification } from '@kyvg/vue3-notification'

const props = defineProps<{
  id: string
  name: string
  tags: string[]
}>()

const emit = defineEmits(['update:tags'])

const { notify } = useNotification()

const tagsStore = useTagsStore()

const updateTag = (tag: string) => {
  notify({
    text: 'Etiqueta actualizada',
    type: 'alert-info'
  })
  if (props.tags.includes(tag)) {
    emit(
      'update:tags',
      props.tags.filter((t) => t !== tag)
    )
  } else {
    emit('update:tags', [...props.tags, tag])
  }
}

const newTag = ref('')
const addTag = () => {
  emit('update:tags', [...props.tags, newTag.value])
  tagsStore.tags.push(newTag.value)
  newTag.value = ''
  notify({
    text: 'Etiqueta creada',
    type: 'alert-info'
  })
}

const deleteTag = (tag: string) => {
  if (props.tags.includes(tag)) {
    emit(
      'update:tags',
      props.tags.filter((t) => t !== tag)
    )
  }
  const index = tagsStore.tags.indexOf(tag)
  if (index !== -1) {
    tagsStore.tags.splice(index, 1)
  }
  notify({
    text: 'Etiqueta eliminada',
    type: 'alert-info'
  })
}

const tagColor = computed(() => (tag: string) => uniqolor(tag))
</script>

<template>
  <div class="min-w-[100px] max-w-[100px]">
    <div
      v-for="tag in tags"
      :key="tags.indexOf(tag)"
      class="badge h-fit text-center"
      :class="tagColor(tag).isLight ? 'text-gray-950' : 'text-gray-50'"
      :style="{ 'background-color': tagColor(tag).color }"
      @click="updateTag(tag)"
    >
      <IconCircleX class="inline-block w-4 h-4 -ml-2 mr-1 stroke-current" />
      {{ tag }}
    </div>
    <div class="">
      <button :onclick="`mod${groupId.replace('-', '_')}.showModal()`" tabindex="0">
        <IconCirclePlus />
      </button>
    </div>
    <dialog :id="`mod${groupId.replace('-', '_')}`" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg pb-4">Etiquetas para {{ groupName }}</h3>
        <div class="form-control" v-for="tag in availableTags" :key="tag">
          <label class="label cursor-pointer justify-start">
            <input
              type="checkbox"
              :checked="tags.includes(tag)"
              class="checkbox mr-3"
              @change="updateTag(tag)"
            />
            <span class="label-text">{{ tag }}</span>
          </label>
        </div>
        <div class="join mt-4">
          <input
            class="input input-bordered join-item"
            placeholder="Nueva etiqueta..."
            v-model="newTag"
          />
          <button class="btn join-item" @click="addTag" :disabled="newTag.length === 0">
            Añadir
          </button>
        </div>
        <div class="modal-action">
          <form method="dialog">
            <!-- if there is a button in form, it will close the modal -->
            <button class="btn btn-circle"><IconX /></button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { IconCirclePlus, IconCircleX, IconX } from '@tabler/icons-vue'
import { useTagsStore } from '@/stores/tagsStore'
import uniqolor from 'uniqolor'
import { computed, ref } from 'vue'

const props = defineProps<{
  groupId: string
  groupName: string
  tags: string[]
}>()

const emit = defineEmits(['update:tags'])

const availableTags = useTagsStore().tags

const updateTag = (tag: string) => {
  console.log('changed')
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
  availableTags.push(newTag.value)
  newTag.value = ''
}

const tagColor = computed(() => (tag: string) => uniqolor(tag))
</script>

<template>
  <div class="w-11/12 mx-auto">
    <div
      v-for="chat in chats"
      :key="chat.id.toString()"
      class="collapse"
      :class="checkedChat === chat.id.toString() ? 'bg-base-100' : ''"
      @click="() => (checkedChat = chat.id.toString())"
    >
      <input type="radio" name="my-accordion-2" :checked="checkedChat === chat.id.toString()" />
      <div class="collapse-title flex flex-row items-center">
        <img v-if="chat.photo" class="w-12 h-12 rounded-full" :src="chat.photo" />
        <IconUsersGroup v-else class="w-12 h-12" />
        <p class="text-xl font-medium m-2 flex-grow">{{ chat.title }}</p>
        <button
          class="btn btn-ghost btn-circle z-[1]"
          @click.stop="
            () => {
              if (checkedChat === chat.id.toString()) checkedChat = ''
              else checkedChat = chat.id.toString()
            }
          "
        >
          <IconChevronUp v-if="checkedChat === chat.id.toString()" /><IconChevronDown v-else />
        </button>
      </div>
      <div class="collapse-content">
        <p>hello</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatsStore } from '@/stores/chatsStore'
import { useUsersStore } from '@/stores/usersStore'
import { IconUsersGroup, IconChevronDown, IconChevronUp } from '@tabler/icons-vue'

const chatsStore = useChatsStore()
const usersStore = useUsersStore()

const chats = chatsStore.chats.filter((chat) => chat.selected)
const users = usersStore.users.filter((user) => user.selected)
const checkedChat = ref('')
</script>

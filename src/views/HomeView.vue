<template>
  <div class="min-h-screen flex flex-col bg-base-200">
    <header class="border-b top-0 left-0 w-full fixed z-10">
      <DashNav :img="imgDGE" :title="'Gestión de los grupos de Telegram'" :can-search="false" />
    </header>
    
    <main class="flex flex-col flex-grow items-center pt-24">
      <Alert class="mb-4" />
      <div class="flex flex-col flex-grow md:justify-center">
        Yay!
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashNav from '@/components/DashNav.vue'
import Footer from '@/components/Footer.vue'
import Alert from '@/components/Alert.vue'
import { vMaska } from "maska"
import imgDGE from '@/assets/images/dge.png'
import router from '@/router'

function editApi() {

}

</script>

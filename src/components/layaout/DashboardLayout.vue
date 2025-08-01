<template>
  <div class="d-flex">
    <!-- Sidebar fijo a la izquierda -->
    <Sidebar
      :class="[
        hiddenSidebarOnMobile ? 'd-none' : '',
        'd-md-block position-fixed bg-dark text-white'
      ]"
      style="width: 250px; height: 100vh; top: 0; left: 0; z-index: 1030;"
    />

    <!-- Contenedor de contenido (navbar + página) -->
    <div
      class="flex-grow-1 d-flex flex-column min-vh-100"
      style="margin-left: 250px;"
    >
      <!-- Navbar fijo arriba -->
      <Navbar @toggle-sidebar="toggleSidebar" />

      <!-- Contenido de la página -->
      <main class="flex-grow-1 p-3" style="margin-top: 60px;">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'

const hiddenSidebarOnMobile = ref(false)

const toggleSidebar = () => {
  hiddenSidebarOnMobile.value = !hiddenSidebarOnMobile.value
}
</script>

<style scoped>
@media (max-width: 767px) {
  .d-none {
    display: none !important;
  }
}

main {
  overflow-x: hidden;
}
</style>

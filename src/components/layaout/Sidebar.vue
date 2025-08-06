<template>
  <div>
    <!-- Botón solo visible en móvil -->
    <button
      class="btn btn-light d-md-none m-3"
      @click="mostrarSidebar = !mostrarSidebar"
    >
      <i class="fas fa-bars"></i> Menú
    </button>

    <!-- Sidebar -->
    <div
      :class="[
        'sidebar',
        mostrarSidebar ? 'd-block' : 'd-none',
        'd-md-block'
      ]"
    >
      <h5 class="sidebar-title mb-4">
        <i class="fas fa-layer-group me-2"></i> TIENDA KHUYAY
      </h5>

      <ul class="nav flex-column gap-4">
        <li class="nav-item" v-for="item in menuItems" :key="item.name">
          <router-link class="nav-link d-flex align-items-center" :to="item.to">
            <i :class="item.icon + ' me-2'"></i>
            <span class="text-truncate">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mostrarSidebar = ref(false)

const menuItems = [
  { name: 'Compras', to: '/compras', icon: 'fas fa-shopping-cart' },
  { name: 'Productos', to: '/productos', icon: 'fas fa-box' },
  { name: 'Ventas', to: '/ventas', icon: 'fas fa-file-invoice-dollar' },
  { name: 'Reportes', to: '/reportes', icon: 'fas fa-chart-line' },
  { name: 'Clientes', to: '/clientes', icon: 'fas fa-users' },
  { name: 'Configuraciones', to: '/configuraciones', icon: 'fas fa-cogs' } // NUEVO
]

</script>

<style scoped>    
.sidebar {
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #6f42c1, #d63384); /* Morado → Rosado */
  color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  padding: 2rem 1.25rem;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #ffffff;
}

.nav-link {
  color: #ffffffcc;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.55rem 0.75rem;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.router-link-exact-active {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  font-weight: bold;
}
</style>

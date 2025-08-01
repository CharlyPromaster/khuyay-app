<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Ventas</h2>

    <button
      @click="mostrarFormulario = true"
      class="btn btn-outline-pink mb-4"
    >
      <i class="fas fa-cash-register me-2"></i> Nueva Venta
    </button>

    <VentaForm v-if="mostrarFormulario" @cerrar="mostrarFormulario = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VentaForm from '../components/VentaForm.vue';

const mostrarFormulario = ref(false)
</script>

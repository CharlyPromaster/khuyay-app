<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl relative">
      <h2 class="text-xl font-bold mb-4 text-purple-700">Detalle de Compra</h2>

      <div v-if="cargando" class="text-gray-500">Cargando detalles...</div>
      <div v-else-if="detalles.length === 0" class="text-gray-500">
        No hay detalles para mostrar.
      </div>
      <div v-else>
        <table class="w-full border text-sm text-left text-gray-700">
          <thead class="bg-purple-100 text-purple-800 uppercase">
            <tr>
              <th class="p-2 border">Producto</th>
              <th class="p-2 border">Cantidad</th>
              <th class="p-2 border">Precio Unitario</th>
              <th class="p-2 border">Total</th>
              <th class="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="detalle in detalles" :key="detalle.id">
              <td class="p-2 border">
                {{ detalle.productos?.nombre || "Sin nombre" }}
              </td>
              <td class="p-2 border">{{ detalle.cantidad }}</td>
              <td class="p-2 border">S/ {{ detalle.precio_compra.toFixed(2) }}</td>
              <td class="p-2 border">S/ {{ (detalle.cantidad * detalle.precio_compra).toFixed(2) }}</td>
              <td class="p-2 border text-center">
                <button
                  @click="$emit('editar', detalle)"
                  class="text-purple-600 hover:text-purple-800 transition-colors"
                  title="Editar"
                >
                  <i class="fas fa-pen"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        @click="$emit('cerrar')"
        class="absolute top-2 right-2 text-gray-400 hover:text-black text-xl"
        title="Cerrar"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { supabase } from "../supabase";

const props = defineProps({
  compraId: {
    type: String,
    required: true,
  },
});

const detalles = ref([]);
const cargando = ref(true);

watch(
  () => props.compraId,
  async (nuevoId) => {
    if (!nuevoId) return;
    cargando.value = true;

    const { data, error } = await supabase
      .from("detalle_compras")
      .select(`
        id,
        cantidad,
        precio_compra,
        producto_id,
        productos (nombre)
      `)
      .eq("compra_id", nuevoId);

    if (error) {
      console.error("Error al obtener detalles:", error);
      detalles.value = [];
    } else {
      detalles.value = data;
    }

    cargando.value = false;
  },
  { immediate: true }
);
</script>

<style scoped>
/* Asegúrate de que FontAwesome esté cargado en tu index.html o main.js */
</style>

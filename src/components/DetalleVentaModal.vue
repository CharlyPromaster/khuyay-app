<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">
      <button class="absolute top-3 right-4 text-gray-500 hover:text-red-500" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>

      <h3 class="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
        <i class="fas fa-receipt text-pink-500"></i> Detalle de Venta
      </h3>

      <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div><strong>Fecha:</strong> {{ venta.fecha }}</div>
        <div><strong>Método de pago:</strong> {{ venta.metodo_pago }}</div>
        <div v-if="venta.nombre_cliente"><strong>Cliente:</strong> {{ venta.nombre_cliente }}</div>
        <div><strong>Total:</strong> S/ {{ venta.total?.toFixed(2) }}</div>
      </div>

      <h4 class="font-semibold text-pink-700 mb-2">Productos</h4>
      <table class="w-full text-sm border border-gray-200 rounded overflow-hidden">
        <thead class="bg-gray-100 text-gray-700">
          <tr>
            <th class="px-3 py-2 text-left">Producto</th>
            <th class="px-3 py-2 text-center">Cantidad</th>
            <th class="px-3 py-2 text-right">Precio</th>
            <th class="px-3 py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in productos" :key="item.id" class="border-t">
            <td class="px-3 py-2">{{ item.productos?.nombre || '—' }}</td>
            <td class="px-3 py-2 text-center">{{ item.cantidad }}</td>
            <td class="px-3 py-2 text-right">S/ {{ item.precio_venta.toFixed(2) }}</td>
            <td class="px-3 py-2 text-right">S/ {{ (item.cantidad * item.precio_venta).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({
  venta: Object
})

const productos = ref([])

watch(() => props.venta, async (nuevaVenta) => {
  if (!nuevaVenta?.id) return

  const { data, error } = await supabase
    .from("detalle_ventas")
    .select("id, producto_id, cantidad, precio_venta, productos(nombre)")
    .eq("venta_id", nuevaVenta.id)

  if (error) {
    console.error("Error al cargar productos de la venta:", error)
  } else {
    productos.value = data
  }
}, { immediate: true })
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
    <h2 class="text-2xl font-bold mb-6 text-purple-700 flex items-center gap-2">
      <i class="fa-solid fa-pencil text-pink-500"></i> Editar Detalle De Compra
    </h2>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Producto</label>
        <input
          type="text"
          :value="props.detalle.nombre || props.detalle.productos?.nombre || '---'"
          disabled
          class="w-full border rounded p-2 bg-gray-100"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Cantidad</label>
        <input
          type="number"
          v-model.number="nuevaCantidad"
          class="w-full border rounded p-2"
          min="1"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Precio Compra</label>
        <input
          type="number"
          v-model.number="nuevoPrecio"
          class="w-full border rounded p-2"
          step="0.01"
          min="0"
        />
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button
          @click="cancelar"
          class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          @click="guardar"
          class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({
  show: Boolean,
  detalle: Object,
})

const emit = defineEmits(['close', 'actualizado'])

const nuevaCantidad = ref(0)
const nuevoPrecio = ref(0)

watch(
  () => props.detalle,
  (val) => {
    if (val) {
      nuevaCantidad.value = val.cantidad || 1
      nuevoPrecio.value = val.precio_compra || 0
    }
  },
  { immediate: true }
)

const cancelar = () => {
  emit('close')
}

const recalcularTotalCompra = async (compraId) => {
  const { data: detalles, error } = await supabase
    .from('detalle_compras')
    .select('cantidad, precio_compra')
    .eq('compra_id', compraId)

  if (error) {
    console.error('Error al obtener detalles:', error)
    return
  }

  const total = detalles.reduce((acc, item) => acc + item.cantidad * item.precio_compra, 0)

  const { error: updateError } = await supabase
    .from('compras')
    .update({ total })
    .eq('id', compraId)

  if (updateError) {
    console.error('Error al actualizar total:', updateError)
  }
}

const guardar = async () => {
  const cantidadAnterior = props.detalle.cantidad
  const cantidadNueva = nuevaCantidad.value
  const diferencia = cantidadNueva - cantidadAnterior

  // Actualizar detalle_compra
  const { error: errorDetalle } = await supabase
    .from('detalle_compras')
    .update({
      cantidad: cantidadNueva,
      precio_compra: nuevoPrecio.value,
    })
    .eq('id', props.detalle.id)

  if (errorDetalle) {
    alert('Error al actualizar el detalle: ' + errorDetalle.message)
    return
  }

  // Ajustar stock del producto
  const { error: errorStock } = await supabase.rpc('ajustar_stock_producto', {
    p_id: props.detalle.producto_id,
    p_diferencia: diferencia,
  })

  if (errorStock) {
    alert('Error al actualizar el stock: ' + errorStock.message)
    return
  }

  // 🔁 Recalcular total de la compra
  await recalcularTotalCompra(props.detalle.compra_id)

  emit('actualizado')
  emit('close')
}

</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-purple-700">
      <i class="fas fa-users mr-2 text-pink-500"></i> Clientes
    </h1>

    <table class="min-w-full bg-white rounded shadow">
      <thead>
        <tr class="bg-pink-100 text-pink-800 text-left">
          <th class="p-2">Nombre</th>
          <th class="p-2">Teléfono</th>
          <th class="p-2">DNI</th>
          <th class="p-2">Deuda</th>
          <th class="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="cliente in clientesConDeuda"
          :key="cliente.id"
          class="border-t"
        >
          <td class="p-2">{{ cliente.nombre }}</td>
          <td class="p-2">{{ cliente.telefono }}</td>
          <td class="p-2">{{ cliente.dni }}</td>
          <td class="p-2">
            <span v-if="cliente.deuda > 0" class="text-red-600 font-semibold">
              S/ {{ cliente.deuda.toFixed(2) }}
            </span>
            <span v-else class="text-green-600 font-semibold">Al día</span>
          </td>
          <td class="p-2">
            <button
              @click="verHistorial(cliente)"
              class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded shadow text-sm"
            >
              <i class="fas fa-file-invoice mr-1"></i> Historial
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Historial -->
    <div
      v-if="clienteSeleccionado"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 class="text-xl font-bold mb-4 text-purple-700">
          <i class="fas fa-clock mr-2 text-pink-500"></i>
          Historial de {{ clienteSeleccionado.nombre }}
        </h2>

        <table class="w-full mb-4">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="p-2">Fecha</th>
              <th class="p-2">Total</th>
              <th class="p-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="venta in historialCliente" :key="venta.id">
              <td class="p-2">{{ formatearFecha(venta.fecha) }}</td>
              <td class="p-2">S/ {{ venta.total.toFixed(2) }}</td>
              <td class="p-2">
                <span
                  :class="venta.estado === 'pagado'
                    ? 'text-green-600 font-semibold'
                    : 'text-red-600 font-semibold'"
                >
                  {{ venta.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="text-right">
          <button
            @click="clienteSeleccionado = null"
            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const clientes = ref([])
const clientesConDeuda = ref([])
const clienteSeleccionado = ref(null)
const historialCliente = ref([])

const formatearFecha = (fecha) => {
  const f = new Date(fecha)
  return f.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(async () => {
  const { data: listaClientes, error } = await supabase.from('clientes').select('*')
  if (error) {
    console.error('Error cargando clientes', error)
    return
  }

  const clientesTemp = []

  for (const cliente of listaClientes) {
const { data: ventasFiadas } = await supabase
  .from('ventas')
  .select('total')
  .eq('cliente_id', cliente.id)
  .eq('estado', 'pendiente')
  .eq('metodo_pago', 'fiado')


    const deudaTotal = ventasFiadas?.reduce((sum, v) => sum + v.total, 0) || 0

    clientesTemp.push({
      ...cliente,
      deuda: deudaTotal
    })
  }

  clientesConDeuda.value = clientesTemp
})

const verHistorial = async (cliente) => {
  clienteSeleccionado.value = cliente

  const { data: ventas } = await supabase
    .from('ventas')
    .select('id, fecha, total, estado')
    .eq('cliente_id', cliente.id)
    .order('fecha', { ascending: false })

  historialCliente.value = ventas
}
</script>

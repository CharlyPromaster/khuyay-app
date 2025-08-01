<template>
  <div class="px-4 py-6">
    <h2 class="text-2xl font-bold mb-6 text-purple-700 flex items-center gap-2">
      <i class="fas fa-file-invoice-dollar text-pink-500"></i>
      Historial de Ventas
    </h2>

    <div class="overflow-x-auto rounded-xl shadow border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-pink-100 text-pink-800">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Método Pago</th>
            <th class="px-4 py-3 text-right text-sm font-semibold">Total</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">Estado</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Método Pago Final</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-for="v in ventas" :key="v.id">
            <td class="px-4 py-3">{{ formatearFecha(v.fecha) }}</td>
            <td class="px-4 py-3">{{ v.nombre_cliente || "—" }}</td>
            <td class="px-4 py-3 capitalize">
              <span
                :class="v.metodo_pago === 'fiado' ? 'text-red-600 font-semibold' : ''"
              >
                {{ v.metodo_pago }}
              </span>
            </td>
            <td class="px-4 py-3 text-right font-semibold">
              S/ {{ v.total.toFixed(2) }}
            </td>
            <td class="px-4 py-3 text-center">
              <span
                :class="v.estado === 'pagado'
                  ? 'text-green-600 font-bold'
                  : 'text-red-600 font-bold'"
              >
                {{ v.estado || "—" }}
              </span>
            </td>
                          <!-- ✅ MÉTODO PAGO FINAL -->
  <td class="px-4 py-2">
    <span v-if="v.metodo_pago === 'fiado' && v.estado === 'pagado'">
      {{ v.metodo_pago_final }}
    </span>
    <span v-else>—</span>
  </td>
            <td class="px-4 py-3 text-center">
              <button
                class="btn btn-sm btn-outline-purple mr-2"
                @click="verDetalle(v)"
              >
                <i class="fas fa-eye mr-1"></i> Ver
              </button>
<button
  v-if="v.metodo_pago === 'fiado' && v.estado === 'pendiente'"
  class="inline-flex items-center gap-2 px-3 py-1.5 rounded text-white bg-green-500 hover:bg-green-600 text-sm font-medium shadow"
  @click="marcarComoPagado(v)"
>
  <i class="fas fa-money-bill-wave text-white text-base"></i>
  <span>Marcar como pagado</span>
</button>

            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="ventas.length === 0" class="text-center text-gray-500 py-8">
        No hay ventas registradas.
      </div>
    </div>

    <DetalleVentaModal
      v-if="mostrarModal"
      :venta="ventaSeleccionada"
      @close="mostrarModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";
import DetalleVentaModal from "../components/DetalleVentaModal.vue";

const formatearFecha = (fecha) => {
  const f = new Date(fecha)
  return f.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const mostrarModal = ref(false);
const ventaSeleccionada = ref(null);

const verDetalle = (venta) => {
  ventaSeleccionada.value = venta;
  mostrarModal.value = true;
};
const ventas = ref([]);
// const mostrarModal = ref(false)
// const ventaSeleccionada = ref(null)

const cargarVentas = async () => {
  const { data, error } = await supabase.from("ventas").select(`
      id,
      fecha,
      metodo_pago,
      total,
      cliente_id,
      estado,
      metodo_pago_final,
      fecha_pago,
      clientes (
        nombre
      )
    `);

  if (error) {
    console.error("Error al cargar ventas:", error);
  } else {
    ventas.value = data.map((v) => ({
      ...v,
      nombre_cliente: v.clientes?.nombre || null,
    }));
  }
};

onMounted(cargarVentas);

const marcarComoPagado = async (venta) => {
  const metodo = prompt("¿Con qué método pagó? (efectivo, yape, plin)")
    .toLowerCase()
    .trim();

  if (!["efectivo", "yape", "plin"].includes(metodo)) {
    alert("Método de pago inválido.");
    return;
  }

  const { error } = await supabase
    .from("ventas")
    .update({
      estado: "pagado",
      metodo_pago_final: metodo,
      fecha_pago: new Date().toISOString().split("T")[0],
    })
    .eq("id", venta.id);

  if (error) {
    console.error("Error al marcar como pagado:", error);
    alert("Hubo un error al actualizar el estado.");
  } else {
    alert("Venta marcada como pagada ✅");
    await cargarVentas();
  }
};
</script>

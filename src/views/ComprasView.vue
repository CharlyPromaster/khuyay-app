<template>
  <div class="px-4 py-6 p-6">
    <h2 class="text-2xl font-bold mb-6 text-purple-700 flex items-center gap-2">
      <i class="fas fa-wallet text-pink-500"></i> Compras
    </h2>

    <button
      class="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition mb-4"
      @click="mostrarFormulario = !mostrarFormulario"
    >
      <i class="fas fa-plus mr-2"></i> Nueva Compra
    </button>

    <CompraForm v-if="mostrarFormulario" @guardado="obtenerCompras" />

    <div class="overflow-x-auto">
      <table class="min-w-full bg-white rounded-lg shadow-md">
        <thead class="bg-purple-100 text-purple-900">
          <tr>
            <th class="py-2 px-4 text-left">Fecha</th>
            <th class="py-2 px-4 text-left">Proveedor</th>
            <th class="py-2 px-4 text-left">Productos</th>
            <th class="py-2 px-4 text-left">Total (S/)</th>
            <th class="py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="compra in compras"
            :key="compra.id"
            class="border-t hover:bg-purple-50 transition"
          >
            <td class="py-2 px-4">{{ compra.fecha_formateada }}</td>
            <td class="py-2 px-4">{{ compra.nombre_proveedor }}</td>
            <td class="py-2 px-4">{{ compra.productos }}</td>
            <td class="py-2 px-4">S/ {{ compra.total.toFixed(2) }}</td>
            <td class="py-2 px-4">
              <button
                @click="verDetalles(compra)"
                class="text-sm text-purple-700 font-medium hover:text-purple-900 transition"
              >
                Ver detalles
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de detalles -->
    <DetalleCompraModal
      v-if="mostrarModal"
      :compraId="compraSeleccionada.id"
      @cerrar="mostrarModal = false"
      @editar="abrirEditarModal"
    />

    <!-- Modal de edición -->
    <EditarDetalleCompraModal
      v-if="mostrarEditarModal"
      :show="mostrarEditarModal"
      :detalle="detalleSeleccionado"
      @close="mostrarEditarModal = false"
      @guardado="alGuardarEdicion"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";
import CompraForm from "../components/CompraForm.vue";
import DetalleCompraModal from "../components/DetalleCompraModal.vue";
import EditarDetalleCompraModal from "../components/EditarDetalleCompraModal.vue";

const mostrarFormulario = ref(false);
const compras = ref([]);

const obtenerCompras = async () => {
  const { data, error } = await supabase
    .from("compras")
    .select(
      `
      id,
      fecha,
      total,
      proveedor_id,
      proveedores(nombre),
      detalle_compras(talla, color, productos(nombre))
    `
    )
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error al obtener compras:", error);
    return;
  }

  compras.value = data.map((compra) => ({
    id: compra.id,
    fecha_formateada: compra.fecha.split("T")[0],

    total: compra.total,
    nombre_proveedor: compra.proveedores?.nombre || "Desconocido",
    productos: compra.detalle_compras
      .map((dc) => {
        const nombre = dc.productos?.nombre || "¿?";
        const talla = dc.talla ? ` - Talla ${dc.talla}` : "";
        const color = dc.color ? ` - Color ${dc.color}` : "";
        const precio = dc.precio_compra ? ` - S/ ${dc.precio_compra}` : "";
        return `${nombre}${talla}${color}${precio}`;
      })
      .join(", "),
  }));

  mostrarFormulario.value = false;
};

const compraSeleccionada = ref(null);
const mostrarModal = ref(false);

const verDetalles = (compra) => {
  compraSeleccionada.value = compra;
  mostrarModal.value = true;
};

// 🔧 Editar detalle de compra
const mostrarEditarModal = ref(false);
const detalleSeleccionado = ref(null);

const abrirEditarModal = (detalle) => {
  console.log("Detalle a editar:", detalle); // 👈
  detalleSeleccionado.value = detalle;
  mostrarEditarModal.value = true;
};

// 🔄 Recargar detalles después de editar
const alGuardarEdicion = () => {
  mostrarEditarModal.value = false;
  // Opcionalmente puedes volver a abrir el modal de detalle
  // mostrarModal.value = true
};
onMounted(() => {
  obtenerCompras();
});
</script>

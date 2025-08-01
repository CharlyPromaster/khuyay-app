<template>
  <div class="px-6 py-6">
    <h2 class="text-3xl font-bold text-purple-700 flex items-center gap-2 mb-6">
      <i class="fas fa-wallet text-pink-500"></i> Registro de Gastos
    </h2>

    <!-- Botón para nuevo gasto -->
    <button
      class="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5 px-5 rounded-2xl shadow-md flex items-center gap-2 transition duration-200 active:scale-95 mb-6"
      @click="nuevoGasto"
    >
      <i class="fas fa-plus-circle text-white"></i> Nuevo Gasto
    </button>

    <!-- Modal para registrar o editar gasto -->
    <GastoForm
      v-if="mostrarFormulario"
      :gasto="gastoSeleccionado"
      @cerrar="cerrarFormulario"
      @guardado="recargarGastos"
    />

    <!-- Historial de gastos -->
    <div class="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
        <thead class="bg-pink-100 text-pink-800 uppercase text-xs font-bold">
          <tr>
            <th class="px-4 py-3 text-left">Fecha</th>
            <th class="px-4 py-3 text-left">Descripción</th>
            <th class="px-4 py-3 text-left">Monto (S/)</th>
            <th class="px-4 py-3 text-left">Categoría</th>
            <th class="px-4 py-3 text-left">Tipo</th>
            <th class="px-4 py-3 text-left">Observaciones</th>
            <th class="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="gasto in gastos" :key="gasto.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">{{ formatoFecha(gasto.fecha) }}</td>
            <td class="px-4 py-3">{{ gasto.descripcion }}</td>
            <td class="px-4 py-3">S/ {{ gasto.monto.toFixed(2) }}</td>
            <td class="px-4 py-3">{{ gasto.categoria || "-" }}</td>
            <td class="px-4 py-3 capitalize">{{ gasto.tipo }}</td>
            <td class="px-4 py-3">{{ gasto.observaciones || "-" }}</td>
            <td class="px-4 py-3 flex gap-2">
              <button
                class="text-purple-600 hover:text-purple-800"
                @click="editarGasto(gasto)"
                title="Editar"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="text-red-600 hover:text-red-800"
                @click="eliminarGasto(gasto.id)"
                title="Eliminar"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-gray-100 text-gray-800 font-semibold">
            <td colspan="2" class="px-4 py-3 text-right">Total</td>
            <td class="px-4 py-3">S/ {{ totalGastos.toFixed(2) }}</td>
            <td colspan="4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "../supabase";
import GastoForm from "../components/GastoForm.vue";

// Estados
const mostrarFormulario = ref(false);
const gastoSeleccionado = ref(null);
const gastos = ref([]);

// Función para obtener todos los gastos
const cargarGastos = async () => {
  const { data, error } = await supabase
    .from("gastos")
    .select("*")
    .order("fecha", { ascending: false });

  if (!error) gastos.value = data;
};

// Mostrar modal para nuevo gasto
const nuevoGasto = () => {
  gastoSeleccionado.value = null;
  mostrarFormulario.value = true;
};

// Mostrar modal para editar gasto
const editarGasto = (gasto) => {
  gastoSeleccionado.value = { ...gasto }; // Clonamos para evitar mutación directa
  mostrarFormulario.value = true;
};

// Cerrar modal
const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  gastoSeleccionado.value = null;
};

// Eliminar gasto
const eliminarGasto = async (id) => {
  const confirmado = confirm("¿Estás seguro de eliminar este gasto?");
  if (!confirmado) return;

  const { error } = await supabase.from("gastos").delete().eq("id", id);
  if (!error) await cargarGastos();
};

// Cargar en el inicio
onMounted(cargarGastos);

// Recargar luego de guardar
const recargarGastos = async () => {
  cerrarFormulario();
  await cargarGastos();
};

// Formatear fecha
const formatoFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Calcular total
const totalGastos = computed(() =>
  gastos.value.reduce((acc, g) => acc + (g.monto || 0), 0)
);
</script>

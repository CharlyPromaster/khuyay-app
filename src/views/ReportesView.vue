<template>
  <div class="px-6 py-6">
    <h2 class="text-3xl font-bold text-purple-700 flex items-center gap-2 mb-6">
      <i class="fas fa-chart-bar text-pink-500"></i> Reporte Mensual
    </h2>

    <!-- Selector de mes y año -->
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <select v-model="mes" class="rounded-xl border px-4 py-2 shadow">
        <option v-for="(m, i) in meses" :key="i" :value="i + 1">
          {{ m }}
        </option>
      </select>

      <select v-model="anio" class="rounded-xl border px-4 py-2 shadow">
        <option v-for="y in años" :key="y" :value="y">{{ y }}</option>
      </select>

      <button
        @click="cargarDatos"
        class="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5 px-5 rounded-2xl shadow-md transition duration-200 active:scale-95"
      >
        Ver Reporte
      </button>

      <!-- Botón Exportar PDF -->
      <button
        @click="exportarPDF"
        class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-5 rounded-2xl shadow-md transition duration-200 active:scale-95"
      >
        <i class="fas fa-file-pdf me-2"></i> Exportar PDF
      </button>
    </div>

    <!-- CONTENIDO EXPORTABLE -->
    <div id="reporte-pdf">
      <!-- Gráfico -->
      <div class="bg-white rounded-xl shadow border p-4 mb-6">
        <BarChart :labels="['Ventas', 'Compras', 'Gastos']" :data="graficoData" />
      </div>

      <!-- Resumen -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div class="bg-purple-100 text-purple-800 rounded-xl p-4 shadow font-semibold">
          <p class="text-sm">Ventas</p>
          <p class="text-xl">S/ {{ resumen.ventas.toFixed(2) }}</p>
        </div>
        <div class="bg-pink-100 text-pink-800 rounded-xl p-4 shadow font-semibold">
          <p class="text-sm">Compras</p>
          <p class="text-xl">S/ {{ resumen.compras.toFixed(2) }}</p>
        </div>
        <div class="bg-yellow-100 text-yellow-800 rounded-xl p-4 shadow font-semibold">
          <p class="text-sm">Gastos</p>
          <p class="text-xl">S/ {{ resumen.gastos.toFixed(2) }}</p>
        </div>
        <div class="bg-green-100 text-green-800 rounded-xl p-4 shadow font-semibold">
          <p class="text-sm">Utilidad</p>
          <p class="text-xl">S/ {{ utilidad.toFixed(2) }}</p>
        </div>
      </div>
    </div>
        <!-- Mensaje extra -->
    <div v-if="utilidad < 0" class="text-red-700 bg-red-100 border border-red-300 rounded-xl p-4 text-sm">
      🔴 Este mes estás en pérdida: <strong>S/ {{ utilidad.toFixed(2) }}</strong><br />
      🟢 Debes vender al menos <strong>S/ {{ montoRecuperacion.toFixed(2) }}</strong> para empezar a generar utilidad.
    </div>

    <div v-else class="text-green-700 bg-green-100 border border-green-300 rounded-xl p-4 text-sm">
      🟢 ¡Este mes estás generando utilidad! Sigue así 💪
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { supabase } from "../supabase";
import html2pdf from "html2pdf.js";
import BarChart from "../components/BarChart.vue";

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"
];
const años = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

const mes = ref(new Date().getMonth() + 1);
const anio = ref(new Date().getFullYear());

const resumen = ref({
  ventas: 0,
  compras: 0,
  gastos: 0,
});

const graficoData = computed(() => [
  resumen.value.ventas,
  resumen.value.compras,
  resumen.value.gastos,
]);

const utilidad = computed(() => {
  return resumen.value.ventas - resumen.value.compras - resumen.value.gastos;
});
const montoRecuperacion = computed(() => resumen.value.compras + resumen.value.gastos);

const cargarDatos = async () => {
  const inicio = `${anio.value}-${String(mes.value).padStart(2, "0")}-01`;
  const fin = new Date(anio.value, mes.value, 0).toISOString().split("T")[0];

  const [v, c, g] = await Promise.all([
    supabase
      .from("ventas")
      .select("total")
      .gte("fecha", inicio)
      .lte("fecha", fin),
    supabase
      .from("compras")
      .select("total")
      .gte("fecha", inicio)
      .lte("fecha", fin),
    supabase
      .from("gastos")
      .select("monto")
      .gte("fecha", inicio)
      .lte("fecha", fin),
  ]);

  resumen.value.ventas = v.data?.reduce((sum, item) => sum + item.total, 0) || 0;
  resumen.value.compras = c.data?.reduce((sum, item) => sum + item.total, 0) || 0;
  resumen.value.gastos = g.data?.reduce((sum, item) => sum + item.monto, 0) || 0;
};

const exportarPDF = () => {
  const elemento = document.getElementById("reporte-pdf");
  const opciones = {
    margin: 0.5,
    filename: `reporte-${anio.value}-${mes.value}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  html2pdf().set(opciones).from(elemento).save();
};

cargarDatos();
</script>

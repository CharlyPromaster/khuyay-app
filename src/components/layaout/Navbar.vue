<template>
  <nav
    class="navbar position-fixed top-0 start-0 end-0 bg-white shadow-sm py-2"
    style="height: 60px; z-index: 1040"
  >
    <div class="container-fluid d-flex align-items-center justify-content-between">
      <!-- IZQUIERDA -->
      <div class="d-flex align-items-center gap-2">
        <button
          class="btn btn-outline-secondary d-md-none btn-sm"
          @click="$emit('toggle-sidebar')"
        >
          <i class="fas fa-bars"></i>
        </button>
        <router-link to="/" class="navbar-brand fs-4 m-0">
          <span class="text-purple">KHUYAY</span>
          <span class="text-pink ms-1">DASH</span>
        </router-link>
      </div>

      <!-- CENTRO -->
      <div class="flex-grow-1 mx-3 position-relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Buscar productos o clientes..."
          class="form-control custom-search"
        />
        <!-- AUTOCOMPLETE -->
        <ul
          v-if="searchResults.length"
          class="list-group position-absolute mt-1 w-100 z-50 shadow"
          style="max-height: 250px; overflow-y: auto;"
        >
          <li
            v-for="item in searchResults"
            :key="item.tipo + '-' + item.id"
            class="list-group-item list-group-item-action d-flex justify-content-between"
            @click="seleccionarResultado(item)"
            style="cursor: pointer"
          >
            {{ item.nombre }}
            <span class="badge bg-secondary text-uppercase">{{ item.tipo }}</span>
          </li>
        </ul>
      </div>

      <!-- DERECHA -->
      <div class="d-flex align-items-center gap-2">
        <button
          class="btn btn-sm btn-outline-purple"
          @click="mostrarProveedores = true"
        >
          <i class="fas fa-box-open me-1"></i> Proveedores
        </button>

        <router-link
          to="/venta"
          class="btn btn-sm btn-outline-pink inline-flex items-center"
        >
          <i class="fas fa-cash-register me-1"></i> Venta
        </router-link>

        <router-link to="/gasto" class="btn btn-sm btn-outline-dark">
          <i class="fas fa-money-bill me-1"></i> Gasto
        </router-link>

        <span class="d-none d-md-inline ms-2">
          <i class="fas fa-clock"></i> {{ horaActual }}
        </span>
      </div>
    </div>
  </nav>

  <!-- MODALES -->
  <ProveedoresModal
    :visible="mostrarProveedores"
    @close="mostrarProveedores = false"
  />
  <InfoRelacionadaModal
    :visible="modalInfo.visible"
    :info="modalInfo"
    @close="modalInfo.visible = false"
  />
</template>

<script setup>
defineEmits(['toggleSidebar'])
import { ref, onMounted, onUnmounted, watch } from "vue";
import { supabase } from "../../supabase";
import ProveedoresModal from "../ProveedoresModal.vue";
import InfoRelacionadaModal from "../InfoRelacionadaModal.vue";
import { useRoute } from "vue-router";

const route = useRoute();

const mostrarProveedores = ref(false);
const searchQuery = ref("");
const searchResults = ref([]); // ✅ Solución principal
const modalInfo = ref({
  visible: false,
  tipo: "",
  producto: null,
  cliente: null,
  ventas: [],
  compras: [],
  variantes: []
});

watch(route, () => {
  mostrarProveedores.value = false;
});

// ✅ AUTOCOMPLETE GLOBAL
watch(searchQuery, async (query) => {
  if (query.length < 2) {
    searchResults.value = [];
    return;
  }

  const { data: productos } = await supabase
    .from("productos")
    .select("id, nombre")
    .ilike("nombre", `%${query}%`)
    .limit(5);

  const { data: clientes } = await supabase
    .from("ventas")
    .select("id, nombre_cliente")
    .ilike("nombre_cliente", `%${query}%`)
    .limit(5);

  searchResults.value = [
    ...(productos?.map((p) => ({
      tipo: "producto",
      id: p.id,
      nombre: p.nombre
    })) || []),
    ...(clientes?.map((c) => ({
      tipo: "cliente",
      id: c.id,
      nombre: c.nombre_cliente
    })) || [])
  ];
});

// ✅ Al seleccionar un item de los resultados
function seleccionarResultado(item) {
  buscarInfoRelacionada(item);
  searchQuery.value = "";
  searchResults.value = [];
}

// ✅ Lógica del modal informativo
async function buscarInfoRelacionada(result) {
  modalInfo.value.visible = true;
  modalInfo.value.tipo = result.tipo;

  if (result.tipo === "producto") {
    const { data: producto } = await supabase
      .from("productos")
      .select("*")
      .eq("id", result.id)
      .single();

    const { data: variantes } = await supabase
      .from("variantes_producto")
      .select("*")
      .eq("producto_id", result.id);

    const { data: detalleVentas } = await supabase
      .from("detalles_venta")
      .select("*, ventas(nombre_cliente, fecha, total)")
      .eq("producto_id", result.id);

    const { data: detalleCompras } = await supabase
      .from("detalle_compras")
      .select("*, compras(fecha, total)")
      .eq("producto_id", result.id);

    modalInfo.value = {
      visible: true,
      tipo: "producto",
      producto,
      variantes,
      ventas: detalleVentas?.map((v) => ({
        id: v.id,
        nombre_cliente: v.ventas?.nombre_cliente || "Sin nombre",
        fecha: v.ventas?.fecha || "Sin fecha",
        cantidad: v.cantidad,
        total: v.precio_venta * v.cantidad
      })) || [],
      compras: detalleCompras?.map((c) => ({
        id: c.id,
        fecha: c.compras?.fecha || "Sin fecha",
        cantidad: c.cantidad,
        total: c.precio_compra * c.cantidad
      })) || []
    };
  }

  if (result.tipo === "cliente") {
    const { data: ventas } = await supabase
      .from("ventas")
      .select("*")
      .ilike("nombre_cliente", `%${result.nombre}%`);

    modalInfo.value = {
      visible: true,
      tipo: "cliente",
      cliente: ventas?.[0],
      ventas: ventas || []
    };
  }
}

// ✅ Hora actual
const horaActual = ref("");
function actualizarHora() {
  const ahora = new Date();
  const opciones = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
  const fecha = ahora.toLocaleDateString();
  const hora = ahora.toLocaleTimeString([], opciones);
  horaActual.value = `${fecha} - ${hora}`;
}
let intervalo;

onMounted(() => {
  actualizarHora();
  intervalo = setInterval(actualizarHora, 1000);
});

onUnmounted(() => {
  clearInterval(intervalo);
});
</script>


<style scoped>
.navbar-inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding-left: 15rem !important;
}

/* Estilo del buscador */
.custom-search {
  border-radius: 6px;
  border: 1px solid #ddd;
  padding: 0.375rem 0.75rem;
  font-size: 0.9rem;
  height: 38px;
  width: 100%;
  max-width: 400px;
}

/* Logo con color */
.text-purple {
  color: #6f42c1;
  font-weight: bold;
}
.text-pink {
  color: #e83e8c;
  font-weight: bold;
}

/* Botones de acción con outline colorido */
.btn-outline-purple {
  border: 1px solid #6f42c1;
  color: #6f42c1;
  transition: 0.2s;
}
.btn-outline-purple:hover {
  background-color: #6f42c1;
  color: #fff;
}

.btn-outline-pink {
  border: 1px solid #e83e8c;
  color: #e83e8c;
  transition: 0.2s;
}
.btn-outline-pink:hover {
  background-color: #e83e8c;
  color: #fff;
}

.btn-outline-dark {
  border: 1px solid #343a40;
  color: #343a40;
  transition: 0.2s;
}
.btn-outline-dark:hover {
  background-color: #343a40;
  color: #fff;
}
.hora-actual {
  font-size: 1rem;
  font-weight: 500;
  color: #4b4b4b;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  background-color: #f5f3ff;
  border: 1px solid #e0d7ff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.hora-actual i {
  color: #a16eff;
  font-size: 1.1rem;
}

.hora-actual:hover {
  background-color: #ede4ff;
  border-color: #c5aaff;
  color: #333;
}

/* Responsive */
@media (max-width: 767px) {
  .navbar-inner {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .custom-search {
    order: 3;
    width: 100%;
    max-width: 100%;
    margin-top: 0.5rem;
  }
}
</style>

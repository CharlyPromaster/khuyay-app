<template>
  <div class="px-6 py-8">
    <h2 class="text-3xl font-bold mb-6">Productos</h2>

    <!-- Filtros -->
    <div class="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar producto..."
        class="border rounded px-4 py-2 w-full md:w-1/3"
      />

      <select
        v-model="categoriaSeleccionada"
        class="border rounded px-4 py-2 w-full md:w-1/3"
      >
        <option value="">Todas las categorías</option>
        <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
          {{ cat.nombre }}
        </option>
      </select>
    </div>

    <!-- Tabla de productos -->
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm border rounded shadow bg-white">
        <thead class="bg-purple-100 text-left">
          <tr>
            <th class="p-3">Nombre</th>
            <th class="p-3">Precio Venta</th>
            <th class="p-3">Precio Compra</th>
            <th class="p-3">Stock</th>
            <th class="p-3">Categoría</th>
            <th class="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="prod in productosFiltrados"
            :key="prod.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="p-3">{{ prod.nombre }}</td>
            <td class="p-3">S/ {{ prod.precio_venta }}</td>
            <td class="p-3">S/ {{ prod.precio_compra }}</td>
            <td class="p-3">{{ prod.stock }}</td>
            <td class="p-3">{{ nombreCategoria(prod.categoria_id) }}</td>
            <td class="p-3">
              <button
                @click="abrirModal(prod)"
                class="text-sm text-purple-600 hover:underline"
              >
                Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de edición -->
    <div
      v-if="modalVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Editar producto</h3>

        <form @submit.prevent="guardarCambios">
          <div class="mb-2">
            <label class="block text-sm font-medium">Nombre</label>
            <input
              v-model="productoSeleccionado.nombre"
              class="border rounded px-3 py-2 w-full"
            />
          </div>
          <div class="mb-2">
            <label class="block text-sm font-medium">Precio venta</label>
            <input
              type="number"
              step="0.01"
              v-model.number="productoSeleccionado.precio_venta"
              class="border rounded px-3 py-2 w-full"
            />
          </div>
          <div class="mb-2">
            <label class="block text-sm font-medium">Precio compra</label>
            <input
              type="number"
              step="0.01"
              v-model.number="productoSeleccionado.precio_compra"
              class="border rounded px-3 py-2 w-full"
            />
          </div>
          <div class="mb-2">
            <label class="block text-sm font-medium">Stock</label>
            <input
              type="number"
              v-model.number="productoSeleccionado.stock"
              class="border rounded px-3 py-2 w-full"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium">Categoría</label>
            <select
              v-model="productoSeleccionado.categoria_id"
              class="border rounded px-3 py-2 w-full"
            >
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                {{ cat.nombre }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="cerrarModal"
              class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "../supabase";

const productos = ref([]);
const categorias = ref([]);
const search = ref("");
const categoriaSeleccionada = ref("");
const modalVisible = ref(false);
const productoSeleccionado = ref(null);

onMounted(async () => {
  await cargarProductos();
  await cargarCategorias();
});

const cargarProductos = async () => {
  const { data, error } = await supabase.from("productos").select("*");
  if (!error) productos.value = data;
};

const cargarCategorias = async () => {
  const { data, error } = await supabase.from("categorias").select("*");
  if (!error) categorias.value = data;
};

const nombreCategoria = (id) => {
  const cat = categorias.value.find((c) => c.id === id);
  return cat ? cat.nombre : "—";
};

const productosFiltrados = computed(() => {
  return productos.value.filter((p) => {
    const porNombre = p.nombre
      .toLowerCase()
      .includes(search.value.toLowerCase());
    const porCategoria =
      !categoriaSeleccionada.value ||
      p.categoria_id == categoriaSeleccionada.value;
    return porNombre && porCategoria;
  });
});

const abrirModal = (producto) => {
  productoSeleccionado.value = { ...producto }; // clonar
  modalVisible.value = true;
};

const cerrarModal = () => {
  modalVisible.value = false;
  productoSeleccionado.value = null;
};

const guardarCambios = async () => {
  const { id, ...datos } = productoSeleccionado.value;

  const { error } = await supabase.from("productos").update(datos).eq("id", id);

  if (!error) {
    const index = productos.value.findIndex((p) => p.id === id);
    if (index !== -1) productos.value[index] = { id, ...datos };
    cerrarModal();
  } else {
    alert("Error al guardar");
  }
};
</script>

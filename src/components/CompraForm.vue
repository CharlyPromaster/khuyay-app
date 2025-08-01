<template>
  <div class="max-w-5xl mx-auto bg-white rounded-2xl p-6 shadow-md border border-purple-200">
    <h2 class="text-2xl font-bold text-purple-700 mb-4">Registrar Compra</h2>

    <!-- Fecha y proveedor -->
    <div class="grid md:grid-cols-2 gap-4 mb-6">
      <div>
        <label class="block text-sm font-semibold text-purple-700 mb-1">Fecha de compra</label>
        <input
          type="date"
          v-model="fecha"
          class="w-full rounded-xl border border-purple-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold text-purple-700 mb-1">Proveedor (opcional)</label>
        <select
          v-model="proveedor_id"
          class="w-full rounded-xl border border-purple-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-800"
        >
          <option value="">Sin proveedor / compra libre</option>
          <option v-for="p in proveedores" :key="p.id" :value="p.id">
            {{ p.nombre }}
          </option>
        </select>
      </div>
    </div>

    <!-- Selector de categoría padre (para filtrar subcategorías) -->
    <div>
      <label class="block text-sm font-semibold text-purple-700 mb-1">Categoría</label>
      <select
        v-model="categoriaPadreSeleccionada"
        class="w-full rounded-xl border border-purple-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-800"
      >
        <option disabled value="">Selecciona una categoría</option>
        <option
          v-for="cat in categorias.filter((c) => !c.parent_id)"
          :key="cat.id"
          :value="cat.id"
        >
          {{ cat.nombre }}
        </option>
      </select>
    </div>

    <!-- Tabla de productos -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-purple-700 mb-2">Productos comprados</h3>

      <div class="overflow-auto">
        <table class="min-w-full text-sm text-left text-gray-700">
          <thead class="text-xs uppercase bg-purple-100 text-purple-700">
            <tr>
              <th class="px-4 py-2">Nombre</th>
              <th class="px-4 py-2">Cantidad</th>
              <th class="px-4 py-2">Precio compra (S/)</th>
              <th class="px-4 py-2">Subcategoría</th>
              <th class="px-4 py-2 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(producto, index) in productosComprados"
              :key="index"
              class="bg-white border-b hover:bg-purple-50"
            >
              <td class="px-4 py-2">
                <input
                  v-model="producto.nombre"
                  type="text"
                  class="w-full rounded-md border border-purple-300 px-2 py-1 focus:outline-none"
                />
              </td>
              <td class="px-4 py-2">
                <input
                  v-model.number="producto.cantidad"
                  type="number"
                  min="1"
                  class="w-full rounded-md border border-purple-300 px-2 py-1 focus:outline-none"
                />
              </td>
              <td class="px-4 py-2">
                <input
                  v-model.number="producto.precio_compra"
                  type="number"
                  step="0.01"
                  class="w-full rounded-md border border-purple-300 px-2 py-1 focus:outline-none"
                />
              </td>
              <td class="px-4 py-2">
                <select
                  v-model="producto.categoria_id"
                  class="w-full rounded-md border border-purple-300 px-2 py-1 focus:outline-none bg-white"
                >
                  <option disabled value="">Subcategoría</option>
                  <option
                    v-for="sub in subcategoriasFiltradas"
                    :key="sub.id"
                    :value="sub.id"
                  >
                    {{ sub.nombre }}
                  </option>
                </select>
              </td>
              <td class="px-4 py-2 text-center">
                <button
                  @click="quitarProducto(index)"
                  class="bg-rose-500 hover:bg-rose-600 text-white rounded-lg px-3 py-1 text-sm"
                >
                  Quitar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        @click="agregarProducto"
        class="mt-4 bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-4 py-2 flex items-center"
      >
        <span class="mr-1 text-lg">+</span> Agregar producto
      </button>
    </div>

    <!-- Total y botón -->
    <div class="flex items-center justify-between mt-8 border-t pt-4">
      <div class="text-xl font-bold text-purple-700">
        Total: S/ {{ calcularTotal().toFixed(2) }}
      </div>
      <button
        @click="guardarCompra"
        class="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-3 rounded-2xl"
      >
        Guardar compra
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"; // ← faltaba computed
import { supabase } from "../supabase";

const emit = defineEmits(["guardado"]);

const fecha = ref(new Date().toLocaleDateString('fr-CA'));
const proveedor_id = ref("");
const productosComprados = ref([]);
const proveedores = ref([]);
const categorias = ref([]);
const categoriaPadreSeleccionada = ref("");
const fechaFormateada = new Date(fecha.value).toISOString().split("T")[0];


// Cargar proveedores y categorías
const cargarDatos = async () => {
  const { data: provs } = await supabase.from("proveedores").select("*");
  proveedores.value = provs || [];
};

const obtenerCategorias = async () => {
  const { data, error } = await supabase.from("categorias").select("*");
  if (error) {
    console.error("Error al cargar categorías:", error);
  } else {
    categorias.value = data;
  }
};

// Subcategorías filtradas según la categoría padre seleccionada
const subcategoriasFiltradas = computed(() =>
  categorias.value.filter(
    (cat) => cat.parent_id === categoriaPadreSeleccionada.value
  )
);

// Agregar o quitar productos
const agregarProducto = () => {
  productosComprados.value.push({
    nombre: "",
    cantidad: 1,
    precio_compra: 0,
    categoria_id: "",
  });
};
const quitarProducto = (index) => {
  productosComprados.value.splice(index, 1);
};

// Calcular total
const calcularTotal = () => {
  return productosComprados.value.reduce(
    (sum, item) => sum + item.cantidad * item.precio_compra,
    0
  );
};

// ✅ BIEN
const guardarCompra = async () => {
  const total = calcularTotal();
  const fechaFormateada = new Date(fecha.value).toISOString().split("T")[0];

  const { data: compra, error: errorCompra } = await supabase
    .from("compras")
    .insert([
      {
        fecha: fechaFormateada,
        proveedor_id: proveedor_id.value || null,
        total,
      },
    ])
    .select()
    .single();

  if (errorCompra) {
    console.error("Error al guardar compra:", errorCompra);
    alert("Error al guardar la compra");
    return;
  }

  const detalles = [];

  for (const item of productosComprados.value) {
    const nombre = item.nombre.trim();
    const cantidad = parseInt(item.cantidad);
    const precio = parseFloat(item.precio_compra);
    const categoria_id = item.categoria_id || null;

    if (!nombre || cantidad <= 0 || precio <= 0) continue;

    const { data: existente, error: errorExistente } = await supabase
      .from("productos")
      .select("*")
      .eq("nombre", nombre)
      .maybeSingle();

    let producto_id;

    if (existente) {
      producto_id = existente.id;
      const nuevoStock = (existente.stock || 0) + cantidad;

      const { error: errorUpdate } = await supabase
        .from("productos")
        .update({ stock: nuevoStock, precio_compra: precio })
        .eq("id", producto_id);

      if (errorUpdate) {
        console.error("Error al actualizar producto:", errorUpdate);
        alert("Error al actualizar un producto");
        return;
      }
    } else {
      const { data: nuevoProducto, error: errorNuevo } = await supabase
        .from("productos")
        .insert([
          {
            nombre,
            stock: cantidad,
            precio_compra: precio,
            precio_venta: 0,
            categoria_id,
            creado_en: new Date(),
          },
        ])
        .select()
        .single();

      if (errorNuevo) {
        console.error("Error al crear producto:", errorNuevo);
        alert("Error al insertar un producto");
        return;
      }

      producto_id = nuevoProducto.id;
    }

    detalles.push({
      compra_id: compra.id,
      producto_id,
      cantidad,
      precio_compra: precio,
      total: cantidad * precio,
    });
  }

  const { error: errorDetalle } = await supabase
    .from("detalle_compras")
    .insert(detalles);

  if (errorDetalle) {
    console.error("Error al insertar detalles:", errorDetalle);
    alert("Error al guardar detalles de la compra");
    return;
  }

  alert("Compra registrada con éxito ✅");
  emit("guardado");

  // Resetear
  fecha.value = new Date().toISOString().substring(0, 10);
  proveedor_id.value = "";
  productosComprados.value = [];
  agregarProducto();
};

// Lifecycle
onMounted(() => {
  cargarDatos();
  obtenerCategorias();
  agregarProducto();
});
</script>

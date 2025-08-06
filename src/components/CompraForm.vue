<template>
  <div
    class="max-w-5xl mx-auto bg-white rounded-2xl p-6 shadow-md border border-purple-200"
  >
    <h2 class="text-2xl font-bold text-purple-700 mb-4">Registrar Compra</h2>

    <!-- Fecha y proveedor -->
    <div class="grid md:grid-cols-2 gap-4 mb-6">
      <div>
        <label class="block text-sm font-semibold text-purple-700 mb-1"
          >Fecha de compra</label
        >
        <input
          type="date"
          v-model="fecha"
          class="w-full rounded-xl border border-purple-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold text-purple-700 mb-1"
          >Proveedor (opcional)</label
        >
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
      <label class="block text-sm font-semibold text-purple-700 mb-1"
        >Categoría</label
      >
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
    <!-- Productos con variantes -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-purple-700 mb-2">
        Productos comprados
      </h3>

      <div
        v-for="(producto, index) in productosComprados"
        :key="index"
        class="border border-purple-200 rounded-xl mb-4 p-4"
      >
        <!-- Nombre y categoría -->
        <div class="grid md:grid-cols-2 gap-4 mb-2">
          <input
            v-model="producto.nombre"
            placeholder="Nombre del producto"
            class="w-full rounded-md border border-purple-300 px-4 py-2 focus:outline-none"
          />

          <select
            v-model="producto.categoria_id"
            class="w-full rounded-md border border-purple-300 px-4 py-2 bg-white"
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
        </div>

        <!-- Variantes -->
        <!-- ¿Es con variante o no? -->
        <div class="mb-2">
          <label class="text-sm font-semibold">¿Tiene variantes?</label>
          <select
            v-model="producto.es_con_variante"
            class="border px-2 py-1 rounded w-full"
          >
            <option :value="false">Producto simple</option>
            <option :value="true">Producto con variantes</option>
          </select>
        </div>

        <!-- Mostrar formulario según el tipo -->
        <div v-if="producto.es_con_variante">
          <VariantesForm v-model="producto.variantes" />
        </div>

        <div v-else class="grid md:grid-cols-2 gap-4 mb-2">
          <input
            type="number"
            v-model="producto.cantidad"
            placeholder="Cantidad"
            class="w-full rounded-md border border-purple-300 px-4 py-2"
            min="1"
          />
          <input
            type="number"
            v-model="producto.precio"
            placeholder="Precio de compra"
            class="w-full rounded-md border border-purple-300 px-4 py-2"
            min="0.01"
            step="0.01"
          />
        </div>

        <div class="mt-2 text-right">
          <button
            @click="quitarProducto(index)"
            class="bg-rose-500 hover:bg-rose-600 text-white rounded-lg px-4 py-1 text-sm"
          >
            Quitar producto
          </button>
        </div>
      </div>

      <button
        @click="agregarProducto"
        class="mt-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-4 py-2 flex items-center"
      >
        <span class="mr-1 text-lg">+</span> Agregar producto
      </button>
    </div>

    <!-- Total y botón -->
    <div class="flex items-center justify-between mt-8 border-t pt-4">
      <div class="text-xl font-bold text-purple-700">
        Total: S/ {{ totalCalculado.toFixed(2) }}
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
import { ref, onMounted, computed, watch} from "vue"; // ← faltaba computed
import { supabase } from "../supabase";
import VariantesForm from "./VariantesForm.vue";

const emit = defineEmits(["guardado"]);

const fecha = ref(new Date().toLocaleDateString("fr-CA"));
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
    categoria_id: "",
    es_con_variante: false,
    cantidad: 1,
    precio: 0,
    variantes: [], // solo usado si es_con_variante = true
  });
};

const quitarProducto = (index) => {
  productosComprados.value.splice(index, 1);
};

// Calcular total
// Calcular total
const totalCalculado = computed(() => {
  console.log(
    "Productos actuales:",
    JSON.stringify(productosComprados.value, null, 2)
  ); // 👈 Esto
  return productosComprados.value.reduce((total, prod) => {
    if (prod.es_con_variante && Array.isArray(prod.variantes)) {
      return (
        total +
        prod.variantes.reduce((sub, v) => {
          const cantidad = Number(v.cantidad) || 0;
          const precio = Number(v.precio) || 0;
          return sub + cantidad * precio;
        }, 0)
      );
    } else {
      const cantidad = Number(prod.cantidad) || 0;
      const precio = Number(prod.precio) || 0;
      return total + cantidad * precio;
    }
  }, 0);
});
// ✅ BIEN
const guardarCompra = async () => {
  const total = totalCalculado.value;
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

  for (const producto of productosComprados.value) {
    const nombre = producto.nombre.trim();
    const categoria_id = producto.categoria_id || null;

    if (!nombre) continue;

    if (producto.es_con_variante) {
      // 1️⃣ Buscar o insertar el producto base (sin talla/color)
      const { data: productoBase, error: errorProductoBase } = await supabase
        .from("productos")
        .select("*")
        .eq("nombre", nombre)
        .maybeSingle();

      let producto_id;

      if (productoBase) {
        producto_id = productoBase.id;
      } else {
        const { data: nuevoProducto, error: errorNuevoProducto } =
          await supabase
            .from("productos")
            .insert([
              {
                nombre,
                categoria_id,
                es_con_variante: true,
                precio_venta: 0, 
                creado_en: new Date(),
              },
            ])
            .select()
            .single();

        if (errorNuevoProducto || !nuevoProducto) {
          console.error(
            "❌ Error al insertar producto base:",
            errorNuevoProducto
          );
          continue;
        }

        producto_id = nuevoProducto.id;
      }

      // 2️⃣ Insertar variantes en la tabla variantes_producto
// 2️⃣ Insertar variantes en la tabla variantes_producto
for (const variante of producto.variantes) {
  const { talla, color, cantidad, precio } = variante;

  if (!talla || !color || cantidad <= 0 || precio <= 0) continue;

  // Buscar variante existente
  const { data: varianteExistente } = await supabase
    .from("variantes_producto")
    .select("*")
    .eq("producto_id", producto_id)
    .eq("talla", talla)
    .eq("color", color)
    .maybeSingle();

  let variante_id;

  if (varianteExistente) {
    variante_id = varianteExistente.id;

    const nuevoStock = (varianteExistente.stock || 0) + cantidad;

    await supabase
      .from("variantes_producto")
      .update({
        stock: nuevoStock,
        precio_compra: precio,
      })
      .eq("id", variante_id);
  } else {
    const { data: nuevaVariante, error: errorNuevaVariante } =
      await supabase
        .from("variantes_producto")
        .insert([
          {
            producto_id,
            talla,
            color,
            stock: cantidad,
            precio_compra: precio,
          },
        ])
        .select()
        .single();

    if (errorNuevaVariante || !nuevaVariante) {
      console.error("❌ Error al insertar variante:", errorNuevaVariante);
      continue;
    }

    variante_id = nuevaVariante.id;
  }

  // 3️⃣ Registrar detalle de compra con producto base
  detalles.push({
    compra_id: compra.id,
    producto_id,
    cantidad,
    precio_compra: precio,
    talla,
    color,
  });
}

// ✅ 4️⃣ Recalcular stock total del producto base
const { data: sumaStock, error: errorStock } = await supabase
  .from("variantes_producto")
  .select("stock")
  .eq("producto_id", producto_id);

if (errorStock) {
  console.error("❌ Error al sumar stock de variantes:", errorStock);
} else {
  const totalStock = sumaStock.reduce((sum, v) => sum + (v.stock || 0), 0);

  await supabase
    .from("productos")
    .update({ stock: totalStock })
    .eq("id", producto_id);
}
}
else {
      const { cantidad, precio } = producto;

      if (cantidad <= 0 || precio <= 0) continue;

      const { data: existente } = await supabase
        .from("productos")
        .select("*")
        .eq("nombre", nombre)
        .maybeSingle();

      let producto_id;

      if (existente) {
        producto_id = existente.id;
        const nuevoStock = (existente.stock || 0) + cantidad;

        await supabase
          .from("productos")
          .update({ stock: nuevoStock, precio_compra: precio })
          .eq("id", producto_id);
      } else {
        const { data: nuevoProducto, error: errorNuevoProducto } =
          await supabase
            .from("productos")
            .insert([
              {
                nombre,
                stock: cantidad,
                precio_compra: precio,
                precio_venta: 0,
                categoria_id,
                es_con_variante: false,
                creado_en: new Date(),
              },
            ])
            .select()
            .single();

        if (errorNuevoProducto || !nuevoProducto) {
          console.error(
            "❌ Error al insertar producto simple:",
            errorNuevoProducto
          );
          continue;
        }

        producto_id = nuevoProducto.id;
      }

      detalles.push({
        compra_id: compra.id,
        producto_id,
        cantidad,
        precio_compra: precio,
      });
    }
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

  // Reset
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
watch(productosComprados, () => {
  // Forzamos el recalculo del total si cambia algo en productos o sus variantes
  totalCalculado.value // esto fuerza la reactividad
}, { deep: true })

</script>

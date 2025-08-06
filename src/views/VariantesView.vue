<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">
      Variantes de: {{ producto?.nombre }}
    </h2>

    <div class="mb-4">
      <button
        @click="volver"
        class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
      >
        ← Volver
      </button>
    </div>

    <table class="w-full border text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th class="px-3 py-2 border">Talla</th>
          <th class="px-3 py-2 border">Color</th>
          <th class="px-3 py-2 border">Precio Venta</th>
          <th class="px-3 py-2 border">Stock</th>
          <th class="px-3 py-2 border">Precio Compra</th>
          <th class="px-3 py-2 border">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="variante in variantes" :key="variante.id">
          <td class="border px-3 py-2">{{ variante.talla }}</td>
          <td class="border px-3 py-2">{{ variante.color }}</td>
          <td class="border px-3 py-2">
            <input
              v-model.number="variante.precio_venta"
              type="number"
              step="0.01"
              class="border rounded px-2 py-1 w-24"
            />
          </td>

          <td class="border px-3 py-2">
            <input
              v-model.number="variante.stock"
              type="number"
              class="border rounded px-2 py-1 w-20"
            />
          </td>
          <td class="border px-3 py-2">
            <input
              v-model.number="variante.precio_compra"
              type="number"
              step="0.01"
              class="border rounded px-2 py-1 w-24"
            />
          </td>
          <td class="border px-3 py-2">
            <button
              @click="guardarVariante(variante)"
              class="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
            >
              Guardar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-6">
      <h3 class="font-semibold mb-2">Agregar nueva variante</h3>
      <div class="flex gap-2">
        <input
          v-model="nueva.talla"
          placeholder="Talla"
          class="border px-2 py-1 rounded"
        />
        <input
          v-model="nueva.color"
          placeholder="Color"
          class="border px-2 py-1 rounded"
        />
        <input
          v-model.number="nueva.precio_venta"
          type="number"
          step="0.01"
          placeholder="Precio Venta"
          class="border px-2 py-1 rounded w-24"
        />
        <input
          v-model.number="nueva.stock"
          type="number"
          placeholder="Stock"
          class="border px-2 py-1 rounded w-20"
        />
        <input
          v-model.number="nueva.precio_compra"
          type="number"
          step="0.01"
          placeholder="Precio"
          class="border px-2 py-1 rounded w-24"
        />
        <button
          @click="agregarVariante"
          class="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        >
          Agregar
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../supabase";

const route = useRoute();
const router = useRouter();
const productoId = route.params.id;

const producto = ref(null);
const variantes = ref([]);
const nueva = ref({ talla: "", color: "", stock: 0, precio_compra: 0, precio_venta: 0 });

onMounted(() => {
  cargarProducto();
  cargarVariantes();
});

const cargarProducto = async () => {
  const { data, error } = await supabase
    .from("productos")
    .select()
    .eq("id", productoId)
    .single();
  if (!error) producto.value = data;
};

const cargarVariantes = async () => {
  const { data, error } = await supabase
    .from("variantes_producto")
    .select("*")
    .eq("producto_id", productoId);
  if (!error) variantes.value = data;
};

const guardarVariante = async (v) => {
  const { error } = await supabase
    .from("variantes_producto")
    .update({
      stock: v.stock,
      precio_compra: v.precio_compra,
      precio_venta: v.precio_venta, // <-- ya incluido
    })
    .eq("id", v.id);

  if (!error) alert("✅ Variante actualizada");
};

const agregarVariante = async () => {
  if (!nueva.value.talla || !nueva.value.color) {
    alert("❗ Completa talla y color");
    return;
  }

  const { error } = await supabase.from("variantes_producto").insert({
    producto_id: productoId,
    talla: nueva.value.talla,
    color: nueva.value.color,
    stock: nueva.value.stock,
    precio_compra: nueva.value.precio_compra,
    precio_venta: nueva.value.precio_venta,
  });

  if (!error) {
    alert("✅ Variante agregada");
    nueva.value = { talla: "", color: "", stock: 0, precio_compra: 0, precio_venta: 0 };
    cargarVariantes();
  }
};

const volver = () => {
  router.push("/productos");
};
</script>


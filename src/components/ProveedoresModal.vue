<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" v-if="visible">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 relative">
      <h2 class="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
        <i class="fas fa-box-open text-pink-500"></i> Proveedores
      </h2>

      <!-- Formulario -->
      <form @submit.prevent="guardarProveedor" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input v-model="nuevo.nombre" type="text" placeholder="Nombre *" class="border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300" required />
        <input v-model="nuevo.ruc" type="text" placeholder="RUC" class="border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
        <input v-model="nuevo.telefono" type="text" placeholder="Teléfono" class="border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
        <input v-model="nuevo.direccion" type="text" placeholder="Dirección" class="border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
        <div class="md:col-span-2 text-right">
          <button class="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition">
            <i class="fas fa-save me-1"></i> {{ editando ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </form>

      <!-- Tabla -->
      <div class="overflow-auto max-h-64 border rounded-xl">
        <table class="w-full text-sm">
          <thead class="bg-purple-100 text-purple-700 font-semibold">
            <tr>
              <th class="p-2 text-left">Nombre</th>
              <th class="p-2 text-left">RUC</th>
              <th class="p-2 text-left">Teléfono</th>
              <th class="p-2 text-left">Dirección</th>
              <th class="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prov in proveedores" :key="prov.id" class="border-t hover:bg-gray-50">
              <td class="p-2">{{ prov.nombre }}</td>
              <td class="p-2">{{ prov.ruc || '-' }}</td>
              <td class="p-2">{{ prov.telefono || '-' }}</td>
              <td class="p-2">{{ prov.direccion || '-' }}</td>
              <td class="p-2 text-center flex justify-center gap-2">
                <button @click="editarProveedor(prov)" class="text-blue-600 hover:text-blue-800"><i class="fas fa-edit"></i></button>
                <button @click="eliminarProveedor(prov.id)" class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Botón cerrar -->
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">
        &times;
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, } from "vue";
import { supabase } from "../supabase";

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["close"]);

const proveedores = ref([]);
const nuevo = ref({ nombre: "", ruc: "", telefono: "", direccion: "" });
const editando = ref(false);
const idEditando = ref(null);

const cargarProveedores = async () => {
  const { data, error } = await supabase.from("proveedores").select("*").order("created_at", { ascending: false });
  if (!error) proveedores.value = data;
};

const guardarProveedor = async () => {
  if (!nuevo.value.nombre.trim()) return;

  if (editando.value) {
    // actualizar
    const { error } = await supabase.from("proveedores").update(nuevo.value).eq("id", idEditando.value);
    if (!error) {
      editando.value = false;
      idEditando.value = null;
    }
  } else {
    // insertar nuevo
    const { error } = await supabase.from("proveedores").insert([nuevo.value]);
    if (error) return;
  }

  await cargarProveedores();
  nuevo.value = { nombre: "", ruc: "", telefono: "", direccion: "" };
};

const editarProveedor = (prov) => {
  nuevo.value = { ...prov };
  idEditando.value = prov.id;
  editando.value = true;
};

const eliminarProveedor = async (id) => {
  const confirmado = confirm("¿Estás seguro de eliminar este proveedor?");
  if (!confirmado) return;

  const { error } = await supabase.from("proveedores").delete().eq("id", id);
  if (!error) await cargarProveedores();
};

watch(() => props.visible, (nuevoValor) => {
  if (nuevoValor) cargarProveedores();
});
</script>

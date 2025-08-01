<template>
  <div class="p-6 space-y-10">
    <!-- 🏢 Datos del negocio -->
    <section class="bg-white shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-6 text-purple-700">Datos del negocio</h2>
      <form @submit.prevent="guardarNegocio" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="(label, key) in camposNegocio" :key="key">
          <label class="block text-sm font-medium text-gray-700">{{ label }}</label>
          <input
            v-model="negocio[key]"
            type="text"
            :placeholder="label"
            class="border border-gray-300 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Logo (URL)</label>
          <input
            v-model="negocio.logo_url"
            type="text"
            placeholder="https://..."
            class="border border-gray-300 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div class="md:col-span-2">
          <button
            type="submit"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150"
          >
            Guardar
          </button>
        </div>
      </form>
    </section>

    <!-- 🗂️ Categorías -->
    <section class="bg-white shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-6 text-purple-700">Categorías y Subcategorías</h2>
      <form @submit.prevent="crearCategoria" class="flex flex-col md:flex-row gap-4 mb-6">
        <input
          v-model="nuevaCategoria.nombre"
          type="text"
          placeholder="Nombre de la categoría o Subcategoría"
          required
          class="border border-gray-300 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <select
          v-model="nuevaCategoria.parent_id"
          class="border border-gray-300 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option :value="null">Sin padre (categoría principal)</option>
          <option v-for="cat in categorias.filter(c => !c.parent_id)" :key="cat.id" :value="cat.id">
            {{ cat.nombre }}
          </option>
        </select>
        <button
          type="submit"
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150"
        >
          Crear
        </button>
      </form>

      <ul class="space-y-2 text-sm text-purple-800">
        <li v-for="cat in categorias.filter(c => !c.parent_id)" :key="cat.id">
          <div class="flex justify-between items-center font-semibold text-pink-700">
            {{ cat.nombre }}
            <button @click="eliminarCategoria(cat.id)" class="text-red-500 hover:underline text-xs">
              Eliminar
            </button>
          </div>
          <ul class="pl-4 mt-1 space-y-1 text-purple-600">
            <li
              v-for="sub in categorias.filter(c => c.parent_id === cat.id)"
              :key="sub.id"
              class="flex justify-between"
            >
              <span>└ {{ sub.nombre }}</span>
              <button @click="eliminarCategoria(sub.id)" class="text-red-400 hover:underline text-xs">
                Eliminar
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

// 🏢 Datos del negocio
const negocio = ref({
  nombre: '',
  ruc: '',
  direccion: '',
  telefono: '',
  logo_url: '',
  moneda: 'PEN',
  formato_fecha: 'DD/MM/YYYY',
})

const camposNegocio = {
  nombre: 'Nombre',
  ruc: 'RUC',
  direccion: 'Dirección',
  telefono: 'Teléfono',
  moneda: 'Moneda',
  formato_fecha: 'Formato de fecha',
}

const cargarNegocio = async () => {
  const { data } = await supabase.from('negocio').select('*').single()
  if (data) negocio.value = data
}

const guardarNegocio = async () => {
  await supabase.from('negocio').upsert(negocio.value, { onConflict: 'id' })
  alert('✅ Datos guardados')
}

// 📁 Categorías
const categorias = ref([])
const nuevaCategoria = ref({ nombre: '', parent_id: null })

const cargarCategorias = async () => {
  const { data } = await supabase.from('categorias').select('*')
  categorias.value = data
}

const crearCategoria = async () => {
  await supabase.from('categorias').insert(nuevaCategoria.value)
  nuevaCategoria.value = { nombre: '', parent_id: null }
  await cargarCategorias()
}

const eliminarCategoria = async (id) => {
  const confirmar = confirm('¿Estás seguro de eliminar esta categoría?')
  if (!confirmar) return
  await supabase.from('categorias').delete().eq('id', id)
  await cargarCategorias()
}

// Init
onMounted(() => {
  cargarNegocio()
  cargarCategorias()
})
</script>

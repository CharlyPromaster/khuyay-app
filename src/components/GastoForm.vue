<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl mx-auto border border-gray-200">
    <h2 class="text-2xl font-bold mb-6 text-purple-700 flex items-center gap-2">
      <i class="fas fa-wallet text-pink-500"></i>
      {{ form.id ? 'Editar Gasto' : 'Registrar Gasto' }}
    </h2>

    <form @submit.prevent="guardarGasto" class="space-y-4">
      <!-- Descripción -->
      <div>
        <label class="text-sm font-semibold text-gray-700">Descripción</label>
        <input
          v-model="form.descripcion"
          type="text"
          class="mt-1 w-full rounded-xl border-gray-300 focus:ring-pink-500 focus:border-pink-500"
          required
        />
      </div>

      <!-- Monto -->
      <div>
        <label class="text-sm font-semibold text-gray-700">Monto (S/)</label>
        <input
          v-model.number="form.monto"
          type="number"
          step="0.01"
          min="0"
          class="mt-1 w-full rounded-xl border-gray-300 focus:ring-pink-500 focus:border-pink-500"
          required
        />
      </div>

      <!-- Categoría -->
      <div>
        <label class="text-sm font-semibold text-gray-700">Categoría</label>
        <input
          v-model="form.categoria"
          type="text"
          class="mt-1 w-full rounded-xl border-gray-300 focus:ring-pink-500 focus:border-pink-500"
        />
      </div>

      <!-- Tipo -->
      <div>
        <label class="text-sm font-semibold text-gray-700">Tipo</label>
        <select
          v-model="form.tipo"
          class="mt-1 w-full rounded-xl border-gray-300 focus:ring-pink-500 focus:border-pink-500"
          required
        >
          <option disabled value="">Seleccione tipo</option>
          <option value="fijo">Fijo</option>
          <option value="variable">Variable</option>
        </select>
      </div>

      <!-- Fecha -->
      <div>
        <label class="text-sm font-semibold text-gray-700">Fecha</label>
        <input
          v-model="form.fecha"
          type="date"
          class="mt-1 w-full rounded-xl border-gray-300 focus:ring-pink-500 focus:border-pink-500"
          required
        />
      </div>

      <!-- Observaciones -->
      <div>
        <label class="text-sm font-semibold text-gray-700">Observaciones</label>
        <textarea
          v-model="form.observaciones"
          rows="3"
          class="mt-1 w-full rounded-xl border-gray-300 focus:ring-pink-500 focus:border-pink-500"
        ></textarea>
      </div>

      <!-- Botón Guardar -->
      <button
        type="submit"
        class="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-lg shadow-md"
      >
        <i class="fas fa-save mr-2"></i>
        {{ form.id ? 'Actualizar Gasto' : 'Guardar Gasto' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { supabase } from '../supabase'

const emit = defineEmits(['guardado'])
const props = defineProps({
  gasto: Object
})

const form = ref({
  descripcion: '',
  monto: null,
  categoria: '',
  tipo: '',
  fecha: '',
  observaciones: '',
  id: null, // para saber si es edición
})

// Si llega una prop `gasto`, la copiamos
watchEffect(() => {
  if (props.gasto) {
    form.value = { ...props.gasto }
  }
})

const guardarGasto = async () => {
  if (!form.value.descripcion || !form.value.monto || !form.value.fecha || !form.value.tipo) {
    alert('Por favor, complete todos los campos obligatorios.')
    return
  }

  if (form.value.id) {
    // EDITAR GASTO
    const { error } = await supabase
      .from('gastos')
      .update({
        descripcion: form.value.descripcion,
        monto: form.value.monto,
        categoria: form.value.categoria,
        tipo: form.value.tipo,
        fecha: form.value.fecha,
        observaciones: form.value.observaciones,
      })
      .eq('id', form.value.id)

    if (error) {
      console.error(error)
      alert('Error al actualizar gasto')
    } else {
      alert('Gasto actualizado correctamente ✅')
      emit('guardado')
    }
  } else {
    // NUEVO GASTO
    const { error } = await supabase.from('gastos').insert([{
      descripcion: form.value.descripcion,
      monto: form.value.monto,
      categoria: form.value.categoria,
      tipo: form.value.tipo,
      fecha: form.value.fecha,
      observaciones: form.value.observaciones,
    }])

    if (error) {
      console.error(error)
      alert('Error al guardar gasto')
    } else {
      alert('Gasto registrado correctamente ✅')
      emit('guardado')
      // Limpiar
      form.value = {
        descripcion: '',
        monto: null,
        categoria: '',
        tipo: '',
        fecha: '',
        observaciones: '',
        id: null
      }
    }
  }
}
</script>

<template>
  <div>
    <h3 class="text-lg font-bold mb-2">Variantes</h3>

    <div
      v-for="(variante, index) in localVariantes"
      :key="index"
      class="grid grid-cols-5 gap-2 items-center mb-2"
    >
      <!-- Talla -->
      <input
        v-model="variante.talla"
        placeholder="Talla"
        class="input input-sm input-bordered"
        required
      />

      <!-- Color -->
      <input
        v-model="variante.color"
        placeholder="Color"
        class="input input-sm input-bordered"
        required
      />

      <!-- Cantidad -->
      <input
        v-model.number="variante.cantidad"
        type="number"
        placeholder="Cantidad"
        class="input input-sm input-bordered"
        min="0"
        required
      />

      <!-- Precio Compra -->
      <input
        v-model.number="variante.precio"
        type="number"
        placeholder="Precio Compra"
        class="input input-sm input-bordered"
        min="0"
        step="0.01"
        required
      />

      <!-- Eliminar variante -->
      <button @click="eliminarVariante(index)" class="btn btn-sm btn-outline-error">
        <i class="fas fa-trash"></i>
      </button>
    </div>

    <!-- Botón para agregar variante -->
    <button @click="agregarVariante" class="btn btn-sm btn-outline-primary mt-2">
      <i class="fas fa-plus-circle mr-1"></i> Añadir Variante
    </button>
  </div>
</template>

<script setup>
import { ref, watch, toRef } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})
const modelValue = defineModel(); // el array de variantes

// 👇 Esto fuerza la propagación hacia el padre cuando cambia algo
watch(modelValue, () => {
  modelValue.value = [...modelValue.value]; // nueva referencia
}, { deep: true });
const emit = defineEmits(['update:modelValue'])

const localVariantes = ref([...props.modelValue])

// sincroniza si desde fuera cambian modelValue
watch(() => props.modelValue, (newVal) => {
  localVariantes.value = [...newVal]
}, { deep: true })

// observa cambios internos y emite
watch(localVariantes, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

function agregarVariante() {
  localVariantes.value.push({
    talla: '',
    color: '',
    cantidad: 0,
    precio: 0
  })
}

function eliminarVariante(index) {
  localVariantes.value.splice(index, 1)
}
</script>

<template>
  <div>
    <h3 class="text-lg font-bold mb-2">Variantes</h3>

    <div
      v-for="(variante, index) in modelValue"
      :key="index"
      class="grid grid-cols-5 gap-2 items-center mb-2"
    >
      <input
        v-model="variante.talla"
        placeholder="Talla"
        class="input input-sm input-bordered"
        required
      />
      <input
        v-model="variante.color"
        placeholder="Color"
        class="input input-sm input-bordered"
        required
      />
      <input
        v-model.number="variante.cantidad"
        type="number"
        placeholder="Cantidad"
        class="input input-sm input-bordered"
        min="0"
        required
      />
      <input
        v-model.number="variante.precio"
        type="number"
        placeholder="Precio Compra"
        class="input input-sm input-bordered"
        min="0"
        step="0.01"
        required
      />
      <button @click="eliminarVariante(index)" class="btn btn-sm btn-outline-error">
        <i class="fas fa-trash"></i>
      </button>
    </div>

    <button @click="agregarVariante" class="btn btn-sm btn-outline-primary mt-2">
      <i class="fas fa-plus-circle mr-1"></i> Añadir Variante
    </button>
  </div>
</template>

<script setup>
const modelValue = defineModel() // ← esto es suficiente con v-model
function agregarVariante() {
  modelValue.value.push({
    talla: '',
    color: '',
    cantidad: 0,
    precio: 0
  })
}
function eliminarVariante(index) {
  modelValue.value.splice(index, 1)
}
</script>

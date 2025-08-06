<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg overflow-auto max-h-[90vh]">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Resultados relacionados</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-black">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div v-if="info.tipo === 'producto'">
        <h3 class="text-lg font-semibold mb-2">{{ info.producto?.nombre }}</h3>
        <p>Stock total: {{ info.producto?.stock }}</p>

        <div v-if="info.variantes?.length">
          <h4 class="mt-3 font-bold">Variantes</h4>
          <ul class="list-disc ml-5">
            <li v-for="v in info.variantes" :key="v.id">
              Talla {{ v.talla }} / Color {{ v.color }} → {{ v.stock }} unidades
            </li>
          </ul>
        </div>

        <div v-if="info.ventas?.length">
          <h4 class="mt-3 font-bold">Ventas relacionadas</h4>
          <ul>
            <li v-for="v in info.ventas" :key="v.id">
              {{ v.fecha }} · {{ v.nombre_cliente }} · {{ v.cantidad }} u. · S/{{ v.total }}
            </li>
          </ul>
        </div>

        <div v-if="info.compras?.length">
          <h4 class="mt-3 font-bold">Compras relacionadas</h4>
          <ul>
            <li v-for="c in info.compras" :key="c.id">
              {{ c.fecha }} · {{ c.cantidad }} u. · S/{{ c.total }}
            </li>
          </ul>
        </div>
      </div>

      <div v-else-if="info.tipo === 'cliente'">
        <h3 class="text-lg font-semibold mb-2">{{ info.cliente?.nombre_cliente }}</h3>
        <p>Teléfono: {{ info.cliente?.telefono_cliente }}</p>
        <p>DNI: {{ info.cliente?.dni_cliente }}</p>

        <div v-if="info.ventas?.length">
          <h4 class="mt-3 font-bold">Ventas</h4>
          <ul>
            <li v-for="v in info.ventas" :key="v.id">
              {{ v.fecha }} · {{ v.total }} · {{ v.metodo_pago === 'fiado' ? 'Fiado' : 'Pagado' }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['visible', 'info'])
defineEmits(['close'])
</script>

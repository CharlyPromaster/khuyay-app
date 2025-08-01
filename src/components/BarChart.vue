<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const props = defineProps({
  labels: Array,
  data: Array,
});

const canvas = ref(null);
let chart;

const renderChart = () => {
  if (chart) chart.destroy();

  chart = new Chart(canvas.value, {
    type: "bar",
    data: {
      labels: props.labels,
      datasets: [
        {
          label: "Totales",
          data: props.data,
          backgroundColor: ["#8B5CF6", "#EC4899", "#FBBF24"],
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `S/ ${ctx.raw.toFixed(2)}` } }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: value => `S/ ${value}` }
        }
      }
    },
  });
};

watch(() => props.data, renderChart);
onMounted(renderChart);
</script>

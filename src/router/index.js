// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../components/layaout/DashboardLayout.vue'
import ComprasView from '../views/ComprasView.vue'
import ConfiguracionesView from '../views/ConfiguracionesView.vue'
import ProductosView from '../views/ProductosView.vue'
import VentaView from '../views/VentaView.vue'
import VentasView from '../views/VentasView.vue'
import GastoView from '../views/GastoView.vue'
import ReportesView from '../views/ReportesView.vue'
import VariantesView from '../views/VariantesView.vue'
import ClientesView from '../views/ClientesView.vue'

// Temporal: una vista de inicio vacía
const DashboardHome = { template: '<div class="p-4 text-white">Bienvenido al dashboard 👋</div>' }

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    children: [
      { path: '', name: 'home', component: DashboardHome },
      { path: 'compras', name: 'compras', component: ComprasView },
      { path: 'configuraciones', name: 'configuraciones', component: ConfiguracionesView },
      { path: 'productos', name: 'productos', component: ProductosView },
      { path: 'venta', name: 'venta', component: VentaView },
      { path: 'ventas', name: 'ventas', component: VentasView },
      { path: 'gasto', name: 'gasto', component: GastoView },
      { path: '/productos/:id/variantes', name: 'VariantesView', component: VariantesView },
      { path: 'reportes', name: 'reportes', component: ReportesView },
      { path: 'clientes', name: 'Clientes', component: ClientesView } 
    ]
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

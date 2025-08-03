<template>
  <div class="px-6 py-8 max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-2">
      <i class="fas fa-cash-register text-pink-500"></i> Registrar Venta
    </h2>

    <!-- Fecha y método de pago -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label class="block text-sm font-semibold text-purple-700 mb-1"
          >Fecha</label
        >
        <input
          type="date"
          v-model="venta.fecha"
          class="w-full px-4 py-2 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label class="block text-sm font-semibold text-purple-700 mb-1"
          >Método de Pago</label
        >
        <select
          v-model="venta.metodo_pago"
          class="w-full px-4 py-2 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="efectivo">Efectivo</option>
          <option value="yape">Yape</option>
          <option value="plin">Plin</option>
          <option value="fiado">Fiado</option>
        </select>
      </div>
    </div>

    <!-- Cliente si es fiado -->
    <div
      v-if="venta.metodo_pago === 'fiado'"
      class="mb-6 p-5 bg-pink-100 border border-pink-300 rounded-2xl shadow"
    >
      <h3 class="text-lg font-semibold text-pink-700 mb-3">
        <i class="fas fa-user text-pink-500 mr-1"></i> Datos del Cliente
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-semibold text-purple-700 mb-1"
            >Nombre *</label
          >
          <input
            type="text"
            v-model="cliente.nombre"
            class="w-full px-4 py-2 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-purple-700 mb-1"
            >Teléfono</label
          >
          <input
            type="text"
            v-model="cliente.telefono"
            class="w-full px-4 py-2 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-purple-700 mb-1"
            >DNI</label
          >
          <input
            type="text"
            v-model="cliente.dni"
            class="w-full px-4 py-2 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>

    <!-- Productos -->
    <h3 class="text-lg font-semibold text-purple-700 mb-3">
      <i class="fas fa-box text-pink-400 mr-1"></i> Productos
    </h3>
    <div
      v-for="(p, index) in productos"
      :key="index"
      class="mb-5 p-5 bg-white rounded-2xl shadow border border-purple-100"
    >
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <!-- Nombre + sugerencias -->
        <div class="md:col-span-2 relative">
          <label class="block text-sm font-semibold text-purple-700 mb-1"
            >Producto</label
          >
          <input
            type="text"
            v-model="p.nombre"
            @input="filtrarSugerencias(index)"
            @focus="p.mostrarSugerencias = true"
            @blur="ocultarSugerencias(index)"
            class="w-full px-4 py-2 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            autocomplete="off"
          />
          <ul
            v-if="p.mostrarSugerencias && p.sugerencias?.length"
            class="absolute z-10 bg-white border border-purple-300 w-full mt-1 rounded-lg shadow max-h-48 overflow-auto"
          >
            <li
              v-for="s in p.sugerencias"
              :key="s.id"
              class="px-3 py-2 hover:bg-pink-100 cursor-pointer text-sm"
              @click="seleccionarProducto(index, s)"
            >
              {{ s.nombre }} – S/ {{ s.precio_venta }}
            </li>
          </ul>
        </div>

        <div>
          <label class="block text-sm font-semibold text-purple-700 mb-1"
            >Cantidad</label
          >
          <input
            type="number"
            :min="1"
            :max="obtenerStockDisponible(p.producto_id)"
            v-model="p.cantidad"
            :disabled="obtenerStockDisponible(p.producto_id) === 0"
            class="w-full px-4 py-2 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <p
          v-if="p.producto_id && obtenerStockDisponible(p.producto_id) === 0"
          class="text-red-600 text-sm mt-1"
        >
          Sin stock disponible
        </p>

        <div>
          <label class="block text-sm font-semibold text-purple-700 mb-1"
            >Precio</label
          >
          <input
            type="number"
            min="0"
            v-model="p.precio"
            class="w-full px-4 py-2 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <button
            @click="quitarProducto(index)"
            class="w-full btn btn-outline btn-sm border border-red-400 text-red-600 hover:bg-red-50"
          >
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
        </div>
      </div>
    </div>

    <button
      @click="agregarProducto"
      class="btn btn-outline btn-sm mb-6 border-purple-400 text-purple-700 hover:bg-purple-50"
    >
      <i class="fas fa-plus mr-1"></i> Agregar Producto
    </button>

    <!-- Total -->
    <div class="text-right text-xl font-bold text-purple-800 mb-6">
      Total: <span class="text-pink-600">S/ {{ calcularTotal() }}</span>
    </div>

    <!-- Guardar -->
    <button
      @click="guardarVenta"
      class="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold text-lg rounded-xl shadow-md"
    >
      <i class="fas fa-save text-white"></i>
      <span>Guardar Venta</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";

const productosDB = ref([]);

const obtenerStockDisponible = (producto_id) => {
  if (!producto_id) return 0;
  const p = productosDB.value.find((prod) => prod.id === producto_id);
  return p?.stock ?? 0;
};

const venta = ref({
  fecha: new Date().toLocaleDateString("fr-CA"),
  metodo_pago: "efectivo",
});

const cliente = ref({
  nombre: "",
  telefono: "",
  dni: "",
});

const productos = ref([
  {
    nombre: "",
    cantidad: 1,
    precio: 0,
    producto_id: null,
    sugerencias: [],
    mostrarSugerencias: false,
  },
]);

const quitarProducto = (index) => {
  productos.value.splice(index, 1);
};

const calcularTotal = () => {
  return productos.value
    .reduce((acc, p) => acc + p.precio * p.cantidad, 0)
    .toFixed(2);
};

const guardarVenta = async () => {
  console.log("Guardando venta...", {
    venta: venta.value,
    cliente: cliente.value,
    productos: productos.value,
  });

  if (productos.value.length === 0) {
    alert("Agrega al menos un producto.");
    return;
  }

  if (
    venta.value.metodo_pago === "fiado" &&
    cliente.value.nombre.trim() === ""
  ) {
    alert("Debe ingresar el nombre del cliente fiado.");
    return;
  }

  const totalVenta = parseFloat(calcularTotal());
  let clienteId = null;

  // Si es fiado, registrar cliente
  if (venta.value.metodo_pago === "fiado") {
    const { data: clienteInsertado, error: errorCliente } = await supabase
      .from("clientes")
      .insert([
        {
          nombre: cliente.value.nombre,
          telefono: cliente.value.telefono || null,
          dni: cliente.value.dni || null,
        },
      ])
      .select()
      .single();

    if (errorCliente) {
      console.error("Error al registrar cliente:", errorCliente);
      alert("Error al registrar cliente fiado.");
      return;
    }

    clienteId = clienteInsertado.id;
  }

  // Insertar venta
  const { data: ventaInsertada, error: errorVenta } = await supabase
    .from("ventas")
    .insert([
      {
        fecha: venta.value.fecha,
        metodo_pago: venta.value.metodo_pago,
        total: totalVenta,
        estado: venta.value.metodo_pago === "fiado" ? "pendiente" : "pagado",
        metodo_pago_final: null,
        fecha_pago: null,
        cliente_id: clienteId,
      },
    ])
    .select()
    .single();

  if (errorVenta) {
    console.error(
      "Error al registrar venta:",
      errorVenta.message,
      errorVenta.details
    );
    alert("Error al registrar la venta.");
    return;
  }

  const ventaId = ventaInsertada.id;

  // Verificar y asignar producto_id
  for (const item of productos.value) {
    if (!item.producto_id) {
      const encontrado = productosDB.value.find(
        (p) => p.nombre === item.nombre
      );
      if (encontrado) {
        item.producto_id = encontrado.id;
        item.precio = encontrado.precio_venta; // asegurar precio correcto
      } else {
        alert(
          `No se encontró el producto "${item.nombre}". Selecciónalo desde la lista.`
        );
        return;
      }
    }
  }

  // Validar stock antes de insertar detalles
  for (const item of productos.value) {
    const producto = productosDB.value.find((p) => p.id === item.producto_id);
    if (!producto) {
      alert(`El producto con ID ${item.producto_id} no existe.`);
      return;
    }
    if (item.cantidad > producto.stock) {
      alert(
        `No hay suficiente stock de "${producto.nombre}". Stock disponible: ${producto.stock}, solicitado: ${item.cantidad}`
      );
      return;
    }
  }

  // Insertar detalles de venta
  const detalles = productos.value.map((item) => ({
    venta_id: ventaId,
    producto_id: item.producto_id,
    cantidad: Number(item.cantidad),
    precio_venta: Number(item.precio),
    subtotal: Number(item.cantidad) * Number(item.precio),
  }));
  console.log(
    "PRODUCTOS ANTES DE INSERT:",
    JSON.stringify(productos.value, null, 2)
  );
  console.log("DETALLES A INSERTAR:", JSON.stringify(detalles, null, 2));
  const { error: errorDetalles } = await supabase
    .from("detalle_ventas")
    .insert(detalles);

  if (errorDetalles) {
    console.error("Error al insertar detalles de venta:", errorDetalles);
    alert("Error al registrar productos vendidos.");
    return;
  }

  console.log("Venta registrada exitosamente.");

  // Actualizar stock
  for (const item of productos.value) {
    const { error: errorStock } = await supabase.rpc("restar_stock", {
      pid: item.producto_id,
      cantidad_restar: item.cantidad,
    });

    if (errorStock) {
      console.error("Error al actualizar stock:", errorStock);
      alert("Ocurrió un error al actualizar el stock de productos.");
      return;
    }
  }
  alert("Venta registrada correctamente ✅");

  // Reset
  venta.value = {
    fecha: new Date().toLocaleDateString("fr-CA"),
    metodo_pago: "efectivo",
  };
  cliente.value = { nombre: "", telefono: "", dni: "" };
  productos.value = [
    {
      nombre: "",
      cantidad: 1,
      precio: 0,
      producto_id: null,
      sugerencias: [],
      mostrarSugerencias: false,
    },
  ];
};

onMounted(async () => {
  const { data, error } = await supabase
    .from("productos")
    .select("id, nombre, precio_venta, stock");

  if (error) {
    console.error("Error al cargar productos:", error);
  } else {
    productosDB.value = data;
  }
});

const filtrarSugerencias = async (index) => {
  const nombre = productos.value[index].nombre;

  const { data } = await supabase
    .from("productos")
    .select("id, nombre, precio_venta")
    .ilike("nombre", `%${nombre}%`);

  productos.value[index].sugerencias = data || [];
  productos.value[index].mostrarSugerencias = true;
};

const seleccionarProducto = (index, sugerencia) => {
  productos.value[index].nombre = sugerencia.nombre;
  productos.value[index].precio = sugerencia.precio_venta;
  productos.value[index].producto_id = sugerencia.id;
  productos.value[index].mostrarSugerencias = false;
};

const ocultarSugerencias = (index) => {
  setTimeout(() => {
    productos.value[index].mostrarSugerencias = false;
  }, 150);
};

const agregarProducto = () => {
  productos.value.push({
    nombre: "",
    cantidad: 1,
    precio: 0,
    producto_id: null,
    sugerencias: [],
    mostrarSugerencias: false,
  });
};
</script>

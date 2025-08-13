import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '@/stores/auth';

// Layout
import LayoutGeneral from "@/layouts/LayoutGeneral.vue";

// Vistas
import Login from "@/views/Login.vue";
import Inicio from "@/views/Inicio.vue";
import GestionUsuarios from "@/views/GestionUsuarios.vue";
import CreditoCliente from "@/views/CreditoClientes.vue";
import ClientesNuevos from "@/views/NuevosClientes.vue";
import CreditoFuncionario from "@/views/CreditoFuncionario.vue";
import InformeGastos from "@/views/InformeGastos.vue";
import InformeIngresos from "@/views/InformeIngresos.vue";
import Caja from "@/views/Caja.vue";
import CajaMes from "@/views/CajaMes.vue";
import Politicas from "@/views/Politicas.vue";
import Contrasena from "@/views/Contrasena.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/cambiar-contrasena",
    name: "Contrasena",
    component: Contrasena,
    meta: { requiereAuth: true }, 
  },
  {
    path: "/inicio",
    component: LayoutGeneral,
    meta: { requiereAuth: true },
    children: [{ path: "", name: "Inicio", component: Inicio }],
  },
  {
    path: "/usuarios",
    component: LayoutGeneral,
    meta: { requiereAuth: true },
    children: [
      { path: "", name: "GestionUsuarios", component: GestionUsuarios },
    ],
  },
  {
    path: "/credito-cliente",
    component: LayoutGeneral,
    meta: { requiereAuth: true },
    children: [{ path: "", name: "CreditoCliente", component: CreditoCliente }],
  },
  {
    path: "/clientes-nuevos",
    component: LayoutGeneral,
    meta: { requiereAuth: true },
    children: [{ path: "", name: "ClientesNuevos", component: ClientesNuevos }],
  },
  {
    path: "/credito-funcionario",
    component: LayoutGeneral,
    meta: { requiereAuth: true },
    children: [
      { path: "", name: "CreditoFuncionario", component: CreditoFuncionario },
    ],
  },
  {
    path: "/ingresos",
    component: LayoutGeneral,
    meta: { requiereAuth: true },
    children: [
      { path: "", name: "InformeIngresos", component: InformeIngresos },
    ],
  },
  {
    path: "/gastos",
    component: LayoutGeneral,
    meta: { requiereAuth: true },
    children: [{ path: "", name: "InformeGastos", component: InformeGastos }],
  },
  {
    path: "/caja",
    component: LayoutGeneral,
    meta: { requiereAuth: true },
    children: [{ path: "", name: "Caja", component: Caja }],
  },

  {
    path: "/caja-mes",
    component: LayoutGeneral,
    meta: { requiereAuth: true },
    children: [{ path: "", name: "CajaMes", component: CajaMes }],
  },
  {
    path: "/politicas",
    component: LayoutGeneral,
    meta: { requiereAuth: true },
    children: [{ path: "", name: "Politicas", component: Politicas }],
  },
];

// ⚠️ ESTA PARTE FALTABA
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  // Rutas que requieren autenticación
  if (to.meta.requiereAuth) {
    if (!auth.isAuthenticated) {
      return next('/');
    }

    // 🚨 Si debe cambiar contraseña y no está en la vista para cambiarla
    if (auth.user?.debe_cambiar_contrasena && to.path !== '/cambiar-contrasena') {
      return next('/cambiar-contrasena');
    }
  }

  next();
});





export default router;

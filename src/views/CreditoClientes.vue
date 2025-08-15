<template>
    <h1>Credito Clientes</h1>
    <AdminClientes v-if="auth.isAdmin"/>
    <SupervisorClientes v-if="auth.isSupervisor" />
    <AsesorCliente v-if="auth.isAsesor" />
</template>

<script setup>

import { useAuthStore } from '@/stores/auth'


import AdminClientes from '../components/Admin/AdminClientes.vue';

import SupervisorClientes from '../components/Supervisor/SupervisorClientes.vue';


import AsesorCliente from '../components/Asesores/AsesorCliente.vue';

const auth = useAuthStore()

</script>
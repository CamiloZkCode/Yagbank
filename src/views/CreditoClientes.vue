<template>
    <h1>Credito Clientes</h1>
<<<<<<< HEAD
    <AdminClientes v-if="auth.isAdmin"/>
    <SupervisorClientes v-if="auth.isSupervisor" />
    <AsesorCliente v-if="auth.isAsesor" />
=======
    <AdminClientes  v-if="auth.isAdmin"/>
    <SupervisorClientes v-else-if="auth.isSupervisor"/>
    <AsesorCliente v-else-if="auth.isAsesor"/>
>>>>>>> 735d2f6237203f63c68a2c5ea351fa5c09b36e18
</template>

<script setup>

import { useAuthStore } from '@/stores/auth'

<<<<<<< HEAD

=======
>>>>>>> 735d2f6237203f63c68a2c5ea351fa5c09b36e18
import AdminClientes from '../components/Admin/AdminClientes.vue';

import SupervisorClientes from '../components/Supervisor/SupervisorClientes.vue';


import AsesorCliente from '../components/Asesores/AsesorCliente.vue';

const auth = useAuthStore()

<<<<<<< HEAD
=======

>>>>>>> 735d2f6237203f63c68a2c5ea351fa5c09b36e18
</script>
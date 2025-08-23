<template>
    <h1>Informe Gastos</h1>
    <AdminGastos v-if="auth.isAdmin"/>
    <SupGastos v-if="auth.isSupervisor"/>
    <AsesorGastos v-if="auth.isAsesor"/>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

import AdminGastos from '../components/Admin/AdminGastos.vue';
import SupGastos from '../components/Supervisor/SupervisorGastos.vue';
import AsesorGastos from '../components/Asesores/AsesorGastos.vue';

const auth = useAuthStore()

</script>
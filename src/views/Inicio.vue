<template>
    <h1>Tarjetas</h1>
    <AdminIncio  />
    <SupervisorIncio v-if="auth.isSupervisor" />
    <AsesorIncio v-if="auth.isAsesor" />
</template>


<script setup>

import { useAuthStore } from '@/stores/auth'

import AdminIncio from '@/components/Admin/AdminInicio.vue'
import SupervisorIncio from '@/components/Supervisor/SupervisorInicio.vue'
import AsesorIncio from '@/components/Asesores/AsesorInicio.vue'
const auth = useAuthStore()

</script>
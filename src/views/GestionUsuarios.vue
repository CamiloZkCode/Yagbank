<template>
    <h1>Gestion Usuarios</h1>
    <AdminUsuario v-if="auth.isAdmin"/>
    <SupervisorUsuario v-if="auth.isSupervisor" />
</template>

<script setup> 

import { useAuthStore } from '@/stores/auth'
import AdminUsuario from '@/components/Admin/AdminUsuarios.vue'
import SupervisorUsuario from '@/components/Supervisor/SupervisorUsuarios.vue'

const auth = useAuthStore()

</script>
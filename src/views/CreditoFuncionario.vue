<template>
    <h1>Creditos Funcionarios</h1>
    <AdminCreditoFun v-if="auth.isAdmin" />
    <SupCreditoFun v-if="auth.isSupervisor" />
    <AseCreditoFun v-if="auth.isAsesor" />
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

import AdminCreditoFun from '@/components/Admin/AdminCreditoFun.vue'
import SupCreditoFun from '@/components/Supervisor/SupervisorCreditoFun.vue'
import AseCreditoFun from '@/components/Asesores/AsesorCreditoFun.vue'

const auth = useAuthStore()

</script>
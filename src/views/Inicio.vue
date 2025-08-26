<template>
  <div>
    <h1>Tarjetas</h1>
    <AdminIncio />
    <SupervisorIncio v-if="auth.isSupervisor" />
    <AsesorIncio v-if="auth.isAsesor" />
    
    <!-- Modal para datos personales -->
    <div v-if="mostrarModalDatos" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Completar Datos Personales</h2>
          <p>Es necesario completar esta información para continuar</p>
        </div>
        
        <form @submit.prevent="guardarDatos" class="modal-form">
          <div class="form-group">
            <label for="rh_asesor">RH (Tipo de Sangre)</label>
            <input 
              type="text" 
              id="rh_asesor" 
              v-model="datos.rh_asesor" 
              placeholder="Ej: O+"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="alergias">Alergias</label>
            <textarea 
              id="alergias" 
              v-model="datos.alergias" 
              placeholder="Lista cualquier alergia que tengas"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="nom_familiar">Nombre de Familiar</label>
            <input 
              type="text" 
              id="nom_familiar" 
              v-model="datos.nom_familiar" 
              placeholder="Nombre completo del familiar"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="tel_familiar">Teléfono de Familiar</label>
            <input 
              type="tel" 
              id="tel_familiar" 
              v-model="datos.tel_familiar" 
              placeholder="Número de contacto de emergencia"
              required
            >
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn-primary" :disabled="cargando">
              {{ cargando ? 'Guardando...' : 'Guardar y Continuar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch,computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { agregarDatosUsuario, verificarDatosUsuario } from '@/services/usuario'
import alertify from 'alertifyjs'

import AdminIncio from '@/components/Admin/AdminInicio.vue'
import SupervisorIncio from '@/components/Supervisor/SupervisorInicio.vue'
import AsesorIncio from '@/components/Asesores/AsesorInicio.vue'

const auth = useAuthStore()
const usuarioLogueado = computed(() => auth.user)

// Estado para el modal y datos
const mostrarModalDatos = ref(false)
const cargando = ref(false)
const datos = ref({
  id_datos: usuarioLogueado.value?.id || null, 
  rh_asesor: '',
  alergias: '',
  nom_familiar: '',
  tel_familiar: ''
})

// Verificar si se requieren datos al cargar el componente
onMounted(async () => {
  await verificarDatosRequeridos()
})

// También verificar cuando cambia el estado de autenticación
watch(() => auth.isAuthenticated, async (newVal) => {
  if (newVal) {
    await verificarDatosRequeridos()
  }
})

// Función para verificar si se requieren datos
const verificarDatosRequeridos = async () => {
  if (!auth.isAuthenticated) return
  
  try {
    const response = await verificarDatosUsuario()
    if (response.requiereDatos || !response.registrado) {
      mostrarModalDatos.value = true
    }
  } catch (error) {
    console.error('Error verificando datos:', error)
  }
}

// Función para guardar los datos
const guardarDatos = async () => {
  cargando.value = true
  try {
    console.log('Datos usuario logueado:', usuarioLogueado.value)
    await agregarDatosUsuario(datos.value)
    console.log(datos.value)
    alertify.success('Datos personales guardados correctamente')
    mostrarModalDatos.value = false
    // Actualizar el estado en el store
    auth.setDatosCompletados()
  } catch (error) {
    console.error('Error al guardar datos:', error)
    alertify.error(error.message || 'Error al guardar los datos')
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
/* Estilos para el modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0 0 8px 0;
  color: #333;
}

.modal-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.modal-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  padding-top: 16px;
  text-align: right;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}
</style>
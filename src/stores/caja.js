import { ref } from 'vue';
import { defineStore } from 'pinia';
import { obtenerCajaPorRol } from '@/services/caja.js';
import { useAuthStore } from '@/stores/auth';

export const useCajaStore = defineStore('caja', () => {
  const mostrarModalAviso = ref(false);
  const authStore = useAuthStore();

  const checkAvisoTime = async () => {
    if (!authStore.user) return; // No ejecutar si no hay usuario autenticado

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const fecha = now.toISOString().split('T')[0];

    if (hours === 23 && minutes >= 55 &&  minutes <=58) { // Mostrar entre 23:55 y 23:58
      try {
        const data = await obtenerCajaPorRol({
          id_usuario: authStore.user.id,
          rol: authStore.user.rol,
          fecha
        });
        mostrarModalAviso.value = data.Estado_caja === 1; // Mostrar solo si la caja está abierta
      } catch (error) {
        console.error('Error verificando estado de caja:', error);
        mostrarModalAviso.value = false; // Ocultar modal en caso de error
      }
    } else {
      mostrarModalAviso.value = false; // Ocultar modal fuera del horario
    }
  };

  const startAvisoTimer = () => {
    const notificationTimer = setInterval(checkAvisoTime, 60000); // Chequear cada minuto
    return () => clearInterval(notificationTimer); // Retornar función de limpieza
  };

  return {
    mostrarModalAviso,
    startAvisoTimer,
  };
});
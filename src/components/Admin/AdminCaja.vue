<template>
    <div class="global">
        <h1>Caja {{ userName }}</h1>
        <div class="contenedor-caja">
            <div class="cabecera-formulario">
                <div class="fecha-centrada">{{ formattedDate }}</div>
                <router-link to="/caja-mes" class="enlace-calendario">
                    <img class="icono-boton icono-calendario" src="/src/assets/icons/CajaMensual.png" alt="">
                </router-link>
            </div>

            <div class="caja-diaria" :class="{ 'caja-cerrada': cajaCerrada }">
                <form action="">
                    <div class=" punto-formulario">
                        <label class="entra">Ingresos:</label>
                        <input type="number" :value="formulario.total_ingresos" readonly
                            :class="{ 'input-cerrado': cajaCerrada }">
                    </div>
                    <div class="punto-formulario">
                        <label class="entra">Caja Inicial:</label>
                        <input type="number" :value="formulario.caja_inicial" readonly
                            :class="{ 'input-cerrado': cajaCerrada }">
                    </div>
                    <div class="punto-formulario">
                        <label class="entra">Recogida:</label>
                        <input type="number" :value="formulario.total_cobrado" readonly
                            :class="{ 'input-cerrado': cajaCerrada }">
                    </div>
                    <div class="punto-formulario">
                        <label class="sale">Prestamos:</label>
                        <input type="number" :value="formulario.total_prestado" readonly
                            :class="{ 'input-cerrado': cajaCerrada }">
                    </div>
                    <div class="punto-formulario">
                        <label class="sale">Gastos:</label>
                        <input type="number" :value="formulario.total_gastos" readonly
                            :class="{ 'input-cerrado': cajaCerrada }">
                    </div>

                    <div class="punto-formulario">
                        <label class="sale">Clavos Total:</label>
                        <input type="number" :value="formulario.clavos_dia" readonly
                            :class="{ 'input-cerrado': cajaCerrada }">
                    </div>
                    <div class="punto-formulario">
                        <label class="sale">Clientes Clavo:</label>
                        <input type="number" :value="formulario.clientes_clavos_totales" readonly
                            :class="{ 'input-cerrado': cajaCerrada }">
                    </div>
                    <div class="punto-formulario">
                        <label class="entra">Caja:</label>
                        <input type="number" :value="formulario.caja_final" readonly
                            :class="{ 'input-cerrado': cajaCerrada }">
                    </div>

                    <div class="contenedor-boton">
                        <button @click.prevent="confirmarCuadre" :disabled="cajaCerrada">CONFIRMAR CUADRE</button>
                    </div>
                </form>
            </div>


          

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { obtenerCajaPorRol, cerrarCaja, GenerarCaja, verificarCajasDependientes } from '@/services/caja.js';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const cajaCerrada = ref(false);
const userName = computed(() => authStore.user?.nombre || 'Usuario no identificado');
const formattedDate = computed(() => formulario.value.fecha);

const formulario = ref({
    fecha: new Date().toISOString().split('T')[0],
    caja_inicial: 0,
    caja_final: 0,
    total_cobrado: 0,
    total_prestado: 0,
    total_ingresos: 0,
    total_gastos: 0,
    clavos_dia: 0,
    clientes_clavos_totales: 0,
    Estado_caja: 1
});

// Cargar datos de la caja
const cargarCaja = async () => {
    try {
        if (!authStore.user) return;

        // Obtener datos del backend
        const data = await obtenerCajaPorRol({
            id_usuario: authStore.user.id,
            rol: authStore.user.rol,
            fecha: formulario.value.fecha
        });

        // Generar/actualizar solo si caja está abierta
        if (data.Estado_caja === 1) {
            await GenerarCaja({
                id_usuario: authStore.user.id,
                fecha: formulario.value.fecha
            });
            // Recargar datos actualizados después de generar
            const updatedData = await obtenerCajaPorRol({
                id_usuario: authStore.user.id,
                rol: authStore.user.rol,
                fecha: formulario.value.fecha
            });
            // Asignar datos actualizados al formulario
            Object.assign(formulario.value, {
                fecha: updatedData.fecha || formulario.value.fecha,
                caja_inicial: Number(updatedData.caja_inicial) || 0,
                caja_final: Number(updatedData.caja_final) || 0,
                total_cobrado: Number(updatedData.total_cobrado) || 0,
                total_prestado: Number(updatedData.total_prestado) || 0,
                total_ingresos: Number(updatedData.total_ingresos) || 0,
                total_gastos: Number(updatedData.total_gastos) || 0,
                clavos_dia: Number(updatedData.clavos_dia) || 0,
                clientes_clavos_totales: Number(updatedData.clientes_clavos_totales) || 0,
                Estado_caja: updatedData.Estado_caja || 1
            });
            cajaCerrada.value = updatedData.Estado_caja === 0;
        } else {
            // Si caja cerrada, asignar datos directamente
            Object.assign(formulario.value, {
                fecha: data.fecha || formulario.value.fecha,
                caja_inicial: Number(data.caja_inicial) || 0,
                caja_final: Number(data.caja_final) || 0,
                total_cobrado: Number(data.total_cobrado) || 0,
                total_prestado: Number(data.total_prestado) || 0,
                total_ingresos: Number(data.total_ingresos) || 0,
                total_gastos: Number(data.total_gastos) || 0,
                clavos_dia: Number(data.clavos_dia) || 0,
                clientes_clavos_totales: Number(data.clientes_clavos_totales) || 0,
                Estado_caja: data.Estado_caja || 1
            });
            cajaCerrada.value = data.Estado_caja === 0;
        }
    } catch (error) {
        console.error("Error cargando caja:", error);
    }
};

// Polling para actualizaciones
// Polling para actualizaciones
let pollingInterval;
let notificationTimer;

const checkAutoCloseTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours === 20 && minutes < 26 && !cajaCerrada.value) {
        cargarCaja(); // Recargar para reflejar cierre automático
    }
};

onMounted(async () => {
    await cargarCaja();
    pollingInterval = setInterval(cargarCaja, 30000); // Actualizar cada 30 segundos
    notificationTimer = setInterval(checkAutoCloseTime, 60000); // Chequear cada minuto
});

onUnmounted(() => {
    clearInterval(pollingInterval);
    clearInterval(notificationTimer);
});

const confirmarCuadre = async () => {
    try {
        if (!authStore.user) return;

        await cargarCaja();

        if (['Supervisor', 'Administrador'].includes(authStore.user.rol)) {
            const response = await verificarCajasDependientes(formulario.value.fecha); // Sin objeto, solo fecha
            if (response.count > 0) {
                const nombres = response.cajasAbiertas.map(c => c.nombre).join(', ');
                return alert(`No se puede cerrar la caja. Las siguientes cajas están abiertas: ${nombres}`);
            }
        }

        const response = await cerrarCaja();

        if (response.message === "Caja cerrada con éxito") {
            // Actualizar estado localmente
            formulario.value.Estado_caja = 0;
            cajaCerrada.value = true;
            // Asignar los valores devueltos por cerrarCaja para evitar duplicación
            Object.assign(formulario.value, {
                fecha: response.fecha || formulario.value.fecha,
                caja_inicial: Number(response.caja_inicial) || 0,
                caja_final: Number(response.caja_final) || 0,
                total_cobrado: Number(response.total_cobrado) || 0,
                total_prestado: Number(response.total_prestado) || 0,
                total_ingresos: Number(response.total_ingresos) || 0,
                total_gastos: Number(response.total_gastos) || 0,
                clavos_dia: Number(response.clavos_dia) || 0,
                clientes_clavos_totales: Number(response.clientes_clavos_totales) || 0,
                Estado_caja: 0
            });
            alert('Caja cerrada correctamente');
        }
    } catch (error) {
        console.error('Error al cerrar la caja:', error);
        alert(error?.error || error?.message || 'Error al cerrar la caja');
    }
};
</script>

<style scoped>
.global {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
}

.contenedor-caja {
    width: 1000px;
    border: 1px solid var(--color-info-luz);
    position: relative;
    background: var(--color-blanco);
    border-radius: 1rem;
    margin-top: 1rem;


}

.cabecera-formulario {
    position: relative;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--color-info-luz);
}

.enlace-calendario {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    text-decoration: none;
}

.icono-calendario {
    margin-top: 0.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.icono-boton {
    width: 2.5rem;
    height: 2.5rem;
    object-fit: contain;
}

.entra {
    color: var(--color-azul-1);
}

.sale {
    color: var(--color-rojo-5);
}

/* Asegúrate de que la fecha quede centrada */
.fecha-centrada {
    font-size: 1.1rem;
    font-weight: 500;
    text-align: center;
    width: 100%;
}

.caja-diaria {
    padding: 1.5rem;

}

.caja-diaria form {
    width: 100%;
    max-width: 100%;

}

.punto-formulario {
    display: flex;
    align-items: center;
    padding: 0.48rem;
    border-bottom: 1px solid var(--color-info-luz);
}

.punto-formulario label {
    text-align: left;
    left: 0;
    width: 1000px;
    padding-right: 2rem;
    font-size: 1.1rem;
    font-weight: 500;
}

.punto-formulario input {
    flex-grow: 1;
    padding: 0.5rem;
    border-radius: 4px;
    font-weight: 550;
    width: 200px;
    font-size: 1.1rem;
    text-align: right;
}

.caja-cerrada {
    background-color: var(--color-aprobado-1);
    opacity: 0.8;
}

.input-cerrado {
    background-color: var(--color-aprobado-1);
    color: var(--color-blanco);
}

button:disabled {
    background-color: var(--color-gris-2);
    cursor: not-allowed;
    opacity: 0.6;
}

.punto-formulario input::-webkit-outer-spin-button,
.punto-formulario input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.contenedor-boton {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
    width: 100%;
}

button {
    width: 90%;
    max-width: 800px;
    padding: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    background: var(--color-azul-1);
    color: var(--color-blanco);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background: var(--color-aprobado-1);
}


/* Estilos del modal */

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
}

.modal-content {
    background: var(--color-background);
    padding: 2rem;
    border-radius: 10px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}



.modal-content p {
  margin-bottom: 1rem;
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem; 
}

.modal-content button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  width: 150px; 
}


/*=============================Media Querry=========================================*/


@media screen and (max-width: 768px) {
    .global {
        padding: 0.5rem;
    }

    .contenedor-caja {
        width: 100%;
        max-width: 100%;
    }

    .cabecera-formulario {
        height: 35px;
    }

    .fecha-centrada {
        font-size: 1rem;
    }

    .icono-calendario {
        right: 10px;
        padding: 0.3rem;
        font-size: 1.3rem;
    }

    .caja-diaria {
        padding: 1rem;
    }

    .punto-formulario {
        flex-wrap: nowrap;
        margin-bottom: 1rem;
        padding: 0.3rem;
    }


    .punto-formulario label {
        width: 40%;
        min-width: 120px;
        text-align: left;
        font-size: 0.95rem;
        padding-right: 0;
    }

    .punto-formulario input {
        width: 60%;
        max-width: 250px;
        padding: 0.5rem;
        font-size: 0.95rem;
    }

    .contenedor-boton {
        margin: 1.5rem 0;
    }

    button {
        width: 100%;
        max-width: 100%;
        padding: 0.8rem;
    }
}
</style>
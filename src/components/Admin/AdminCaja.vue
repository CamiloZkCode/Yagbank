<template>
    <div class="global">
        <h1>Caja {{ authStore.user.nombre }}</h1>
        <div class="contenedor-caja">
            <div class="cabecera-formulario">
                <div class="fecha-centrada">{{ formatoFecha(formulario.fecha) }}</div>
                <router-link to="/caja-mes" class="enlace-calendario">
                    <img class="icono-boton icono-calendario" src="/src/assets/icons/CajaMensual.png" alt="">
                </router-link>
            </div>

            <div class="caja-diaria ">
                <form action="">
                    <div class="punto-formulario">
                        <label class="entra">Ingresos:</label>
                        <input type="number" :value="formulario.ingresos" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label class="entra">Caja Inicial:</label>
                        <input type="number" :value="formulario.cajaInicial" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label class="entra">Recogida:</label>
                        <input type="number" :value="formulario.recogida" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label class="sale">Prestamos:</label>
                        <input type="number" :value="formulario.prestamos" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label class="sale">Gastos:</label>
                        <input type="number" :value="formulario.gastos" readonly>
                    </div>

                    <div class="punto-formulario">
                        <label class="sale">Clavos Total:</label>
                        <input type="number" :value="formulario.clavosTotal" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label class="sale">Clientes Clavo:</label>
                        <input type="number" :value="formulario.clientesClavo" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label class="entra">Caja:</label>
                        <input type="number" :value="formulario.cajaFinal" readonly>
                    </div>

                    <div class="contenedor-boton">
                        <button @click.prevent="confirmarCuadre">CONFIRMAR CUADRE</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { obtenerCajaPorRol, cerrarCaja, GenerarCaja } from '@/services/caja.js';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Función para obtener la fecha local en formato YYYY-MM-DD
function obtenerFechaLocalISO() {
    const tzOffset = new Date().getTimezoneOffset() * 60000; // milisegundos de diferencia con UTC
    return new Date(Date.now() - tzOffset).toISOString().split('T')[0];
}

const formulario = ref({
    fecha: obtenerFechaLocalISO(),
    ingresos: 0,
    cajaInicial: 0,
    recogida: 0,
    prestamos: 0,
    gastos: 0,
    cajaFinal: 0,
    clavosTotal: 0,
    clientesClavo: 0
});

// Cargar datos de la caja
onMounted(async () => {
    try {
        // Generar caja antes de obtenerla
        await GenerarCaja({
            id_usuario: authStore.user.id,
            fecha: formulario.value.fecha
        });

        // Consultar la caja por rol
        const data = await obtenerCajaPorRol({
            params: {
                id_usuario: authStore.user.id,
                rol: authStore.user.rol,
                fecha: formulario.value.fecha
            }
        });

        // Si hay datos, llenar el formulario
        if (data.length > 0) {
            const caja = data[0];
            formulario.value = {
                fecha: caja.fecha,
                ingresos: caja.total_ingresos,
                cajaInicial: caja.caja_inicial,
                recogida: caja.total_cobrado,
                prestamos: caja.total_prestado,
                gastos: caja.total_gastos,
                cajaFinal: caja.caja_final,
                clavosTotal: caja.clavos_dia,
                clientesClavo: caja.clientes_clavos_totales
            };
        }
    } catch (error) {
        console.error("Error cargando caja:", error);
    }
});

const formatoFecha = (fechaISO) => {
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(fechaISO).toLocaleDateString('es-ES', opciones);
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
<template>
    <div>
        <!-- Tabla -->
        <div class="contenedor-tabla">
            <div class="contenedor-solicitudes">
                <div class="tarjeta-solicitud" v-for="solicitud in pendientes" :key="solicitud.id_prestamo">
                    <div class="icono">
                        <img class="icono-boton" src="/src/assets/Icons/Usuario.png" alt="Usuario" />
                    </div>
                    <div class="derecha">
                        <div class="info">
                            <h4>{{ solicitud.nombre_funcionario }}</h4>
                            <small class="text-muted">
                                Solicita un adelanto de ${{solicitud.monto}}
                            </small>
                        </div>
                    </div>
                    <img class="icono-boton" src="/src/assets/Icons/aceptar.png" alt="Aceptar"
                        @click="aprobarPrestamo(solicitud.id_prestamo)" />
                    <img class="icono-boton" src="/src/assets/Icons/cerrar.png" alt="Denegar"
                        @click="rechazarPrestamo(solicitud.id_prestamo)" />
                </div>
                <div v-if="pendientes.length === 0" class="sin-solicitudes">
                    No hay solicitudes pendientes.
                </div>
            </div>

            <div class="filtros">
                <div class="filtro-nombre">
                    <input class="filtro-nom" type="text" placeholder="Busqueda por nombre" v-model="filtroNombre" />
                    <span class="material-symbols-outlined">search</span>
                </div>
            </div>

            <div class="tabla-scrollable">
                <table class="tabla-funcionarios">
                    <thead>
                        <tr>
                            <th class="columna-min">Fecha</th>
                            <th>Funcionario</th>
                            <th>Autorizo</th>
                            <th>Monto</th>
                            <th>Abono</th>
                            <th>Saldo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="prestamo in prestamosFiltrados" :key="prestamo.id_prestamo">
                            <td>{{ formatDate(prestamo.fecha) }}</td>
                            <td class="nombre">{{ prestamo.nombre_funcionario }}</td>
                            <td class="nombre">{{ prestamo.autorizado_por || '-' }}</td>
                            <td>${{ prestamo.monto }}</td>
                            <td>${{ prestamo.abono }}</td>
                            <td>${{ prestamo.saldo }}</td>
                            <td>
                                <img v-if="prestamo.estado === 'Aprobado'" class="icono-boton"
                                    src="/src/assets/Icons/Bloqueo.png" alt="Liquidar"
                                    @click="liquidarPrestamo(prestamo.id_prestamo)" title="Liquidar préstamo">
                            </td>
                        </tr>
                        <tr v-if="prestamosFiltrados.length === 0">
                            <td colspan="8">No hay préstamos registrados</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
    obtenerSolicitudesPendientes,
    obtenerPrestamosAceptados,
    aceptarPrestamo as apiAceptarPrestamo,
    rechazarPrestamo as apiRechazarPrestamo,
    liquidarPrestamo as apiLiquidarPrestamo
} from '@/services/funcionariocredito'
import alertify from 'alertifyjs'
import 'alertifyjs/build/css/alertify.css'

const authStore = useAuthStore()

// Datos
const pendientes = ref([])
const prestamos = ref([])
const filtroNombre = ref('')


const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES')
}

// Filtros
const prestamosFiltrados = computed(() => {
    return prestamos.value.filter(prestamo =>
        prestamo.nombre_funcionario.toLowerCase().includes(filtroNombre.value.toLowerCase())
    )
})

// Cargar datos
const cargarDatos = async () => {
    try {
        const [pendientesRes, aprobadosRes] = await Promise.all([
            obtenerSolicitudesPendientes(),
            obtenerPrestamosAceptados()
        ])

        pendientes.value = pendientesRes.data || []
        prestamos.value = aprobadosRes.data || []
    } catch (error) {
        console.error('Error al cargar datos:', error)
        alertify.error('Error al cargar los préstamos')
    }
}

// Acciones
const aprobarPrestamo = async (id) => {
    try {
        await apiAceptarPrestamo(id);
        alertify.success('Préstamo aprobado correctamente');
        await cargarDatos();
    } catch (error) {
        console.error('Error al aprobar:', error);
        const message = error.response?.data?.message || error.message || 'Error desconocido';
        alertify.error(`Error al aprobar el préstamo: ${message}`);
    }
};

const rechazarPrestamo = async (id) => {
    try {
        await apiRechazarPrestamo(id)
        alertify.success('Préstamo rechazado correctamente')
        cargarDatos()
    } catch (error) {
        console.error('Error al rechazar:', error)
        alertify.error('Error al rechazar el préstamo')
    }
}

const liquidarPrestamo = async (id) => {
    try {
        await apiLiquidarPrestamo(id)
        alertify.success('Préstamo liquidado correctamente')
        cargarDatos()
    } catch (error) {
        console.error('Error al liquidar:', error)
        alertify.error('Error al liquidar el préstamo')
    }
}

// Inicializar
onMounted(() => {
    cargarDatos()
})
</script>

<style scoped>
.icono-boton {
    width: 1.5rem;
    height: 1.5rem;
    object-fit: contain;
    cursor: pointer;
    transition: all 300ms ease-in;
}

.icono-boton:hover {
    transform: scale(1rem);
}

.contenedor-solicitudes {
    margin-top: 1rem;
    padding: var(--card-padding);
    border-radius: var(--border-radius-3);
    box-shadow: var(--box-shadow);
    background: var(--color-blanco);
    max-height: 28vh;
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: none;
}

.contenedor-solicitudes::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari */
}


.contenedor-solicitudes h2 {
    margin-bottom: 0.8rem;
}

.contenedor-solicitudes .tarjeta-solicitud {
    display: inline-flex;
    /* Clave para que se comporten en scroll horizontal */
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 300ms ease;
    border: 1px solid var(--color-light);
    border-radius: 1rem;
    margin-top: 0.5rem;
    padding: 0.8rem;
}

.contenedor-solicitudes:hover {
    box-shadow: none;
}

.contenedor-solicitudes .tarjeta-solicitud .derecha {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin: 0;
    width: 100%;
}

/*=========================Filtro Tabla==========================*/

.filtros {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0 0.5rem;
    align-items: center;
}

.filtro-nombre {
    display: flex;
    align-items: center;
    background: var(--color-blanco);
    padding: 0 0.6rem;
    border-radius: 0.4rem;
    border: 1px solid var(--color-info-luz);
    width: 18rem;
}

.filtro-nombre .filtro-nom {
    border: none;
    outline: none;
    background: transparent;
    flex: 1;
    padding: 0.8rem;
    font-size: 1rem;
    justify-content: center;
    margin: 0;
    color: var(--color-oscuro);
}

.filtro-nombre .material-symbols-outlined {
    margin-left: 0.5rem;
    font-size: 1.4rem;
    color: var(--color-oscuro);
    cursor: pointer;
}


/*=====================Tabla============*/
.tabla-scrollable {
    max-height: 60vh;
    overflow-x: auto;
    white-space: nowrap;
    margin-top: 0.5rem;
    background: var(--color-blanco);
    border-radius: var(--card-border-radius);
    box-shadow: var(--box-shadow);
    padding: var(--card-padding);
    transition: all 300ms ease;

}

.tabla-scrollable::-webkit-scrollbar {
    height: 0.5rem;
}

.tabla-scrollable::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 0.8rem;
}

.contenedor-tabla .tabla-funcionarios {
    width: auto;
    min-width: 100%;
    border-collapse: collapse;
}

.contenedor-tabla table {
    text-align: center;
    transition: all 300ms ease;
    margin-top: 0.5rem;
    font-size: 1rem;
    width: 100%;
    padding: 0;
    box-shadow: none;
    background: transparent;
}

.contenedor-tabla .tabla-scrollable:hover {
    box-shadow: none;
}

table tbody td {
    height: 3rem;
    border-bottom: 1px solid var(--color-light);
    color: var(--color-dark-variant);
}


.contenedor-tabla .tabla-funcionarios .estado {
    background: var(--color-aprobado-1);
    color: var(--color-blanco);
    border-radius: var(--card-border-radius);
    padding: 0.5rem 0rem;
    margin: 0.5rem 0rem;
}


table tbody tr:last-child td {
    border: none;
}


.ver-mas {
    cursor: pointer;
    color: var(--color-azul-1);
}

.fila-expandida {
    background: var(--color-blanco);
    color: var(--color-oscuro);

}

.info-extra {
    padding: 0.5rem 1rem;
    font-size: 0.95rem;
}

.estado-funcionario {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.estado-funcionario .aceptar {
    background-color: var(--color-aprobado-1);
}

.estado-funcionario .denegar {
    background-color: var(--color-rojo-5);
}

/*======================Media Querry====================*/

@media screen and (max-width: 768px) {

    /*==============Modales===========================*/
    .modal-content {
        width: 90%;
        height: auto;
        max-height: 90vh;
        overflow-y: auto;
        padding: 1.5rem;
        font-size: 0.9rem;
    }


    .close-icon {
        font-size: 24px;
        top: 8px;
        right: 8px;
    }

    .modal-content h2 {
        font-size: 1.3rem;
        margin-bottom: 1rem;
    }

    .modal-content input,
    .modal-content select {
        font-size: 1.2rem;
        padding: 0.6rem;
    }

    .modal-content button {
        font-size: 0.9rem;
        padding: 0.6rem 1rem;
    }



    /*===================tabla ======================*/

    input,
    select {
        font-size: 0.9rem;
        padding: 0.6rem;
    }

    .filtros {
        flex-direction: column;
        align-items: stretch;
        align-items: center;
        gap: 1rem;
    }

    .filtro-cedula {
        width: 80%;
        max-width: 100%;
    }

    .filtro-cargo select {
        width: 100%;
        max-width: 100%;
    }


    .tabla-scrollable {
        height: 60vh;
    }


    .contenedor-tabla {
        position: relative;
    }

    .contenedor-tabla .tabla-funcionarios {
        min-width: 200%;
    }

    .contenedor-tabla table {
        width: 100%;
        margin-top: 1rem;
        font-size: 1rem;
    }

    .contenedor-tabla .tabla-funcionarios td,
    th {
        word-wrap: break-word;
        white-space: normal;
    }


    .contenedor-tabla table span {
        font-size: 1.5rem;
        cursor: pointer;
    }

    .fila-expandida {
        font-size: 1rem;
        overflow-x: auto;
        max-width: 100%;
        box-sizing: border-box;
    }

    .fila-expandida .info-extra {
        white-space: initial;
    }
}
</style>

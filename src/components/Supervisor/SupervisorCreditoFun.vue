<template>
    <div>
        <div class="contenedor-botones">
            <button class="prestamo" @click="mostrarPrestamo = true">
                Préstamo Funcionario
                <img class="icono-boton" src="/src/assets/Icons/NuevoCredito1.png" alt="Nuevo Crédito">
            </button>
        </div>

        <!-- Modal Prestamo Funcionario -->
        <div v-if="mostrarPrestamo" class="modal-overlay">
            <div class="modal-content">
                <span class="material-symbols-outlined close-icon" @click="cerrarModal">close</span>
                <h2>Registrar Préstamo</h2>
                <form @submit.prevent="guardarPrestamo">
                    <label>Fecha de Solicitud:</label>
                    <input :value="fechaActual" type="date" readonly />
                    <label>Valor del Préstamo:</label>
                    <input v-model="prestamo.valor_prestamo" type="number" min="1" required
                        placeholder="Ingrese el monto" />
                    <button type="submit">Guardar Préstamo</button>
                </form>
            </div>
        </div>

        <!-- Tabla -->
        <div class="contenedor-tabla">
            <div class="filtros">
                <div class="filtro-nombre">
                    <input class="filtro-nom" type="text" placeholder="Búsqueda por nombre" v-model="filtroNombre" />
                    <span class="material-symbols-outlined">search</span>
                </div>
            </div>

            <div class="tabla-scrollable">
                <table class="tabla-clientes">
                    <thead>
                        <tr>
                            <th class="columna-min">Fecha</th>
                            <th>Funcionario</th>
                            <th>Monto</th>
                            <th>Abono</th>
                            <th>Saldo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="prestamo in FuncionarioFiltro" :key="prestamo.id_prestamo">
                            <td>{{ formatDate(prestamo.fecha) }}</td>
                            <td>{{ prestamo.nombre_funcionario }}</td>
                            <td>${{ prestamo.monto }}</td>
                            <td>${{ prestamo.abono }}</td>
                            <td>${{ prestamo.saldo }}</td>
                            <td>{{ prestamo.estado }}</td>
                        </tr>
                        <tr v-if="FuncionarioFiltro.length === 0">
                            <td colspan="6">No hay préstamos aprobados disponibles.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { crearPrestamoFuncionario, obtenerPrestamosAceptados } from '@/services/funcionariocredito';
import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';

const authStore = useAuthStore();
const usuarioLogueado = computed(() => authStore.user);

// Modales
const mostrarPrestamo = ref(false);

// Fecha actual para visualización
const fechaActual = computed(() => new Date().toISOString().substring(0, 10));

// Prestamo
const prestamo = ref({
    valor_prestamo: null,
});

// Lista de préstamos
const PrestamosFuncionario = ref([]);
const filtroNombre = ref('');

const FuncionarioFiltro = computed(() =>
    PrestamosFuncionario.value.filter((prestamo) =>
        prestamo.nombre_funcionario.toLowerCase().includes(filtroNombre.value.toLowerCase())
    )
);

const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES')
}

// Cargar préstamos aprobados al montar el componente
onMounted(async () => {
    try {
        const response = await obtenerPrestamosAceptados();
        PrestamosFuncionario.value = response.data || [];
    } catch (error) {
        console.error('Error al cargar préstamos:', error);
        PrestamosFuncionario.value = [];
    }
});

// Guardar préstamo con alertify
const guardarPrestamo = async () => {
    try {
        await crearPrestamoFuncionario({
            monto: prestamo.value.valor_prestamo,
            creado_por: usuarioLogueado.value.id
        });

        alertify.alert(
            'Préstamo solicitado con éxito',
            `
                <strong>Monto:</strong> ${prestamo.value.valor_prestamo}<br>
                <strong>Fecha:</strong> ${fechaActual.value}
            `,
            async function () {
                cerrarModal();
                const response = await obtenerPrestamosAceptados();
                PrestamosFuncionario.value = response.data || [];
            }
        ).set({
            transition: 'fade',
            movable: false,
            resizable: false,
            pinnable: false,
            closable: true
        });

    } catch (error) {
        console.error('Error al crear préstamo:', error);
        alertify.error('Error al crear préstamo: ' + (error.response?.data?.message || error.message));
    }
};

// Limpiar formulario y cerrar modal
const cerrarModal = () => {
    prestamo.value = { valor_prestamo: null };
    mostrarPrestamo.value = false;
};
</script>


<style scoped>
.contenedor-botones {
    margin-top: 1.5rem;
    align-items: center;
    justify-content: center;
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.contenedor-botones .prestamo {
    background: var(--color-naranja-3);
}

button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 1.2rem;
    font-size: 1rem;
    background: var(--color-azul-1);
    color: var(--color-blanco);
    border: none;
    border-radius: 0.4rem;
    cursor: pointer;
    height: 2.2rem;
    line-height: 1;
    box-shadow: 0 5px 6px rgba(0, 0, 0, 0.2);

}


input,
select {
    display: block;
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
    border: 1px solid var(--color-info-luz);
    border-radius: 6px;
}

.icono-boton {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
}

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
    border-radius: var(--card-border-radius);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}

.modal-content::-webkit-scrollbar {
    height: 0.5rem;
}

.modal-content::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 0.8rem;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.close-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 28px;
    color: var(--color-rojo-5);
}

.close-icon:hover {
    color: var(--color-rojo-5);
}

.contenedor-tabla {
    margin-top: 1.0rem;
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
    width: 16rem;
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

.contenedor-tabla .tabla-clientes {
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


.contenedor-tabla .tabla-clientes .estado {
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

    .contenedor-tabla .tabla-clientes {
        min-width: 170%;
    }

    .contenedor-tabla table {
        width: 100%;
        margin-top: 1rem;
        font-size: 1.1rem;
    }

    .contenedor-tabla .tabla-clientes td,
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

<template>
    <div>
        <div class="contenedor-tabla">
            <!-- Filtros -->
            <div class="filtros">
                <div class="filtro-nombre">
                    <input class="filtro-nom" type="text" placeholder="Buscar por nombre" v-model="filtroNombre" />
                    <span class="material-symbols-outlined">search</span>
                </div>
            </div>

            <!-- Tabla de gastos -->
            <div class="tabla-scrollable">
                <table class="tabla-gastos">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Nombre</th>
                            <th>Cargo</th>
                            <th>Tipo Gasto</th>
                            <th>Valor</th>
                            <th></th>

                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="gasto in gastosFiltrados" :key="gasto.id_gasto">
                            <tr>
                                <td>{{ formatDate(gasto.fecha) }}</td>
                                <td>{{ gasto.usuario }}</td>
                                <td>{{ gasto.cargo }}</td>
                                <td>{{ gasto.tipo_gasto }}</td>
                                <td>${{ gasto.valor }}</td>
                                <td>
                                    <span class="material-symbols-outlined ver-mas"
                                        @click="toggleExpand(gasto.id_gasto)">
                                        {{ usuarioExpandido === gasto.id_gasto ? 'keyboard_double_arrow_up' :
                                            'keyboard_double_arrow_down' }}
                                    </span>
                                </td>
                            </tr>

                            <tr v-if="usuarioExpandido === gasto.id_gasto">
                                <td colspan="7" class="fila-expandida">
                                    <div class="info-extra">
                                        <strong>Detalles:</strong> {{ gasto.descripcion || 'N/A' }}
                                        &nbsp;&nbsp;|&nbsp;&nbsp;
                                        <strong>Foto:</strong> {{ gasto.foto_url || 'N/A' }}
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { mostrarTodosGastos } from '@/services/gastos';

// Estado
const isLoading = ref(false);
const filtroNombre = ref('');
const gastos = ref([]);
const usuarioExpandido = ref(null);

// Alternar fila expandida
const toggleExpand = (id) => {
    usuarioExpandido.value = usuarioExpandido.value === id ? null : id;
};

// Cargar gastos al montar el componente
onMounted(async () => {
    await cargarGastos();
});

const cargarGastos = async () => {
    try {
        isLoading.value = true;
        const gastosData = await mostrarTodosGastos();
        console.log("Datos recibidos en frontend:", gastosData);
        gastos.value = gastosData?.data ?? []; // ajustar según tu backend
    } catch (error) {
        console.error("Error al cargar gastos:", error.message || error);
        alert("Error al cargar los gastos: " + (error.message || "Error desconocido"));
    } finally {
        isLoading.value = false;
    }
};

// Abrir foto en nueva pestaña
const verFoto = (url) => {
    if (url) window.open(url, '_blank');
};

// Filtrar gastos por nombre o tipo de gasto
const gastosFiltrados = computed(() => {
    return gastos.value.filter(
        (gasto) =>
            gasto.usuario?.toLowerCase().includes(filtroNombre.value.toLowerCase()) ||
            gasto.tipo_gasto?.toLowerCase().includes(filtroNombre.value.toLowerCase())
    );
});

// Formatear fecha dd/mm/yyyy
const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES')
}
</script>


<style scoped>


.icono-boton {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
}


input {
    display: block;
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
    border: 1px solid var(--color-info-luz);
    border-radius: 6px;
}

.icono-boton {
    width: 1rem;
    height: 1rem;
    object-fit: contain;
    cursor: pointer;

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

.contenedor-tabla .tabla-gastos {
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


table tbody tr:last-child td {
    border: none;
}

.ver-mas {
    color: var(--color-azul-1);
}

.fila-expandida {
    background: var(--color-blanco);
}

.info-extra {
    padding: 0.5rem 1rem;
    font-size: 0.95rem;
    color: var(--color-oscuro);
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

    .contenedor-tabla .tabla-gastos {
        min-width: 190%;
    }

    .contenedor-tabla table {
        width: 100%;
        margin-top: 1rem;
        font-size: 1.1rem;
    }

    .contenedor-tabla .tabla-gastos td,
    th {
        padding: 0rem 1rem;
    }




}
</style>
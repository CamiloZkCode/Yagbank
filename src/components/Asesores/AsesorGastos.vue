<template>
    <div>
        <div class="contenedor-botones">
            <button class="gastos" @click="mostrarGastos = true">
                Registrar Gasto
                <img class="icono-boton" src="/src/assets/Icons/GastosBoton.png" alt="">
            </button>
        </div>

        <!-- Modal Gastos -->
        <div v-if="mostrarGastos" class="modal-overlay">
            <div class="modal-content">
                <span class="material-symbols-outlined close-icon" @click="mostrarGastos = false">close</span>
                <h2>Registrar Gasto</h2>
                <form @submit.prevent="guardarGasto">
                    <!-- Nombre del Gasto -->
                    <label>Nombre del Gasto:</label>
                    <select v-model="gasto.nombre" required>
                        <option disabled value="">-- Seleccione el nombre del gasto --</option>
                        <option value="Ahorro">Ahorro</option>
                        <option value="Retiro">Retiro</option>
                        <option value="Gasolina">Gasolina</option>
                        <option value="Lavada">Lavada</option>
                        <option value="Pinchada">Pinchada</option>
                        <option value="Cambio de Aceite">Cambio de Aceite</option>
                        <option value="Internet Celular">Internet Celular</option>
                        <option value="Nomina Lider">Nómina Líder</option>
                        <option value="Nomina Encargado de Sede">Nómina Encargado de Sede</option>
                        <option value="Nomina Auditor">Nómina Auditor</option>
                        <option value="Servicio de Luz">Servicio de Luz</option>
                        <option value="Servicio de Agua">Servicio de Agua</option>
                        <option value="Servicio Internet Casa">Servicio Internet Casa</option>
                        <option value="Compra de Moto">Compra de Moto</option>
                        <option value="Impermeable">Impermeable</option>
                        <option value="Casco">Casco</option>
                        <option value="Chaleco Reflectivo">Chaleco Reflectivo</option>
                    </select>

                    <!-- Valor -->
                    <label>Valor del Gasto:</label>
                    <input v-model.number="gasto.valor" type="number" placeholder="Monto" required min="1" />

                    <!-- Descripción -->
                    <label>Descripción:</label>
                    <textarea v-model="gasto.descripcion" placeholder="Descripción" rows="3" required></textarea>

                    <!-- Foto (Opcional) -->
                    <label>Foto (Opcional):</label>
                    <input type="file" @change="handleFileUpload" accept="image/*" />

                    <!-- Fecha (automática) -->
                    <label>Fecha:</label>
                    <input v-model="gasto.fecha" type="date" readonly />

                    <button type="submit" :disabled="isLoading">Guardar Gasto</button>
                </form>
            </div>
        </div>

        <div class="contenedor-tabla">
            <div class="filtros">
                <div class="filtro-nombre">
                    <input class="filtro-nom" type="text" placeholder="Buscar por nombre" v-model="filtroNombre" />
                    <span class="material-symbols-outlined">search</span>
                </div>
            </div>

            <div class="tabla-scrollable">
                <table class="tabla-gastos">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Nombre</th>
                            <th>Monto</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="gasto in gastosFiltrados" :key="gasto.id_gasto">
                            <td>{{ formatDate(gasto.fecha) }}</td>
                            <td>{{ gasto.nombre }}</td>
                            <td>${{ gasto.valor }}</td>
                            <td>{{ gasto.descripcion }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { crearGastosCaja, obtenerGastos } from '@/services/gastos';

// Estado
const mostrarGastos = ref(false);
const isLoading = ref(false);
const filtroNombre = ref('');
const gastos = ref([]);

// Gasto nuevo
const gasto = ref({
    nombre: '',
    valor: null,
    fecha: new Date().toISOString().substring(0, 10),
    descripcion: '',
});

// Cargar gastos al montar el componente
onMounted(async () => {
    await cargarGastos();
});

// Cargar gastos del usuario autenticado
const cargarGastos = async () => {
    try {
        isLoading.value = true;
        const response = await obtenerGastos();
        gastos.value = response.data.map(gasto => ({
            id_gasto: gasto.id_gasto,
            fecha: gasto.fecha,
            nombre: gasto.nombre,
            valor: gasto.valor,
            descripcion: gasto.descripcion,
            url_foto: gasto.url_foto || ''
        }));
    } catch (error) {
        console.error('Error al cargar gastos:', error.message || error);
        alert('Error al cargar los gastos: ' + (error.message || 'Error desconocido'));
    } finally {
        isLoading.value = false;
    }
};

// Guardar gasto
const guardarGasto = async () => {
    try {
        isLoading.value = true;
        const response = await crearGastosCaja({
            nombre: gasto.value.nombre,
            descripcion: gasto.value.descripcion,
            valor: gasto.value.valor,
        });
        // En lugar de unshift, recarga la lista completa como en ingresos
        await cargarGastos();
        mostrarGastos.value = false;

        // Reiniciar formulario
        gasto.value = {
            nombre: '',
            valor: null,
            fecha: new Date().toISOString().substring(0, 10),
            descripcion: '',
        };
    } catch (error) {
        console.error('Error al guardar gasto:', error.message || error);
        alert('Error al guardar el gasto: ' + (error.message || 'Error desconocido'));
    } finally {
        isLoading.value = false;
    }
};

// Filtrar gastos por nombre
const gastosFiltrados = computed(() => {
    return gastos.value.filter(gasto =>
        gasto.nombre.toLowerCase().includes(filtroNombre.value.toLowerCase())
    );
});

// Formatear fecha
const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES')
}
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

.contenedor-botones .gastos {
    background: var(--color-morado-4);
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

.icono-boton {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
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

textarea {
    width: 100%;
    resize: vertical;
    padding: 0.5rem;
    border: 1px solid var(--color-info-luz);
    border-radius: 6px;
    margin-bottom: 10px;
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

.contenedor-tabla .tabla-ingresos {
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

    .contenedor-tabla .tabla-ingresos {
        min-width: 190%;
    }

    .contenedor-tabla table {
        width: 100%;
        margin-top: 1rem;
        font-size: 1.1rem;
    }

    .contenedor-tabla .tabla-ingresos td,
    th {
        padding: 0rem 1rem;
    }




}
</style>
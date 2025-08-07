<template>
    <div>
        <div class="contenedor-botones">
            <button class="ingreso" @click="mostrarIngreso = true">
                Registrar Ingreso
                <span class="material-symbols-outlined">attach_money</span>
            </button>
        </div>

        <!-- Modal Ingreso -->
        <div v-if="mostrarIngreso" class="modal-overlay">
            <div class="modal-content">
                <span class="material-symbols-outlined close-icon" @click="mostrarIngreso = false">close</span>
                <h2>Registrar Ingreso</h2>
                <form @submit.prevent="guardarIngreso">
                    <label>Tipo de Ingreso:</label>
                    <select v-model="ingreso.tipo" required>
                        <option disabled value="">Seleccione un tipo</option>
                        <option value="Tarjeta con mayor interes">Tarjeta con mayor interés</option>
                        <option value="Aporte capital">Aporte capital</option>
                        <option value="Entrada extra">Entrada extra</option>
                    </select>

                    <label>Supervisor:</label>
                    <select v-model="ingreso.supervisor" required>
                        <option disabled value="">Seleccione un supervisor</option>
                        <option v-for="s in supervisores" :key="s.nombre" :value="s.nombre">
                            {{ s.nombre }}
                        </option>
                    </select>

                    <label>Asesor:</label>
                    <select v-model="ingreso.asesor" :disabled="!ingreso.supervisor" required>
                        <option disabled value="">Seleccione un asesor</option>
                        <option v-for="a in asesoresFiltrados" :key="a" :value="a">
                            {{ a }}
                        </option>
                    </select>


                    <input v-model="ingreso.monto" type="number" placeholder="Monto" required min="1" />

                    <label>Fecha:</label>
                    <input v-model="ingreso.fecha" type="date" readonly />

                    <textarea v-model="ingreso.descripcion" placeholder="Descripción" rows="3"></textarea>

                    <button type="submit">Guardar Ingreso</button>
                </form>
            </div>
        </div>

        <!-- Tabla de ingresos -->
        <div class="contenedor-tabla">
            <div class="filtros">
                <div class="filtro-nombre">
                    <input class="filtro-nom" type="text" placeholder="Buscar por nombre" v-model="filtroNombre" />
                    <span class="material-symbols-outlined">search</span>
                </div>
            </div>

            <div class="tabla-scrollable">
                <table class="tabla-ingresos">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Asesor</th>
                            <th>Monto</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ing in ingresosFiltrados" :key="ing.id">
                            <td>{{ ing.id }}</td>
                            <td>{{ ing.fecha }}</td>
                            <td>{{ ing.tipo }}</td>
                            <td>{{ ing.asesor }}</td>
                            <td>{{ ing.monto }}</td>
                            <td>{{ ing.descripcion }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Modal
const mostrarIngreso = ref(false)




// Ingreso nuevo
const ingreso = ref({
    tipo: '',
    nombre: '',
    monto: null,
    fecha: new Date().toISOString().substring(0, 10),
    descripcion: '',
    supervisor: '',
    asesor: ''
})



// Lista de supervisores y sus asesores
const supervisores = ref([
    {
        nombre: "Supervisor A",
        asesores: ["Asesor 1", "Asesor 2"]
    },
    {
        nombre: "Supervisor B",
        asesores: ["Asesor 3", "Asesor 4", "Asesor 5"]
    }
])

const asesoresFiltrados = computed(() => {
    const sup = supervisores.value.find(s => s.nombre === ingreso.value.supervisor)
    return sup ? sup.asesores : []
})



// Lista de ingresos (mock de prueba)
const listaIngresos = ref([
    {
        id: 1,
        tipo: 'Tarjeta con mayor interes',
        nombre: 'Ingreso 1',
        monto: 500,
        fecha: '2025-08-06',
        descripcion: 'Ingreso por tarjeta',
        supervisor: 'Supervisor A',
        asesor: 'Asesor 1'
    },
    {
        id: 2,
        tipo: 'Aporte capital',
        nombre: 'Ingreso 2',
        monto: 1000,
        fecha: '2025-08-07',
        descripcion: 'Aporte mensual',
        supervisor: 'Supervisor B',
        asesor: 'Asesor 4'
    }
])


const guardarIngreso = () => {
    const nuevo = {
        id: Date.now(),
        ...ingreso.value
    }

    listaIngresos.value.push(nuevo)
    mostrarIngreso.value = false

    ingreso.value = {
        tipo: '',
        nombre: '',
        monto: null,
        fecha: new Date().toISOString().substring(0, 10),
        descripcion: '',
        supervisor: '',
        asesor: ''
    }

}

// Filtro simple
const filtroNombre = ref('')
const ingresosFiltrados = computed(() =>
    listaIngresos.value.filter(ing =>
        ing.nombre.toLowerCase().includes(filtroNombre.value.toLowerCase())
    )
)
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

.contenedor-botones .ingreso {
    background: var(--color-amarillo-2);
}

button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.8rem 1rem;
    font-size: 1rem;
    background: var(--color-azul-1);
    color: var(--color-blanco);
    border: none;
    border-radius: 0.4rem;
    cursor: pointer;
    height: 2.2rem;
    line-height: 1;
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
<template>
    <div>
        <div class="contenedor-botones">
            <button class="prestamo" @click="mostrarPrestamo = true">
                Prestamo Funcionario
                <span class="material-symbols-outlined">currency_exchange</span>
            </button>
        </div>

        <!-- Modal Prestamo Funcionario -->
        <div v-if="mostrarPrestamo" class="modal-overlay">
            <div class="modal-content">
                <span class="material-symbols-outlined close-icon" @click="mostrarPrestamo = false">close</span>
                <h2>Registrar Préstamo</h2>
                <form @submit.prevent="guardarPrestamo">
                    <input v-model="prestamo.cedula_funcionario" type="number" placeholder="Cédula del Funcionario"
                        required />
                    <input v-model="prestamo.nombre_funcionario" type="text" placeholder="Nombre del Funcionario"
                        required />
                    <input v-model="prestamo.autorizado_por" type="text" placeholder="Autorizado por" required
                        readonly />

                    <label>Fecha de Solicitud:</label>
                    <input v-model="prestamo.fecha_solicitud" type="date" readonly />
                    <label>Valor del Préstamo:</label>
                    <input v-model="prestamo.valor_prestamo" type="number" min="1" required />

                    <button type="submit">Guardar Préstamo</button>
                </form>
            </div>
        </div>

        <!-- Tabla -->
        <div class="contenedor-tabla">
            <div class="filtros">
                <div class="filtro-nombre">
                    <input class="filtro-nom" type="text" placeholder="Busqueda por nombre" v-model="filtroNombre" />
                    <span class="material-symbols-outlined">search</span>
                </div>
            </div>

            <div class="tabla-scrollable">
                <table class="tabla-clientes">
                    <thead>
                        <tr>
                            <th class="columna-min">Fecha</th>
                            <th>Funcionario</th>
                            <th>Autorizo</th>
                            <th>Monto</th>
                            <th>Abono</th>
                            <th>Saldo</th>
                            <th></th>


                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="prestamo in FuncionarioFiltro" :key="prestamo.id_prestamo">
                            <tr>
                                <td>{{ prestamo.fecha_solicitud }}</td>
                                <td>{{ prestamo.nombre_funcionario }}</td>
                                <td>{{ prestamo.autorizado_por }}</td>
                                <td>{{ prestamo.valor_prestamo }}</td>
                                <td>{{ prestamo.abono_total }}</td>
                                <td>{{ prestamo.saldo }}</td>
                                <td>
                                    <span class="material-symbols-outlined ver-mas"
                                        @click="toggleExpand(prestamo.id_prestamo)">
                                        {{ usuarioExpandido === prestamo.id_prestamo ? 'keyboard_double_arrow_up' :
                                            'keyboard_double_arrow_down' }}
                                    </span>
                                </td>
                            </tr>

                            <tr
                                v-if="usuarioExpandido === prestamo.id_prestamo && idRol === 1 && prestamo.estado === 'pendiente'">
                                <td colspan="7">
                                    <div class="estado-funcionario">
                                        <button @click="aceptarPrestamo(prestamo.id_prestamo)" class="aceptar">Aceptar</button>
                                        <button @click="denegarPrestamo(prestamo.id_prestamo)" class="denegar">Denegar</button>
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
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const usuarioLogueado = computed(() => authStore.user)


// Modales
const mostrarPrestamo = ref(false)


// Prestamo
const prestamo = ref({
    cedula_funcionario: '',
    nombre_funcionario: '',
    autorizado_por: usuarioLogueado.value?.nombre || '',
    valor_prestamo: null,
    fecha_solicitud: new Date().toISOString().substring(0, 10),
})

// Logica para expandir el vermas y aceptar o denegar el adelanto
const idRol = computed(() => authStore.user?.id_rol)

const usuarioExpandido = ref(null)
const toggleExpand = (id_prestamo) => {
    console.log("Toggle expand:", id_prestamo)
    usuarioExpandido.value = usuarioExpandido.value === id_prestamo ? null : id_prestamo
}

const denegarPrestamo = (id_prestamo) => {
    console.log(`Denegar préstamo ${id_prestamo}`)
    // Aquí podrías eliminarlo o cambiar su estado a 'rechazado'
}

const aceptarPrestamo = (id_prestamo) => {
    const prestamo = PrestamosFuncionario.value.find(p => p.id_prestamo === id_prestamo)
    if (prestamo) {
        prestamo.estado = 'aceptado'
        usuarioExpandido.value = null // opcional: cerrar al aceptar
    }
}

watch([() => prestamo.value.valor_prestamo, () => prestamo.value.cuotas], () => {
    const valor = parseFloat(prestamo.value.valor_prestamo)
    const cuotas = parseInt(prestamo.value.cuotas)

    if (!isNaN(valor) && !isNaN(cuotas)) {
        prestamo.value.valor_total = (valor * 1.2).toFixed(2)

        const hoy = new Date()
        hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset())

        const fechaFin = new Date(hoy)
        let dias = cuotas

        while (dias > 0) {
            fechaFin.setDate(fechaFin.getDate() + 1)
            if (fechaFin.getDay() !== 0) dias-- // Evitar domingos
        }

        prestamo.value.fecha_fin = fechaFin.toISOString().substring(0, 10)
    }
})


const guardarPrestamo = () => {
    const nuevoPrestamo = {
        id_prestamo: Date.now(),
        ...prestamo.value,
        abono_total: 0,
        saldo: prestamo.value.valor_prestamo,
        estado: 'pendiente'
    }
    PrestamosFuncionario.value.push(nuevoPrestamo)
    mostrarPrestamo.value = false
}

// Datos de prueba
const PrestamosFuncionario = ref([
    {
        id_prestamo: 1,
        cedula_funcionario: '100200300',
        nombre_funcionario: 'Ana Maria',
        autorizado_por: 'Camilo',
        valor_prestamo: 1000,
        abono_total: 400,
        saldo: 600,
        fecha_solicitud: '2025-07-15',
        estado: 'pendiente'
    },
    {
        id_prestamo: 2,
        cedula_funcionario: '100200300',
        nombre_funcionario: 'Luisa Garcia',
        autorizado_por: 'Camilo',
        valor_prestamo: 1000,
        abono_total: 400,
        saldo: 600,
        fecha_solicitud: '2025-07-15',
        estado: 'pendiente',
    },
    {
        id_prestamo: 3,
        cedula_funcionario: '100200300',
        nombre_funcionario: 'Carlos Pérez',
        autorizado_por: 'Camilo',
        valor_prestamo: 1000,
        abono_total: 400,
        saldo: 600,
        fecha_solicitud: '2025-07-15',
        estado: 'pendiente',
    },
    {
        id_prestamo: 4,
        cedula_funcionario: '100200300',
        nombre_funcionario: 'Jorge Hoyos',
        autorizado_por: 'Camilo',
        valor_prestamo: 1000,
        abono_total: 400,
        saldo: 600,
        fecha_solicitud: '2025-07-15',
        estado: 'pendiente',
    },
    {
        id_prestamo: 5,
        cedula_funcionario: '100200300',
        nombre_funcionario: 'Carlos Pérez',
        autorizado_por: 'Camilo',
        valor_prestamo: 1000,
        abono_total: 400,
        saldo: 600,
        fecha_solicitud: '2025-07-15',
        estado: 'pendiente',
    },
    {
        id_prestamo: 6,
        cedula_funcionario: '100200300',
        nombre_funcionario: 'Carlos Pérez',
        autorizado_por: 'Camilo',
        valor_prestamo: 1000,
        abono_total: 400,
        saldo: 600,
        fecha_solicitud: '2025-07-15',
        estado: 'pendiente',
    }
])



const filtroNombre = ref('')
const FuncionarioFiltro = computed(() =>
    PrestamosFuncionario.value.filter(prestamo =>
        prestamo.nombre_funcionario.toLowerCase().includes(filtroNombre.value.toLowerCase())
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

.contenedor-botones .prestamo {
    background: var(--color-aprobado-1);
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

.estado-funcionario{
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.estado-funcionario .aceptar{
    background-color: var(--color-aprobado-1);
}

.estado-funcionario .denegar{
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

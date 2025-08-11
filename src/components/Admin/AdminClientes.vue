<template>
    <div>
        <div class="contenedor-botones">
            <button @click="mostrarCliente = true">
                Crear Cliente
                <span class="material-symbols-outlined">person_add</span>
            </button>

            <button class="credito" @click="mostrarCredito = true">
                Crear Prestamo
                <span class="material-symbols-outlined">currency_exchange</span>
            </button>
        </div>

        <!-- Modal Cliente -->
        <div v-if="mostrarCliente" class="modal-overlay">
            <div class="modal-content">
                <span class="material-symbols-outlined close-icon" @click="mostrarCliente = false">close</span>
                <h2>Registrar Cliente</h2>
                <form @submit.prevent="guardarCliente" enctype="multipart/form-data">
                    <input v-model="cliente.documento" type="number" placeholder="Documento" required />
                    <input v-model="cliente.nombre" placeholder="Nombre" required />
                    <input v-model="cliente.apellido" placeholder="Apellido" required />
                    <input v-model="cliente.direccion_casa" placeholder="Dirección casa" />
                    <input v-model="cliente.direccion_trabajo" placeholder="Dirección trabajo" />
                    <input v-model="cliente.telefono" placeholder="Teléfono" />
                    <input v-model="cliente.ocupacion" placeholder="Ocupación" />
                    <input v-model="cliente.referencia" placeholder="Referencia" />

                    <label>Selecciona la Ruta</label>
                    <select v-model="cliente.id_ruta">
                        <option disabled value="">Seleccione una ruta</option>
                        <option v-for="ruta in rutas" :key="ruta.id" :value="ruta.id">{{ ruta.nombre }}</option>
                    </select>

                    <label>Foto de la cédula:</label>
                    <input type="file" @change="onFileChange($event, 'cedula')" accept="image/*,application/pdf" />

                    <label>Foto del negocio:</label>
                    <input type="file" @change="onFileChange($event, 'negocio')" accept="image/*,application/pdf" />

                    <label>Documento del negocio:</label>
                    <input type="file" @change="onFileChange($event, 'documentonegocio')"
                        accept="image/*,application/pdf" />

                    <button type="submit">Guardar Cliente</button>
                </form>
            </div>
        </div>

        <!-- Modal Crédito -->
        <div v-if="mostrarCredito" class="modal-overlay">
            <div class="modal-content">
                <span class="material-symbols-outlined close-icon"
                    @click="mostrarCredito = false; resetearFormularioCredito()">close</span>
                <h2>Registrar Préstamo</h2>
                <form @submit.prevent="guardarCredito">
                    <input v-model="credito.cedula_cliente" type="number" placeholder="Cédula del Cliente" required />

                    <label>Fecha de Solicitud:</label>
                    <input v-model="credito.fecha_solicitud" type="date" readonly />

                    <label>Moneda:</label>
                    <select v-model="credito.moneda">
                        <option value="USD">Dólares (USD)</option>
                        <option value="CLP">Pesos Chilenos (CLP)</option>
                        <option value="BRL">Real Brasileño (BRL)</option>
                    </select>

                    <label>Prestamo:</label>
                    <input v-model="credito.valor_prestamo" type="number" placeholder="Valor del Préstamo" required
                        min="1" />

                    <label>Cantidad de Cuotas (máx. 24):</label>
                    <input v-model="credito.cuotas" type="number" :max="24" required min="1" />

                    <label>Valor por Cuota:</label>
                    <input :value="formatearMoneda(credito.valor_cuota)" type="text" readonly />

                    <label>Valor Total (+20%):</label>
                    <input :value="formatearMoneda(credito.valor_total)" type="text" readonly />


                    <label>Fecha de Finalización:</label>
                    <input v-model="credito.fecha_fin" type="date" readonly />

                    <button type="submit">Guardar Crédito</button>
                </form>
            </div>
        </div>

        <!-- Tabla -->
        <div class="contenedor-tabla">


            <div class="filtros">
                <div class="filtro-nombre">
                    <input class="filtro-nom" type="text" placeholder="Busqueda por nombre" />
                    <span class="material-symbols-outlined">search</span>
                </div>

                <div class="cambiar-ruta">
                    <button class="editar-ruta">
                        <img class="icono-botones" src="/src/assets/icons/edit.png" alt="">
                    </button>
                </div>
            </div>

            <div class="tabla-scrollable">
                <table class="tabla-clientes">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Prestamo</th>
                            <th>Supervisor</th>
                            <th>Asesor</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="Clientes in CreditoCliente" :key="Clientes.id_cliente">
                            <tr>
                                <td>{{ Clientes.nombre }}</td>
                                <td>${{ Clientes.prestamo_total }}</td>
                                <td>{{ Clientes.nombre }}</td>
                                <td>{{ Clientes.nombre }}</td>
                                <td>
                                    <span class="material-symbols-outlined ver-mas"
                                        @click="toggleExpand(Clientes.id_cliente)">
                                        {{ usuarioExpandido === Clientes.id_cliente ? 'keyboard_double_arrow_up' :
                                            'keyboard_double_arrow_down' }}
                                    </span>
                                </td>
                            </tr>
                            <tr v-if="usuarioExpandido === Clientes.id_cliente">
                                <td colspan="7" class="fila-expandida">
                                    <div class="info-extra">
                                        <strong>Dirección:</strong> {{ Clientes.direccion }} &nbsp;&nbsp;|&nbsp;&nbsp;
                                        <strong>Teléfono:</strong> {{ Clientes.telefono }}
                                    </div>

                                    <div class="info-extra">
                                        <strong>Credito:</strong> ${{ Clientes.prestamo_total }}
                                        &nbsp;&nbsp;|&nbsp;&nbsp;
                                        <strong>Numero Cuotas:</strong> {{ Clientes.numero_cuotas }}
                                    </div>

                                    <div class="info-extra">
                                        <strong>Solicitud Credito:</strong> {{ Clientes.fecha_prestamo }}
                                        &nbsp;&nbsp;|&nbsp;&nbsp;
                                        <strong>Fecha Finalización</strong> {{ Clientes.fecha_finalizacion }}
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
const mostrarCliente = ref(false)
const mostrarCredito = ref(false)

// Cliente
const cliente = ref({
    documento: '',
    nombre: '',
    apellido: '',
    direccion_casa: '',
    direccion_trabajo: '',
    telefono: '',
    ocupacion: '',
    referencia: '',
    id_ruta: ''
})

// Rutas
const rutas = ref([
    { id: 1, nombre: 'Ruta 1' },
    { id: 2, nombre: 'Ruta 2' }
])

const guardarCliente = () => {
    console.log('Cliente registrado:', cliente.value)
    mostrarCliente.value = false
}

const obtenerFechaActual = () => {
    const hoy = new Date()
    const year = hoy.getFullYear()
    const month = String(hoy.getMonth() + 1).padStart(2, '0')
    const day = String(hoy.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}


// Crédito
const credito = ref({
    cedula_cliente: '',
    valor_prestamo: null,
    fecha_solicitud: obtenerFechaActual(),
    cuotas: null,
    valor_cuota: null,
    valor_total: null,
    fecha_fin: '',
    moneda: 'USD'
})

const resetearFormularioCredito = () => {
    credito.value = {
        cedula_cliente: "",
        valor_prestamo: "",
        fecha_solicitud: obtenerFechaActual(),
        cuotas: "",
        valor_total: "",
        valor_cuota: "",
        fecha_finalizacion: "",
        moneda: 'USD',
    }
}

watch([() => credito.value.valor_prestamo, () => credito.value.cuotas], () => {
    const prestamo = parseFloat(credito.value.valor_prestamo)
    const cuotas = parseInt(credito.value.cuotas)

    if (!isNaN(prestamo) && !isNaN(cuotas)) {
        const totalConInteres = prestamo * 1.2
        credito.value.valor_total = totalConInteres.toFixed(2)
        credito.value.valor_cuota = (totalConInteres / cuotas).toFixed(2)

        const hoy = new Date()
        hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset())
        const fechaLocal = new Date(hoy)

        let dias = cuotas
        while (dias > 0) {
            fechaLocal.setDate(fechaLocal.getDate() + 1)
            const dia = fechaLocal.getDay()
            if (dia !== 0) dias-- // Ignora domingos
        }

        credito.value.fecha_fin = fechaLocal.toISOString().substring(0, 10)
    } else {
        credito.value.valor_total = ""
        credito.value.valor_cuota = ""
        credito.value.fecha_fin = ""
    }
})

const localesPorMoneda = {
    USD: 'en-US',
    CLP: 'es-CL',
    BRL: 'pt-BR'
}

const formatearMoneda = (valor) => {
    if (isNaN(valor)) return ''
    const moneda = credito.value.moneda
    const locale = localesPorMoneda[moneda] || 'en-US'
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: moneda,
        minimumFractionDigits: 0
    }).format(valor)
}


const guardarCredito = () => {
    console.log('Crédito registrado:', credito.value)
    resetearFormularioCredito();
    mostrarCredito.value = false
}

// Expansión de tabla
const usuarioExpandido = ref(null)
const toggleExpand = (id) => {
    usuarioExpandido.value = usuarioExpandido.value === id ? null : id
}


// Datos de prueba
const CreditoCliente = ref([
    { id_cliente: 1001, nombre: 'María Gómez', telefono: '3123456789', direccion: 'Calle 10 #15-20', casa: 'Casa 1', numero_cuotas: 20, cuotas_pagadas: 5, cuotas_deberia: 8, abono: 100, abono_total: 500, prestamo_total: 1200, fecha_prestamo: '2025-06-15', fecha_finalizacion: '2025-11-30' },
    { id_cliente: 1002, nombre: 'Luis Martínez', telefono: '3132223344', direccion: 'Carrera 8 #45-12', casa: 'Casa 2', numero_cuotas: 24, cuotas_pagadas: 10, cuotas_deberia: 12, abono: 150, abono_total: 1000, prestamo_total: 1500, fecha_prestamo: '2025-05-01', fecha_finalizacion: '2025-10-20' },
    { id_cliente: 1003, nombre: 'Ana Torres', telefono: '3149998877', direccion: 'Diagonal 3 #21-18', casa: 'Casa 3', numero_cuotas: 18, cuotas_pagadas: 18, cuotas_deberia: 18, abono: 120, abono_total: 300, prestamo_total: 1500, fecha_prestamo: '2025-02-10', fecha_finalizacion: '2025-07-10' },
    { id_cliente: 1004, nombre: 'Jorge Herrera', telefono: '3118887766', direccion: 'Av. Siempre Viva #123', casa: 'Casa 4', numero_cuotas: 12, cuotas_pagadas: 3, cuotas_deberia: 6, abono: 90, abono_total: 270, prestamo_total: 900, fecha_prestamo: '2025-07-01', fecha_finalizacion: '2025-12-15' }
])

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

.contenedor-botones .credito {
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

.cambiar-ruta {
    margin-right: 2rem;
}

.editar-ruta {
    background: var(--color-amarillo-2);
    color: var(--color-blanco);
}


.icono-botones {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
    filter: drop-shadow(1px 1px 5px var(--color-oscuro));
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
    font-size: 1.2rem;
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

.calendario-cuotas {
    display: flex;
    justify-content: center;
}

.grid-cuotas {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-top: 0.5rem;
    width: 300px;
}

.cuota {
    background: var(--color-blanco);
    border: 1px solid var(--color-info-gris);
    text-align: center;
    padding: 0.8rem;
    border-radius: 5px;
}

/*======================Media Querry====================*/

@media screen and (max-width: 768px) {

    /*==============Modales===========================*/
    .modal-content {
        width: 90%;
        height: auto;
        max-height: 70vh;
        overflow-y: auto;
        padding: 1.5rem;
        font-size: 0.9rem;
        margin-top: 4rem;
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
        margin-top: 2rem;
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
        height: 55vh;
    }


    .contenedor-tabla {
        position: relative;
    }

    .contenedor-tabla .tabla-clientes {
        min-width: 160%;
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

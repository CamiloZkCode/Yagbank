<template>
    <div>
        <!-- Modal Pago Cuota -->
        <div v-if="pagoCuota" class="modal-overlay">
            <div class="modal-content">
                <span class="material-symbols-outlined close-icon"
                    @click="pagoCuota = false; limpiarFormulario()">close</span>
                <h2>Pago Cuota - {{ clienteSeleccionado?.nombre }}</h2>
                <form @submit.prevent="guardarPago" enctype="multipart/form-data">
                    <div class="opciones-pago">
                        <label>
                            <input type="radio" value="abono" v-model="tipoPago" required />
                            Pagar Cuota
                        </label>
                        <label>
                            <input type="radio" value="liquidar" v-model="tipoPago" />
                            Liquidar Crédito
                        </label>
                    </div>

                    <!-- Pagar una cuota -->
                    <div v-if="tipoPago === 'abono'">
                        <label for="montoCuota">Valor a Pagar:</label>
                        <input type="number" id="montoCuota" v-model="montoAbono" required min="1"
                            :max="clienteSeleccionado?.saldo_restante" class="valor" />
                    </div>

                    <!-- Liquidar crédito -->
                    <div v-if="tipoPago === 'liquidar'">
                        <label for="montoLiquidar">Total a liquidar:</label>
                        <input type="number" id="montoLiquidar" :value="clienteSeleccionado?.saldo_restante" readonly
                            class="valor" />
                    </div>
                    <button type="submit">Guardar Pago</button>
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
                            <th class="columna-min">N°</th>
                            <th>Cliente</th>
                            <th class="columna-nota">Nota</th>
                            <th>Abono</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="cliente in ClienteFiltro" :key="cliente.id_prestamo">
                            <tr>
                                <td class="columna-min">
                                    <div class="estado" :style="{ background: getEstadoColor(cliente.cuotas_mora) }"
                                        @click="toggleExpand(cliente.id_prestamo)">
                                        {{ cliente.cuotas_pagadas }}
                                    </div>
                                </td>
                                <td>{{ cliente.nombre }} {{ cliente.referencia }}</td>
                                <td class="columna-nota">
                                    <!-- Admin sees all nota options -->
                                    <template v-if="role === 1">
                                        <span class="material-symbols-outlined up"
                                            :class="{ active: cliente.nota_credito === 'up' }"
                                            @click="marcarClienteNota(cliente.id_cliente, 'up')">
                                            arrow_warm_up
                                        </span>
                                        <span class="material-symbols-outlined down"
                                            :class="{ active: cliente.nota_credito === 'down' }"
                                            @click="marcarClienteNota(cliente.id_cliente, 'down')">
                                            arrow_cool_down
                                        </span>
                                        <span class="material-symbols-outlined block"
                                            @click="marcarClienteClavo(cliente.id_cliente)">
                                            block
                                        </span>
                                    </template>
                                    <!-- Supervisor sees only the active nota -->
                                    <template v-else-if="role === 2 && cliente.nota_credito">
                                        <span class="material-symbols-outlined" :class="{
                                            up: cliente.nota_credito === 'up',
                                            down: cliente.nota_credito === 'down'
                                        }">
                                            {{ cliente.nota_credito === 'up' ? 'arrow_warm_up' : 'arrow_cool_down' }}
                                        </span>
                                    </template>
                                </td>
                                <td>
                                    <div class="contenedor-pagos">
                                        ${{ cliente.abono || 0 }}
                                        <button @click="abrirModalPago(cliente)">Pagar</button>
                                    </div>
                                </td>
                                <td>
                                    <div class="contenedor-deuda">
                                        ${{ cliente.saldo_restante }}
                                        <label>$ {{ cliente.abono_capital }}</label>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="usuarioExpandido === cliente.id_prestamo">
                                <td colspan="5" class="fila-expandida">
                                    <div class="info-extra">
                                        <strong>Dirección:</strong> {{ cliente.direccion }} &nbsp;&nbsp;|&nbsp;&nbsp;
                                        <strong>Teléfono:</strong> {{ cliente.telefono }}
                                    </div>
                                    <div class="info-extra">
                                        <strong>Crédito:</strong> ${{ cliente.prestamo_total }}
                                        &nbsp;&nbsp;|&nbsp;&nbsp;
                                        <strong>Número Cuotas:</strong> {{ cliente.numero_cuotas }}
                                    </div>
                                    <div class="info-extra">
                                        <strong>Solicitud Crédito:</strong> {{ formatDate(cliente.fecha_prestamo) }}
                                        &nbsp;&nbsp;|&nbsp;&nbsp;
                                        <strong>Fecha Finalización:</strong> {{ formatDate(cliente.fecha_finalizacion)
                                        }}
                                    </div>
                                    <div class="info-extra">
                                        <h3>Cuotas</h3>
                                        <div class="calendario-cuotas">
                                            <div class="grid-cuotas">
                                                <div v-for="cuota in generarCuotasPorCliente(cliente.id_prestamo, cliente.numero_cuotas)"
                                                    :key="cuota.numero" class="cuota"
                                                    :style="{ background: getCuotaColor(cuota, cliente) }">
                                                    {{ cuota.numero }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <div class="contador-tarjetas">
                <h4 class="tarjetas-cobradas">T. Cobradas: <span id="tarjeta">{{ contadores.tarjetas_cobradas }}</span>
                </h4>
                <h4 class="valor-cobrado">V. Recaudado: <span id="cobro">$ {{ contadores.valor_recaudado }}</span></h4>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { obtenerDatosPagos, realizarPago, obtenerCuotasPrestamo, marcarClavo, marcarNota } from '@/services/pago'
import moment from 'moment-timezone'

// Date utility functions
const obtenerFechaLocal = () => {
    return moment().tz("America/Bogota").format("YYYY-MM-DD")
}
const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES')
}

const authStore = useAuthStore()
const role = computed(() => authStore.user.id_rol) // Role: 1 (Admin), 2 (Supervisor), 3 (Advisor)

const pagoCuota = ref(false)
const clienteSeleccionado = ref(null)
const tipoPago = ref("")
const montoAbono = ref(0)
const montoLiquidar = ref(0)
const usuarioExpandido = ref(null)
const filtroNombre = ref('')
const CreditoCliente = ref([])
const contadores = ref({ tarjetas_cobradas: 0, valor_recaudado: 0 })
const today = obtenerFechaLocal() // Use moment for current date

// Fetch data on component mount
const fetchData = async () => {
    try {
        const response = await obtenerDatosPagos()
        CreditoCliente.value = response.clientes.map(cliente => ({
            ...cliente,
            valor_cuota: cliente.prestamo_total / cliente.numero_cuotas,
            referencia: cliente.referencia || '' // Show empty string if null
        }))
        contadores.value = response.contadores
    } catch (error) {
        console.error('Error fetching payment data:', error)
    }
}

// Fetch cuotas for a specific loan
const cuotasPrestamo = ref({})
const fetchCuotas = async (idPrestamo) => {
    try {
        const cuotas = await obtenerCuotasPrestamo(idPrestamo)
        cuotasPrestamo.value[idPrestamo] = cuotas
    } catch (error) {
        console.error('Error fetching cuotas:', error)
    }
}

// Open payment modal
const abrirModalPago = (cliente) => {
    clienteSeleccionado.value = cliente
    pagoCuota.value = true
    tipoPago.value = ""
    montoAbono.value = 0
    montoLiquidar.value = cliente.saldo_restante
}

// Save payment
const guardarPago = async () => {
    try {
        const idPrestamo = clienteSeleccionado.value.id_prestamo
        const valorCuota = clienteSeleccionado.value.valor_cuota
        const saldoRestante = clienteSeleccionado.value.saldo_restante
        let tipo = tipoPago.value === 'abono' ? 'cuota' : 'todo'

        // Determinar el tipo de pago basado en el monto ingresado
        if (tipoPago.value === 'abono' && montoAbono.value >= saldoRestante) {
            tipo = 'todo'
        }

        const data = {
            id_prestamo: idPrestamo,
            tipo,
            monto: tipoPago.value === 'abono' ? montoAbono.value : saldoRestante
        }

        // Validar el monto
        if (tipoPago.value === 'abono' && (montoAbono.value <= 0 || montoAbono.value > saldoRestante)) {
            throw new Error('Monto inválido para el pago de la cuota')
        }

        await realizarPago(data)
        await fetchCuotas(idPrestamo)
        await fetchData()
        pagoCuota.value = false
        limpiarFormulario()
    } catch (error) {
        console.error('Error processing payment:', error)
        alert('Error al procesar el pago: ' + error.message)
    }
}

// Mark client as "clavo"
const marcarClienteClavo = async (documento_cliente) => {
    try {
        await marcarClavo({ documento_cliente })
        await fetchData()
    } catch (error) {
        console.error('Error marking clavo:', error)
    }
}

// Mark nota_credito
const marcarClienteNota = async (documento_cliente, nota_credito) => {
    try {
        await marcarNota({ documento_cliente, nota_credito })
        await fetchData()
    } catch (error) {
        console.error('Error marking nota:', error)
    }
}

// Clear form
const limpiarFormulario = () => {
    tipoPago.value = ""
    montoAbono.value = 0
    montoLiquidar.value = 0
    clienteSeleccionado.value = null
}

// Toggle expanded row and fetch cuotas
const toggleExpand = async (id_prestamo) => {
    if (usuarioExpandido.value === id_prestamo) {
        usuarioExpandido.value = null
    } else {
        usuarioExpandido.value = id_prestamo
        await fetchCuotas(id_prestamo)
    }
}

// Filter clients by name
const ClienteFiltro = computed(() =>
    CreditoCliente.value.filter(cliente =>
        cliente.nombre.toLowerCase().includes(filtroNombre.value.toLowerCase())
    )
)

// Generate cuotas for display
const generarCuotasPorCliente = (id_prestamo, numero_cuotas) => {
    const cuotas = cuotasPrestamo.value[id_prestamo] || []
    return Array.from({ length: numero_cuotas }, (_, i) => {
        const cuota = cuotas.find(c => c.numero_cuota === i + 1)
        return {
            numero: i + 1,
            pagada: cuota ? cuota.pagada : false,
            fecha_pago: cuota ? cuota.fecha_pago : null,
            fecha_pagada: cuota ? cuota.fecha_pagada : null
        }
    })
}

// Determine background color for N° column based on cuotas_mora
const getEstadoColor = (cuotas_mora) => {
    if (cuotas_mora >= 6) return 'var(--color-rojo-5)'
    if (cuotas_mora >= 4) return 'var(--color-morado-4)'
    if (cuotas_mora >= 2) return 'var(--color-naranja-3)'
    if (cuotas_mora === 1) return 'var(--color-amarillo-2)'
    return 'var(--color-aprobado-1)'
}

// Determine color for individual cuota
const getCuotaColor = (cuota, cliente) => {
    if (cliente.estado === 'Liquidado' || cuota.pagada) {
        return 'var(--color-aprobado-1)' // Green for paid or liquidated
    }
    if (cuota.fecha_pago && cuota.fecha_pago < today) {
        return 'var(--color-rojo-5)' // Red for overdue
    }
    return 'var(--color-blanco)' // White for not yet due
}

// Load data on mount
fetchData()
</script>


<style scoped>
/*=======================Modal Pago Cuota=========================*/

.icono-boton {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
    cursor: pointer;
}

.valor {
    display: block;
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
    border: 1px solid var(--color-info-luz);
    border-radius: 6px;
}

.opciones-pago {
    margin-top: 1rem;
    margin-bottom: 1rem;

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

input[type="radio"] {
    appearance: auto;
    /* fuerza a mostrar el radio nativo */
    -webkit-appearance: radio;
    -moz-appearance: radio;
    accent-color: var(--color-azul-1);
    /* color personalizado */
    margin-right: 6px;
    cursor: pointer;
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
    border: 1px solid var(--colo);
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

.contenedor-tabla .tabla-clientes {
    width: auto;
    min-width: 100%;
    border-collapse: collapse;
}

.contenedor-tabla table {
    text-align: center;
    transition: all 300ms ease;
    margin-top: 0.5rem;
    font-size: 1.1rem;
    width: 100%;
    padding: 0;
    box-shadow: none;
    background: transparent;
}

.contenedor-tabla .tabla-scrollable:hover {
    box-shadow: none;
}

table tbody td {
    height: 1rem;
    border-bottom: 1px solid var(--color-light);
    color: var(--color-dark-variant);
}


.contenedor-tabla table .columna-min {
    width: 40px;
    font-weight: 600;
}

.contenedor-tabla table .columna-nota {
    width: 100px;
}

.contenedor-tabla .tabla-clientes .estado {
    background: var(--color-aprobado-1);
    color: var(--color-blanco);
    border-radius: var(--card-border-radius);
    padding: 0.5rem 0rem;
    margin: 0.5rem 0rem;
    cursor: pointer;
}

table tbody tr:last-child td {
    border: none;
}

.active {
    font-weight: bold;
    opacity: 1 !important;
}

.material-symbols-outlined.up,
.material-symbols-outlined.down,
.material-symbols-outlined.block {
    cursor: pointer;
    opacity: 0.6;
}

.material-symbols-outlined.up:hover,
.material-symbols-outlined.down:hover,
.material-symbols-outlined.block:hover {
    opacity: 1;
}

.contenedor-tabla .tabla-clientes .up {
    color: var(--color-aprobado-1);
}


.contenedor-tabla .tabla-clientes .block {
    color: var(--color-rojo-5);
}

.contenedor-tabla .tabla-clientes .down {
    color: var(--color-amarillo-2);
}

button {
    cursor: pointer;
    border: none;
    background: transparent;
}

.contenedor-pagos,
.contenedor-deuda {
    display: flex;
    flex-direction: column;
    margin: 0.4rem 0;
}


.contenedor-deuda {
    border: 1px solid var(--color-light);
}

.contenedor-deuda label {
    border-top: 1px solid var(--color-light);
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

/*=======================TARJETAS COBRADAS=========================*/
.contador-tarjetas {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
}

.contador-tarjetas .tarjetas-cobradas {
    width: 100%;
    background: var(--color-rojo-5);
    color: var(--color-blanco);
    padding: 0.5rem 1rem;
    border-radius: var(--card-border-radius);
    font-size: 1rem;

}

.contador-tarjetas .valor-cobrado {
    width: 100%;
    background-color: var(--color-aprobado-1);
    color: var(--color-blanco);
    padding: 0.5rem 1rem;
    border-radius: var(--card-border-radius);
    font-size: 1rem;
}

/*======================Media Querry====================*/

@media screen and (max-width: 768px) {

    /*===================tabla ======================*/
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
        min-width: 120%;

    }

    .contenedor-tabla table {
        margin-top: 1rem;
        font-size: 1rem;
    }

    .contenedor-tabla .tabla-clientes .columna-min {
        white-space: nowrap;
        text-align: center;
        font-size: 1rem;
        width: 30px;
    }

    .contenedor-tabla .tabla-clientes td,
    .contenedor-tabla .tabla-clientes th {
        white-space: normal;
        word-break: break-word;
        text-align: center;
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
        font-size: 1rem;
    }
}
</style>

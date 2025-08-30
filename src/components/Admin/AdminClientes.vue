<template>
    <div>
        <div class="contenedor-botones">
            <button @click="mostrarCliente = true">
                Crear Cliente
                <img class="icono-boton" src="/src/assets/icons/CrearUser.png" alt="">
            </button>

            <button class="credito" @click="mostrarCredito = true">
                Crear Prestamo
                <img class="icono-boton" src="/src/assets/icons/NuevoCredito.png" alt="">
            </button>
        </div>


        <!-- Modal Cliente -->
        <div v-if="mostrarCliente" class="modal-overlay">
            <div class="modal-content">
                <span class="material-symbols-outlined close-icon"
                    @click="mostrarCliente = false; limpiarFormulario()">close</span>
                <h2>Registrar Cliente</h2>
                <form @submit.prevent="guardarCliente" enctype="multipart/form-data">
                    <input v-model="cliente.documento_cliente" type="number" placeholder="Documento" required />
                    <input v-model="cliente.nombre" placeholder="Nombre" required />
                    <input v-model="cliente.apellido" placeholder="Apellido" required />
                    <input v-model="cliente.direccion_casa" placeholder="Dirección casa" />
                    <input v-model="cliente.direccion_trabajo" placeholder="Dirección trabajo" />
                    <input v-model="cliente.telefono" placeholder="Teléfono" />
                    <input v-model="cliente.ocupacion" placeholder="Ocupación" />
                    <input v-model="cliente.referencia" placeholder="Referencia" />
                    <!--Selecciona un asesor-->
                    <label>Seleccionar un Asesor</label> <!--Cambiar esto¡¡¡¡¡¡-->

                    <label>Selecciona el supervisor</label>
                    <select v-model="cliente.id_supervisor">
                        <option disabled value="">Seleccione un supervisor</option>
                        <option v-for="sup in supervisores" :key="sup.id" :value="sup.id">{{ sup.nombre }}</option>
                    </select>

                    <label>Selecciona el asesor</label>
                    <select v-model="cliente.id_asesor">
                        <option disabled value="">Seleccione un asesor</option>
                        <option v-for="asesor in asesores" :key="asesor.id" :value="asesor.id">{{ asesor.nombre }}
                        </option>
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
                    <input v-model="credito.documento_cliente" type="number" placeholder="Cédula del Cliente"
                        required />

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
                    <input v-model="credito.numero_cuotas" type="number" :max="24" required min="1" />

                    <label>Valor por Cuota:</label>
                    <input :value="formatearMoneda(credito.valor_diario)" type="text" readonly />

                    <label>Valor Total (+20%):</label>
                    <input :value="formatearMoneda(credito.total)" type="text" readonly />

                    <label>Forma de Pago:</label>
                    <select v-model="credito.forma_pago" required>
                        <option value="Diario">Diaria</option>
                        <option value="Semanal">Semanal</option>
                        <option value="Quincenal">Quincenal</option>
                        <option value="Mensual">Mensual</option>
                    </select>

                    <label>Fecha de Finalización:</label>
                    <input v-model="credito.fecha_finalizacion" type="date" readonly />

                    <button type="submit">Guardar Crédito</button>
                </form>
            </div>
        </div>


        <!--Modal Edicion Cliente-->
        <div v-if="mostrarEditarCliente" class="modal-overlay">
            <div class="modal-content">
                <span class="material-symbols-outlined close-icon"
                    @click="mostrarEditarCliente = false; limpiarFormularioEdicion()">
                    close
                </span>

                <h2>Editar Cliente</h2>

                <form @submit.prevent="guardarEdicionCliente">
                    <input v-model="clienteEditado.nombre" placeholder="Nombre" required />
                    <input v-model="clienteEditado.apellido" placeholder="Apellido" required />
                    <input v-model="clienteEditado.telefono" placeholder="Teléfono" />

                    <input v-model="clienteEditado.direccion_casa" placeholder="Dirección casa" />

                    <input v-model="clienteEditado.ocupacion" placeholder="Ocupación" />
                    <input v-model="clienteEditado.referencia" placeholder="Referencia" />

                    <!-- Selección de supervisor -->
                    <label>Selecciona el supervisor</label>
                    <select v-model="clienteEditado.id_supervisor">
                        <option disabled value="">Seleccione un supervisor</option>
                        <option v-for="sup in supervisores" :key="sup.id" :value="sup.id">{{ sup.nombre }}</option>
                    </select>

                    <label>Selecciona el asesor</label>
                    <select v-model="clienteEditado.id_asesor">
                        <option disabled value="">Seleccione un asesor</option>
                        <option v-for="asesor in asesores" :key="asesor.id" :value="asesor.id">{{ asesor.nombre }}
                        </option>
                    </select>
                    <button type="submit">Guardar Cambios</button>
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
                            <th>Cliente</th>
                            <th>Supervisor</th>
                            <th>Asesor</th>
                            <th>Estado</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="cliente in clientesFiltrados" :key="cliente.documento_cliente">
                            <tr>
                                <td class="nombre">{{ cliente.nombre }} {{ cliente.apellido }} {{ cliente.referencia }}
                                </td>
                                <td class="nombre">{{ cliente.nombre_supervisor || 'N/A' }}</td>
                                <td class="nombre">{{ cliente.nombre_asesor }}</td>
                                <td>
                                    <span
                                        :class="['estado-badge', cliente.cliente_activo == 1 ? 'activo' : 'inactivo']">
                                        {{ cliente.cliente_activo == 1 ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td>
                                    <img class="icono-boton" src="/src/assets/icons/Edit.png" alt=""
                                        @click="abrirModalEdicion(cliente)" title="Editar cliente">
                                </td>
                                <td>
                                    <span class="material-symbols-outlined ver-mas"
                                        @click="toggleExpand(cliente.documento_cliente)">
                                        {{ usuarioExpandido === cliente.documento_cliente ? 'keyboard_double_arrow_up' :
                                            'keyboard_double_arrow_down' }}
                                    </span>
                                </td>
                            </tr>
                            <tr v-if="usuarioExpandido === cliente.documento_cliente">
                                <td colspan="8" class="fila-expandida">
                                    <div class="info-extra">
                                        <strong>Documento:</strong> {{ cliente.documento_cliente }}
                                        &nbsp;&nbsp;|&nbsp;&nbsp;
                                        <strong>Dirección:</strong> {{ cliente.direccion_casa }}
                                        &nbsp;&nbsp;|&nbsp;&nbsp;
                                        <strong>Teléfono:</strong> {{ cliente.telefono }}
                                    </div>

                                    <div class="historial" v-if="cliente.historial && cliente.historial.length">
                                        <h4>Historial de Préstamos</h4>
                                        <table class="tabla-historico">
                                            <thead>
                                                <tr>
                                                    <th>Valor</th>
                                                    <th>Cuotas</th>
                                                    <th>Inicio</th>
                                                    <th>Fin</th>
                                                    <th>Estado</th>
                                                    <th>Detalles</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="prestamo in cliente.historial" :key="prestamo.id_prestamo">
                                                    <td>${{ formatNumber(prestamo.valor_prestamo) }}</td>
                                                    <td>{{ prestamo.numero_cuotas }}</td>
                                                    <td>{{ formatDate(prestamo.fecha_inicio) }}</td>
                                                    <td>{{ formatDate(prestamo.fecha_finalizacion) }}</td>
                                                    <td>
                                                        <span :class="['estado-badge', prestamo.estado.toLowerCase()]">
                                                            {{ prestamo.estado }}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <img class="icono-boton" src="/src/assets/Icons/ver-mas.png"
                                                            alt="" @click="verDetallePrestamo(prestamo.id_prestamo)">
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </template>

                        <tr v-if="clientesFiltrados.length === 0">
                            <td colspan="6">No hay creditos registrados.</td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { crearClientes, listarClientesConPrestamos, editarCliente } from '@/services/clientes'
import { crearPrestamos } from '@/services/prestamos'
import { obtenerSupervisores, obtenerAsesores } from '@/services/usuario'
import alertify from 'alertifyjs'
import 'alertifyjs/build/css/alertify.css'
import moment from "moment-timezone"

const obtenerFechaLocal = () => {
    return moment().tz("America/Bogota").format("YYYY-MM-DD")
}



const authStore = useAuthStore()
const usuarioLogueado = computed(() => authStore.user)

// Modales
const mostrarCliente = ref(false)
const mostrarCredito = ref(false)
const filtroNombre = ref('')
const mostrarEditarCliente = ref(false)
const cargando = ref(false)
const clientes = ref([])

// Abrir modal de edición cargando datos del cliente
const abrirModalEdicion = (cliente) => {
    clienteEditado.value = { ...cliente }   // clona los datos del cliente
    mostrarEditarCliente.value = true
}

//Estados Reactivos
const supervisores = ref([]) // Cargar lista de supervisores
const asesores = ref([]) // Cargar lista asesores
const CreditoCliente = ref([]) // Carga clientes e info sobre el prestamo


// Formateadores
const formatNumber = (num) => {
    return new Intl.NumberFormat('es-CO').format(num)
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES')
}



// Cliente
const cliente = ref({
    documento_cliente: '',
    nombre: '',
    apellido: '',
    direccion_casa: '',
    direccion_trabajo: '',
    telefono: '',
    ocupacion: '',
    referencia: '',
    id_supervisor: '',
    id_asesor: '',
    url_cedula: '',
    url_negocio: '',
    url_documentonegocio: ''
})

// Cliente en edición
const clienteEditado = ref({
    id: null,
    nombre: "",
    apellido: "",
    telefono: "",
    direccion_casa: "",
    direccion_trabajo: "",
    ocupacion: "",
    referencia: "",
    id_supervisor: "",
    id_asesor: ""
})

const archivos = ref({
    cedula: null,
    negocio: null,
    documentonegocio: null
})

// Función para guardar cliente
const guardarCliente = async () => {
    try {
        await crearClientes(cliente.value)
        alertify.alert(
            'Cliente registrado',
            'Cliente registrado con éxito',
            async function () {
                mostrarCliente.value = false
                limpiarFormulario()
                await cargarClientes()   // 👈 refresca la tabla
            }
        ).set({
            transition: 'fade',
            movable: false,
            resizable: false,
            pinnable: false,
            closable: true,
        })
    } catch (error) {
        console.error(error)
    }
}

//Limpiar Formulario del cliente
const limpiarFormulario = () => {
    cliente.value = {
        documento_cliente: '',
        nombre: '',
        apellido: '',
        direccion_casa: '',
        direccion_trabajo: '',
        telefono: '',
        ocupacion: '',
        referencia: '',
        id_asesor: ''
    };
};

// Limpiar formulario de edición
const limpiarFormularioEdicion = () => {
    clienteEditado.value = {
        id: null,
        nombre: "",
        apellido: "",
        telefono: "",
        direccion_casa: "",
        direccion_trabajo: "",
        ocupacion: "",
        referencia: "",
        id_supervisor: "",
        id_asesor: ""
    }
}

const guardarEdicionCliente = async () => {
    try {

        console.log("Documento a editar:", clienteEditado.value.documento_cliente)
        console.log("Payload:", clienteEditado.value)
        await editarCliente(clienteEditado.value.documento_cliente, clienteEditado.value)
        console.log("Cliente actualizado:", clienteEditado.value)
        alertify.success("Cliente actualizado con éxito")
        mostrarEditarCliente.value = false
        limpiarFormularioEdicion()
        await cargarClientes() // refresca lista
    } catch (error) {
        console.error("Error al actualizar cliente:", error)
        alertify.error("No se pudo actualizar el cliente")
    }
}

const cargarSupervisores = async () => {
    try {
        supervisores.value = await obtenerSupervisores()
    } catch (error) {
        console.error('Error al obtener supervisores:', error)
    }
}

watch(() => cliente.value.id_supervisor, async (nuevoId) => {
    if (!nuevoId) {
        asesores.value = [];
        cliente.value.id_asesor = '';
        return;
    }
    try {
        asesores.value = await obtenerAsesores(nuevoId);
    } catch (err) {
        console.error('Error cargando asesores por supervisor:', err);
        asesores.value = [];
    }
});

// Cuando cambia el supervisor en edición, cargar asesores
watch(() => clienteEditado.value.id_supervisor, async (nuevoId) => {
    if (!nuevoId) {
        asesores.value = [];
        clienteEditado.value.id_asesor = '';
        return;
    }
    try {
        asesores.value = await obtenerAsesores(nuevoId);
    } catch (err) {
        console.error('Error cargando asesores por supervisor (edición):', err);
        asesores.value = [];
    }
});

// Carga de datos
const cargarClientes = async () => {
    cargando.value = true
    try {
        console.log("ID usuario logueado:", usuarioLogueado.value.id) // Verifiquemos este valor
        const respuesta = await listarClientesConPrestamos(usuarioLogueado.value.id)
        console.log("Respuesta del backend:", respuesta) // Verifiquemos la estructura
        clientes.value = respuesta
        console.log("Clientes cargados:", clientes.value) // Verifiquemos si se asignó correctamente
    } catch (error) {
        console.error("Error completo:", error) // Mostrar el error completo
        alertify.error(error.message || "Error al cargar los datos de clientes")
    } finally {
        cargando.value = false
    }
}




// Creacion Prestamo
const credito = ref({
    documento_cliente: '',
    valor_prestamo: null,
    fecha_solicitud: obtenerFechaLocal(),
    numero_cuotas: null,
    valor_diario: null,
    total: null,
    moneda: 'USD',
    forma_pago: 'Diaria',
    interes: 20
})


const resetearFormularioCredito = () => {
    credito.value = {
        documento_cliente: '',
        valor_prestamo: null,
        fecha_solicitud: obtenerFechaLocal(),
        numero_cuotas: null,
        valor_diario: null,
        total: null,
        fecha_finalizacion: '',
        moneda: 'USD',
        forma_pago: 'Diaria',
        interes: 20
    }
}


//watch para calcular valores del credito 

watch(
    [() => credito.value.valor_prestamo, () => credito.value.numero_cuotas, () => credito.value.forma_pago],
    () => {
        const prestamo = parseFloat(credito.value.valor_prestamo)
        const cuotas = parseInt(credito.value.numero_cuotas)
        const formaPago = credito.value.forma_pago

        if (!isNaN(prestamo) && !isNaN(cuotas) && cuotas > 0) {
            const totalConInteres = prestamo * 1.2
            credito.value.total = totalConInteres.toFixed(2)
            credito.value.valor_diario = (totalConInteres / cuotas).toFixed(2)

            // 👉 Fecha base (hoy en zona horaria correcta)
            let fecha = moment(obtenerFechaLocal(), "YYYY-MM-DD")

            let incremento = 1
            switch (formaPago) {
                case "Diaria": incremento = 1; break
                case "Semanal": incremento = 7; break
                case "Quincenal": incremento = 15; break
                case "Mensual": incremento = 30; break
            }

            // 👉 Iteramos para calcular la fecha final, excluyendo domingos
            for (let i = 0; i < cuotas; i++) {
                fecha.add(incremento, "days")
                if (fecha.day() === 0) {
                    // Si cae domingo, lo movemos al lunes
                    fecha.add(1, "days")
                }
            }

            credito.value.fecha_finalizacion = fecha.format("YYYY-MM-DD")
        } else {
            credito.value.total = ""
            credito.value.valor_diario = ""
            credito.value.fecha_finalizacion = ""
        }
    }
)

watch(() => credito.value.numero_cuotas, (nuevoValor) => {
    if (nuevoValor && (nuevoValor < 1 || !Number.isInteger(Number(nuevoValor)))) {
        alertify.error('El número de cuotas debe ser un entero positivo')
        credito.value.numero_cuotas = null
    }
})

function onFileChange(event, tipo) {
    const file = event.target.files[0]
    if (file) {
        archivos.value[tipo] = file
    }
}

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

//Guardar Credito
const guardarCredito = async () => {
    try {
        const datosPrestamo = {
            documento_cliente: credito.value.documento_cliente,
            valor_prestamo: Number(credito.value.valor_prestamo),
            forma_pago: credito.value.forma_pago,
            numero_cuotas: Number(credito.value.numero_cuotas),
            creado_por: usuarioLogueado.value.id
        }

        await crearPrestamos(datosPrestamo)

        alertify.alert(
            'Préstamo registrado con éxito',
            `
      <div style="text-align: left;">
          <strong>Cliente:</strong> ${datosPrestamo.documento_cliente}<br>
          <strong>Valor:</strong> ${credito.value.valor_prestamo}<br>
          <strong>Cuotas:</strong> ${datosPrestamo.numero_cuotas}<br>
          <strong>Forma de pago:</strong> ${datosPrestamo.forma_pago}
      </div>
      `,
            async function () {
                mostrarCredito.value = false
                resetearFormularioCredito()
                await cargarClientes()   // 👈 refresca la tabla y el historial
            }
        ).set({
            transition: 'fade',
            movable: false,
            resizable: false,
            pinnable: false,
            closable: true,
        })
    } catch (error) {
        console.error('Error al crear préstamo:', error)
        alertify.error('Error al crear el préstamo: ' + (error.response?.data?.message || error.message))
    }
}

// Expansión de tabla
const usuarioExpandido = ref(null)
const toggleExpand = (id) => {
    usuarioExpandido.value = usuarioExpandido.value === id ? null : id
}

// Filtrado de clientes
const clientesFiltrados = computed(() => {
    if (!filtroNombre.value) return clientes.value

    const termino = filtroNombre.value.toLowerCase()
    return clientes.value.filter(cliente =>
        `${cliente.nombre} ${cliente.apellido} ${cliente.referencia}`.toLowerCase().includes(termino) ||
        cliente.documento_cliente.toString().includes(termino))
})

onMounted(async () => {
    console.log('Iniciando carga de datos...')
    try {
        await cargarSupervisores()
        await cargarClientes()
        console.log('Datos cargados completamente')
    } catch (error) {
        console.error('Error en mounted:', error)
    }
})

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
    box-shadow: 0 5px 6px rgba(0, 0, 0, 0.2);
}


.icono-boton {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
    cursor: pointer;
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
    height: 3rem;
    border-bottom: 1px solid var(--color-light);
    color: var(--color-dark-variant);
}


table tbody tr:last-child td {
    border: none;
}

.estado-badge {
    font-size: 1rem;
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

.historial {
    margin-top: 1rem;
}

.historial td {
    margin-top: 0.5rem;
    font-size: 1rem;

}

.estado-badge.activo {
    font-size: 1rem;
    color: var(--color-aprobado-1);
}

.estado-badge.cancelado {
    font-size: 1rem;
    color: var(--color-rojo-5);
}

.estado-badge.liquidado {
    font-size: 1rem;
    color: var(--color-amarillo-2);
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
        min-width: 150%;
    }

    .contenedor-tabla .tabla-clientes .nombre {
        width: 140px;
        white-space: normal;
        word-break: break-word;
    }

    table td:nth-child(5),
    table th:nth-child(5),
     table td:nth-child(4),
    table th:nth-child(4)  {
        padding-left: 1rem;
        /* o más según quieras */
    }

    .icono-boton {
        width: 1.7rem;
        height: 1.7rem;
        object-fit: contain;
        cursor: pointer;
    }

    .contenedor-tabla table {
        width: 100%;
        margin-top: 1rem;
        font-size: 1rem;

    }

    .contenedor-tabla .tabla-clientes td,
    th {
        word-wrap: break-word;
        white-space: normal;
    }

    .estado-badge {
        font-size: 1rem;
    }

    .estado-badge.activo {
        font-size: 1rem;
        color: var(--color-aprobado-1);
    }

    .estado-badge.cancelado {
        font-size: 1rem;
        color: var(--color-rojo-5);
    }

    .estado-badge.liquidado {
        font-size: 1rem;
        color: var(--color-amarillo-2);
    }

    .estado-badge .contenedor-tabla table span {
        font-size: 1.5rem;
        cursor: pointer;
    }



    .fila-expandida {
        font-size: 0.9rem;
        overflow-x: auto;
        max-width: 100%;
        box-sizing: border-box;
    }

    .fila-expandida .info-extra {
        white-space: initial;
    }
}
</style>

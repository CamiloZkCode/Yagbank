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
                        <option value="Diaria">Diaria</option>
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
                    <input v-model="clienteEditado.direccion_trabajo" placeholder="Dirección trabajo" />

                    <input v-model="clienteEditado.ocupacion" placeholder="Ocupación" />
                    <input v-model="clienteEditado.referencia" placeholder="Referencia" />

                    <!-- Selección de supervisor -->
                    <label>Selecciona el supervisor</label>
                    <select v-model="clienteEditado.id_supervisor" required>
                        <option disabled value="">Seleccione un supervisor</option>
                        <option v-for="sup in supervisores" :key="sup.id" :value="sup.id">{{ sup.nombre }}</option>
                    </select>

                    <!-- Selección de asesor -->
                    <label>Selecciona el asesor</label>
                    <select v-model="clienteEditado.id_asesor" required>
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
                    <input 
                    class="filtro-nom" 
                    type="text" 
                    placeholder="Busqueda por nombre" 
                    v-model="filtroNombre"
                    />
                    <span class="material-symbols-outlined">search</span>
                </div>
                </div>

                <div class="tabla-scrollable">
                <table class="tabla-clientes">
                    <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Préstamo</th>
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
                        <td>{{ cliente.nombre }} {{ cliente.apellido }}</td>
                        <td>${{ cliente.prestamo_activo ? formatNumber(cliente.prestamo_activo.valor_prestamo) : 'N/A' }}</td>
                        <td>{{ cliente.nombre_supervisor || 'N/A' }}</td>
                        <td>{{ cliente.nombre_asesor }}</td>
                        <td>
                            <span :class="['estado-badge', cliente.estado ? 'activo' : 'inactivo']">
                            {{ cliente.estado ? 'Activo' : 'Inactivo' }}
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
                            <strong>Documento:</strong> {{ cliente.documento_cliente }} &nbsp;&nbsp;|&nbsp;&nbsp;
                            <strong>Dirección:</strong> {{ cliente.direccion_casa }} &nbsp;&nbsp;|&nbsp;&nbsp;
                            <strong>Teléfono:</strong> {{ cliente.telefono }}
                            </div>

                            <div class="info-extra" v-if="cliente.prestamo_activo">
                            <strong>Crédito Activo:</strong> ${{ formatNumber(cliente.prestamo_activo.valor_prestamo) }}
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <strong>Cuotas:</strong> {{ cliente.prestamo_activo.numero_cuotas }}
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <strong>Valor Diario:</strong> ${{ formatNumber(cliente.prestamo_activo.valor_diario) }}
                            </div>

                            <div class="info-extra" v-if="cliente.prestamo_activo">
                            <strong>Inicio:</strong> {{ formatDate(cliente.prestamo_activo.fecha_inicio) }}
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <strong>Vencimiento:</strong> {{ formatDate(cliente.prestamo_activo.fecha_finalizacion) }}
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
                                    <th>Acciones</th>
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
                                    <button class="btn-detalle" @click="verDetallePrestamo(prestamo.id_prestamo)">
                                        Ver detalles
                                    </button>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { crearClientes,listarClientesConPrestamos } from '@/services/clientes'
import { crearPrestamos } from '@/services/prestamos'
import { obtenerSupervisores, obtenerAsesores } from '@/services/usuario'
import alertify from 'alertifyjs'
import 'alertifyjs/build/css/alertify.css'



const authStore = useAuthStore()
const usuarioLogueado = computed(() => authStore.user)

// Modales
const mostrarCliente = ref(false)
const mostrarCredito = ref(false)
const filtroNombre = ref('')
const mostrarEditarCliente = ref(false)
const cargando = ref(false)
const clientes = ref([])


//Estados Reactivos
const supervisores = ref([]) // Cargar lista de supervisores
const asesores = ref([]) // Cargar lista asesores
//const CreditoCliente = ref([]) // Carga clientes e info sobre el prestamo


// Formateadores
const formatNumber = (num) => {
  return new Intl.NumberFormat('es-CO').format(num)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('es-CO', options)
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

const archivos = ref({
    cedula: null,
    negocio: null,
    documentonegocio: null
})

// Función para guardar cliente
const guardarCliente = async () => {
    try {
        const guardar = await crearClientes(cliente.value)
        console.log('Cliente registrado:', cliente.value)

        // ✅ La alerta de éxito ahora contiene la lógica para cerrar el modal
        alertify.alert(
            'Cliente registrado con éxito',
            function () {
                // ✅ Esta función se ejecuta SÓLO cuando el usuario hace clic en 'OK'.
                // Aquí cerramos el modal principal, limpiamos el formulario y recargamos los datos.
                mostrarCliente.value = false;
                limpiarFormulario();
                cargarSupervisores();
            }
        ).set({
            transition: 'fade',
            movable: false,
            resizable: false,
            pinnable: false,
            closable: true,
        });
    } catch (error) {
        console.error(error);
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


const obtenerFechaActual = () => {
    const hoy = new Date()
    const year = hoy.getFullYear()
    const month = String(hoy.getMonth() + 1).padStart(2, '0')
    const day = String(hoy.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Creacion Prestamo
const credito = ref({
    documento_cliente: '',
    valor_prestamo: null,
    fecha_solicitud: obtenerFechaActual(),
    numero_cuotas: null,
    valor_diario: null,
    total: null,
    fecha_finalizacion: '',
    moneda: 'USD',
    forma_pago: 'Diaria',
    interes: 20
})


const resetearFormularioCredito = () => {
    credito.value = {
        documento_cliente: '',
        valor_prestamo: null,
        fecha_solicitud: obtenerFechaActual(),
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

watch([() => credito.value.valor_prestamo, () => credito.value.numero_cuotas], () => {
    const prestamo = parseFloat(credito.value.valor_prestamo)
    const cuotas = parseInt(credito.value.numero_cuotas)

    if (!isNaN(prestamo) && !isNaN(cuotas) && cuotas > 0 && Number.isInteger(cuotas)) {
        const totalConInteres = prestamo * 1.2
        credito.value.total = totalConInteres.toFixed(2)
        credito.value.valor_diario = (totalConInteres / cuotas).toFixed(2)

        const hoy = new Date()
        hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset())
        const fechaLocal = new Date(hoy)
        fechaLocal.setDate(fechaLocal.getDate()) // Comienza un día después
        let dias = cuotas
        while (dias > 0) {
            fechaLocal.setDate(fechaLocal.getDate() + 1)
            const dia = fechaLocal.getDay()
            if (dia !== 0) dias-- // Ignora domingos
        }
        credito.value.fecha_finalizacion = fechaLocal.toISOString().substring(0, 10)
    } else {
        credito.value.total = ""
        credito.value.valor_diario = ""
        credito.value.fecha_finalizacion = ""
    }
})

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

        console.log('Datos a enviar:', datosPrestamo)
        await crearPrestamos(datosPrestamo)


        alertify.alert(
            'Préstamo registrado con éxito',
            `
    <strong>Cliente:</strong> ${datosPrestamo.documento_cliente}<br>
    <strong>Valor:</strong> ${credito.value.valor_prestamo}<br>
    <strong>Cuotas:</strong> ${datosPrestamo.numero_cuotas}<br>
    <strong>Forma de pago:</strong> ${datosPrestamo.forma_pago}
  `,
            function () {
                mostrarCredito.value = false
                resetearFormularioCredito()
                CreditoCliente.value.push({
                    id_cliente: datosPrestamo.documento_cliente,
                    nombre: 'Cliente ' + datosPrestamo.documento_cliente,
                    numero_cuotas: datosPrestamo.numero_cuotas
                })
            }
        ).set({ transition: 'fade', movable: false })
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
    `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(termino) ||
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

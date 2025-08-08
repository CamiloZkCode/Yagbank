<template>
    <div>

        <div class="contenedor-botones">
            <button @click="mostrarUsuario = true">
                Crear Usuario
                <span class="material-symbols-outlined">assignment_ind</span>
            </button>

            <button>
                Asignar Ruta
                  <span class="material-symbols-outlined">edit_road</span>
            </button>
        </div>

        <!-- Modal: Crear Usuario -->
        <!-- Modal Usuario -->
        <div v-if="mostrarUsuario" class="modal-overlay">
            <div class="modal-content">
                <span class="material-symbols-outlined close-icon"
                    @click="mostrarUsuario = false; limpiarFormulario()">close</span>
                <h2>Registrar Usuario</h2>

                <form @submit.prevent="guardarUsuario">
                    <input v-model="usuario.id_usuario" type="number" placeholder="Cédula" required />
                    <input v-model="usuario.nombre" placeholder="Nombre de usuario" required />
                    <input v-model="usuario.correo" type="email" placeholder="Correo" required />
                    <input v-model="usuario.telefono" placeholder="Teléfono" required />

                    <!-- Selección de rol según usuario logueado -->
                    <select v-model="usuario.id_rol" required>
                        <option disabled value="">Seleccione un rol</option>
                        <option value="2">Supervisor</option>
                        <option value="3">Trabajador</option>
                    </select>

                    <!--Si  está creando trabajador: debe seleccionar supervisor -->
                    <select v-if="usuario.id_rol == 3" v-model="usuario.id_supervisor" required>
                        <option disabled value="">Seleccione un supervisor</option>
                        <option v-for="sup in supervisores" :key="sup.id" :value="sup.id">{{ sup.nombre }}</option>
                    </select>

                    <button type="submit">Guardar Usuario</button>
                </form>
            </div>
        </div>


        <div class="contenedor-tabla">
            <div class="filtros">
                <div class="filtro-cedula">
                    <input class="filtro-ced" type="text" placeholder="Buscar por cédula" v-model="filtroCedula" />
                    <span class="material-symbols-outlined">search</span>
                </div>

                <div class="filtro-cargo">
                    <label class="lblcargo">Cargo:</label>
                    <select v-model="filtroCargo">
                        <option value="">Todos los cargos</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Asesores">Asesores</option>
                    </select>
                </div>
            </div>

            <div class="tabla-scrollable">
                <table class="tabla-usuarios">
                    <thead>
                        <tr>
                            <th>Cedula</th>
                            <th>Nombre</th>
                            <th>Telefono</th>
                            <th>Cargo</th>
                            <th>Jefe</th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="usuario in usuariosFiltrados" :key="usuario.id_usuario">
                            <tr>
                                <td>{{ usuario.id }}</td>
                                <td>{{ usuario.nombre }}</td>
                                <td>{{ usuario.telefono }}</td>
                                <td>{{ usuario.cargo }}</td>
                                <td>{{ usuario.nombre_jefe }}</td>
                                <td>
                                    <span class="material-symbols-outlined delete">delete</span>
                                </td>
                                <td>
                                    <span class="material-symbols-outlined edit">edit</span>
                                </td>
                                <td>
                                    <span class="material-symbols-outlined ver-mas" @click="toggleExpand(usuario.id)">
                                        {{ usuarioExpandido === usuario.id ? 'keyboard_double_arrow_up' :
                                            'keyboard_double_arrow_down' }}
                                    </span>
                                </td>
                            </tr>

                            <tr v-if="usuarioExpandido === usuario.id">
                                <td colspan="7" class="fila-expandida">
                                    <div class="info-extra">
                                        <strong>Correo:</strong> {{ usuario.correo }} &nbsp;&nbsp;|&nbsp;&nbsp;
                                        <strong>Username:</strong> {{ usuario.username || 'N/A' }}

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

import { ref, computed, onMounted } from 'vue'
import { registrarUsuario, obtenerSupervisores, creartablaUsuarioXAdministrador } from '@/services/usuario'
import { useAuthStore } from '@/stores/auth'
import alertify from 'alertifyjs'
import 'alertifyjs/build/css/alertify.css'



//Recupera id administrador 
const authStore = useAuthStore()
const usuarioLogueado = computed(() => authStore.user)


// Control de visibilidad de modales
const mostrarUsuario = ref(false)

// Cargar Lista De supervisores
const supervisores = ref([])

// Datos del usuario a crear
const usuario = ref({
    id_usuario: '',
    nombre: '',
    correo: '',
    telefono: '',
    id_rol: '',
    id_administrador: null,
    id_supervisor: "",
})
// Funcion para limpiar formulario de crear usario
const limpiarFormulario = () => {
    usuario.value = {
        id_usuario: "",
        nombre: "",
        correo: "",
        telefono: "",
        id_rol: "",
        id_administrador: null,
        id_supervisor: "",
    };
};

// Función para guardar usuario (aquí accedes al la url gestionada por axios)
const guardarUsuario = async () => {
    try {
        if (usuario.value.id_rol == 2) {
            usuario.value.id_administrador = usuarioLogueado.value.id;
            usuario.value.id_supervisor = null;
        } else if (usuario.value.id_rol == 3) {
            usuario.value.id_administrador = usuario.value.id_supervisor;
            usuario.value.id_supervisor = null;
        }

        const respuesta = await registrarUsuario(usuario.value);

        // ✅ La alerta de éxito ahora contiene la lógica para cerrar el modal
        alertify.alert(
            'Usuario registrado con éxito',
            `
                <div style="text-align: left;">
                <strong>Nombre de usuario:</strong> ${respuesta.datos.username}<br>
                <strong>Contraseña temporal:</strong> ${respuesta.datos.contraseña_temporal}
                </div>
            `,
            function () {
                // ✅ Esta función se ejecuta SÓLO cuando el usuario hace clic en 'OK'.
                // Aquí cerramos el modal principal, limpiamos el formulario y recargamos los datos.
                mostrarUsuario.value = false;
                limpiarFormulario();
                cargarUsuariosDelAdministrador();
                if (usuario.value.id_rol == 2) {
                    cargarSupervisores();
                }
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
        alertify.alert('Error', error.message || 'Error al registrar usuario');
    }
};


const usuarioExpandido = ref(null)

const toggleExpand = (id) => {
    usuarioExpandido.value = usuarioExpandido.value === id ? null : id
}

const cargarSupervisores = async () => {
    try {
        supervisores.value = await obtenerSupervisores()
    } catch (error) {
        console.error('Error al obtener supervisores:', error)
    }
}

onMounted(async () => {
    console.log('Iniciando carga de datos...')
    try {
        await cargarUsuariosDelAdministrador()
        await cargarSupervisores()
        console.log('Datos cargados completamente')
    } catch (error) {
        console.error('Error en mounted:', error)
    }
})

async function cargarUsuariosDelAdministrador() {
    try {
        const data = {
            id_administrador: usuarioLogueado.value.id
        }

        const resultado = await creartablaUsuarioXAdministrador(data)

        // FORMA MÁS SEGURA DE ASIGNAR (garantiza reactividad)
        usuarios.value = Array.isArray(resultado) ? [...resultado] : []

    } catch (error) {
        console.error("Error al cargar usuarios:", error)
        usuarios.value = [] // Limpiar en caso de error
    }
}

const usuarios = ref([])


const filtroCedula = ref('')
const filtroCargo = ref('')

// Filtro combinado
const usuariosFiltrados = computed(() => {
    if (!Array.isArray(usuarios.value)) return []

    return usuarios.value.filter(usuario => {
        const usuarioValido = usuario && typeof usuario === 'object'
        if (!usuarioValido) return false

        const coincideCedula = usuario.id?.toString()
            .includes(filtroCedula.value.trim())

        const coincideCargo = filtroCargo.value === '' ||
            (usuario.cargo || '').toLowerCase()
                .includes(filtroCargo.value.toLowerCase())

        return coincideCedula && coincideCargo
    })
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

button:hover {
    background: var(--color-azul-1);
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
    border-radius: 10px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
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

.filtros {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0 0.5rem;
    align-items: center;
}

.filtro-cedula {
    display: flex;
    align-items: center;
    background: var(--color-blanco);
    padding: 0 0.6rem;
    border-radius: 0.4rem;
    border: 1px solid var(--color-info-luz);
    width: 16rem;
}

.filtro-cedula .filtro-ced {
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

.filtro-cedula .material-symbols-outlined {
    margin-left: 0.5rem;
    font-size: 1.2rem;
    color: var(--color-oscuro);
    cursor: pointer;
}

.filtro-cargo {
    display: flex;
    align-items: center;
    justify-content: center;
}

.filtro-cargo .lblcargo {
    font-size: 1rem;
    margin-right: 1rem;
}

.filtro-cargo select {
    width: 16rem;
    padding: 0.8rem;
    border-radius: 0.4rem;
    border: 1px solid var(--color-info-luz);
    font-size: 0.9rem;
    margin: 0;
    background: var(--color-blanco);
    color: var(--color-oscuro);
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

.contenedor-tabla .tabla-usuarios {
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

.delete,
.ver-mas,
.edit {
    cursor: pointer;
}

.delete {
    color: var(--color-rojo-5);
}

.ver-mas {
    color: var(--color-azul-1);
}

.edit {
    color: var(--color-amarillo-2);
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



    /*===tabla ====*/

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

    .filtro-cargo {
        flex-direction: column;
        align-items: flex-start;
        width: 80%;
    }

    .tabla-scrollable {
        max-height: 50vh;
    }


    .contenedor-tabla {
        position: relative;
        margin: 2rem 0 0 0;
    }

    .contenedor-tabla .tabla-usuarios {
        min-width: 160%;
    }

    .contenedor-tabla table {
        width: 100%;
        margin-top: 1rem;
        font-size: 1rem;
    }

    .contenedor-tabla table span {
        font-size: 1.2rem;
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

<template>
    <div>
        <div class="contenedor-botones">
            <button @click="mostrarUsuario = true">
                Crear Usuario
                <img class="icono-boton" src="/src/assets/Icons/CrearUser.png" alt="">
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

                    <button type="submit">Guardar Usuario</button>
                </form>
            </div>
        </div>


        <div class="contenedor-tabla">
            <div class="filtros">
                <div class="filtro-cedula">
                    <input class="filtro-ced" type="text" placeholder="Buscar por Nombre" v-model="filtroNombre" />
                    <span class="material-symbols-outlined">search</span>
                </div>
            </div>

            <div class="tabla-scrollable">
                <table class="tabla-usuarios">
                    <thead>
                        <tr>
                            <th>Cedula</th>
                            <th>Nombre</th>
                            <th>Telefono</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="usuario in usuariosFiltrados" :key="usuario.id_usuario">
                            <tr>
                                <td>{{ usuario.id_usuario }}</td>
                                <td>{{ usuario.nombre }}</td>
                                <td>{{ usuario.telefono }}</td>
                                <td>
                                    <span class="material-symbols-outlined ver-mas"
                                        @click="toggleExpand(usuario.id_usuario)">
                                        {{ usuarioExpandido === usuario.id ? 'keyboard_double_arrow_up' :
                                            'keyboard_double_arrow_down' }}
                                    </span>
                                </td>
                            </tr>

                            <tr v-if="usuarioExpandido === usuario.id_usuario">
                                <td colspan="7" class="fila-expandida">
                                    <div class="info-extra">
                                        <strong>Username:</strong> {{ usuario.username || 'N/A' }}
                                        &nbsp;&nbsp;|&nbsp;&nbsp;
                                        <strong>Estado:</strong> {{ usuario.estado === 1 ? 'Activo' : 'Inactivo' }}
                                    </div>
                                    <div class="info-extra">
                                        <strong>Correo:</strong> {{ usuario.correo }}
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
import { registrarUsuario, creartablaUsuarioXSupervisor } from '@/services/usuario'
import { useAuthStore } from '@/stores/auth'
import alertify from 'alertifyjs'
import 'alertifyjs/build/css/alertify.css'

const authStore = useAuthStore()

// Estado reactivo para el usuario logueado
const usuarioLogueado = computed(() => authStore.user)

// Verificación inicial
console.log('Datos usuario logueado:', usuarioLogueado.value)

// Estados reactivos
const mostrarUsuario = ref(false)
const usuarioExpandido = ref(null)
const usuarios = ref([])
const filtroNombre = ref('')

// Datos del usuario a crear
const usuario = ref({
    id_usuario: '',
    nombre: '',
    correo: '',
    telefono: '',
    id_rol: 3,
    id_administrador: usuarioLogueado.value?.id || null, // Usamos id en lugar de id_usuario
})

// Computed
const usuariosFiltrados = computed(() => {
    return usuarios.value.filter(u =>
        u.nombre?.toLowerCase().includes(filtroNombre.value.trim().toLowerCase())
    );
});

// Funciones
const limpiarFormulario = () => {
    usuario.value = {
        id_usuario: "",
        nombre: "",
        correo: "",
        telefono: "",
        id_rol: 3,
        id_administrador: usuarioLogueado.value?.id || null, // Usamos id
    };
};

const guardarUsuario = async () => {
    try {
        if (!usuarioLogueado.value?.id) {
            throw new Error('No se pudo identificar al supervisor logueado');
        }

        const usuarioAEnviar = {
            ...usuario.value,
            id_administrador: usuarioLogueado.value.id // Usamos id
        };

        const respuesta = await registrarUsuario(usuarioAEnviar);

        alertify.success('Asesor creado correctamente', 3);
        mostrarUsuario.value = false;
        limpiarFormulario();
        await cargarAsesores();

    } catch (error) {
        console.error('Error al registrar:', error);
        alertify.error(error.response?.data?.message || error.message);
    }
};

const toggleExpand = (id) => {
    usuarioExpandido.value = usuarioExpandido.value === id ? null : id
}




const cargarAsesores = async () => {
    try {
        const data = {
            id_supervisor: usuarioLogueado.value.id
        };

        const resultado = await creartablaUsuarioXSupervisor(data);

        // Asignación directa manteniendo la estructura original
        usuarios.value = Array.isArray(resultado) ? [...resultado] : [];

    } catch (error) {
        console.error("Error al cargar asesores:", error);
        usuarios.value = [];
        alertify.error("Error al cargar la lista de asesores");
    }
}
//Hooks
onMounted(async () => {
    console.log('Iniciando carga de datos...')
    try {
        await cargarAsesores()
        console.log('ID Usuario Logueado:', usuarioLogueado.value);

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


.icono-boton {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
    cursor: pointer;
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

/*===========================ESTADO USUARIO========================*/

.icon-estado {
    cursor: pointer;
    font-size: 2rem;
    transition: color 0.3s ease;
}

.icon-activo {
    color: #4CAF50;
    /* Verde para activo */
}

.icon-inactivo {
    color: #F44336;
    /* Rojo para inactivo */
}

/*===============Fin estado Usuario ==================*/

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

    .tabla-scrollable {
        max-height: 50vh;
    }


    .contenedor-tabla {
        position: relative;
        margin: 2rem 0 0 0;
    }

    .contenedor-tabla .tabla-usuarios {
        min-width: 120%;
    }

    .contenedor-tabla table {
        width: 100%;
        margin-top: 1rem;
        font-size: 1.1rem;
    }

    .contenedor-tabla table span {
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

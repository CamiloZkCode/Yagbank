<template>
    <main>
        <div class="contenedor">
            <div class="toggle-box">
                <div class="toggle-panel">
                    <h1>¡Nueva!</h1>
                    <h2 class="empresa">YAG<span class="danger"> BANK</span></h2>
                    <img class="logo" src="@/assets/img/logo.png" alt="logo" />
                    <p class="mensaje">Por favor ingresa tu nueva contraseña</p>
                </div>
            </div>

            <div class="box-formulario">
                <form @submit.prevent="handleChangePassword">
                    <h1>Cambiar Contraseña</h1>

                    <div class="input-box">
                        <input :type="showPassword ? 'text' : 'password'" v-model="nuevaContrasena"
                            placeholder="Nueva contraseña" required minlength="6" />
                        <span class="material-symbols-outlined" @click="showPassword = !showPassword"
                            style="cursor: pointer;">
                            {{ showPassword ? 'visibility' : 'visibility_off' }}
                        </span>
                    </div>

                    <div class="input-box">
                        <input :type="showPasswordConfirm ? 'text' : 'password'" v-model="confirmarContrasena"
                            placeholder="Confirmar nueva contraseña" required minlength="6" />
                        <span class="material-symbols-outlined" @click="showPasswordConfirm = !showPasswordConfirm"
                            style="cursor: pointer;">
                            {{ showPasswordConfirm ? 'visibility' : 'visibility_off' }}
                        </span>
                    </div>

                    <button type="submit" class="btn-sesion">Actualizar contraseña</button>

                    <p v-if="error" class="error">{{ error }}</p>
                    <p v-if="exito" class="exito">{{ exito }}</p>
                </form>
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref } from 'vue'
import alertify from 'alertifyjs'
import { cambiarContrasena } from '@/services/usuario'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()



const nuevaContrasena = ref('')
const confirmarContrasena = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)



async function handleChangePassword() {
    if (nuevaContrasena.value !== confirmarContrasena.value) {
        alertify.error('Las contraseñas no coinciden')
        return
    }

    try {
        await cambiarContrasena({
            nuevaContrasena: nuevaContrasena.value,
        })

        alertify.success('Contraseña actualizada correctamente')
        setTimeout(() => {
            authStore.logout() // corregido
            router.push('/')
        }, 2000)
    } catch (err) {
        console.error(err)
        alertify.error(err.message || 'Error al actualizar la contraseña')
    }
}
</script>

<style scoped>
img {
    display: block;
    width: 100%;
}

h1 {
    font-weight: 800;
    font-size: 1.8rem;
}

h2 {
    font-size: 1.2rem;
    font-weight: 600;
}

small {
    font-size: 0.75rem;
}

.texto-muted {
    color: var(--color-info-gris);
}

p {
    color: var(--color-dark-variant);
    margin: 0.2rem 0;
}


b {
    color: var(--color-oscuro)
}

.primary {
    color: var(--color-azul-1);
}

.danger {
    color: var(--color-rojo-5);
}

.success {
    color: var(--color-aprobado-1);
}

.warning {
    color: var(--color-amarillo-2);
}

main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-image: url('@/assets/img/fondo-login1.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    margin: 0;
    padding: 1rem;
}

.contenedor {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 850px;
    height: 550px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--card-border-radius);
    box-shadow: var(--box-shadow);
    overflow: hidden;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.toggle-box {
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    color: var(--color-blanco);
    text-align: center;
}

.toggle-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
    text-align: center;
}

.toggle-panel h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--color-blanco);
}

.toggle-panel .empresa {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
    color: var(--color-blanco);
}

.logo {
    width: 120px;
    height: auto;
    margin-bottom: 1rem;
}

.toggle-panel .mensaje {
    font-size: 1rem;
    color: var(--color-blanco);
    margin-top: 1rem;
    max-width: 300px;
}



/* ⚪ Panel derecho */
.box-formulario {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: var(--color-blanco);
    text-align: center;
}

.box-formulario form {
    width: 100%;
}

h1 {
    font-weight: 800;
    font-size: 1.8rem;
    color: var(--color-blanco);
    margin-bottom: 1.5rem;
}

.input-box {
    position: relative;
    margin: 2rem 0;
}

.input-box input {
    width: 100%;
    padding: 1rem 2rem 1rem 1.5rem;
    background: var(--color-background);
    border: 1px solid var(--color-info-luz);
    border-radius: var(--border-radius-1);
    color: var(--color-oscuro);
    font-size: 1rem;
    font-weight: 500;
    transition: 0.3s ease;
}

.input-box input::placeholder {
    color: var(--color-info-gris);
    font-weight: 400;
}

.input-box span {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.5rem;
    color: var(--color-oscuro);
}

input:focus {
    border-color: var(--color-azul-1);
    outline: none;
    background: var(--color-background);
}

button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 1.2rem;
    font-size: 1rem;
    background: var(--color-rojo-5);
    color: var(--color-blanco);
    border: none;
    border-radius: 0.4rem;
    cursor: pointer;
    height: 2.2rem;
    line-height: 1;
    box-shadow: 0 5px 6px rgba(0, 0, 0, 0.2);
}

button:hover {
    background: var(--color-rojo-5);
}

.error {
    color: var(--color-rojo-5);
    margin-top: 0.75rem;
    font-size: 0.9rem;
}

/*===============Media Query===============================*/

@media screen and (max-width:768px) {

    main {
        height: auto;
        align-items: center;
    }

    .contenedor {
        display: grid;
        grid-template-columns: 1fr;

    }

    .toggle-box,
    .box-formulario {
        padding: 1rem 1.5rem;
    }

    .toggle-panel {
        padding: 0;
    }

    .toggle-panel h1 {
        font-size: 2rem;
        margin-bottom: 0.2rem;
    }

    .toggle-panel .empresa {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }

    .box-formulario h1 {
        display: none;
    }

    .box-formulario form {
        padding: 0;
        margin: 0;
    }

    .input-box {
        margin: 0.8rem 0;
    }

}
</style>

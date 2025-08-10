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
    background: var(--color-background);
    margin: 0;
}

.contenedor {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 850px;
    height: 550px;
    background: var(--color-blanco);
    border-radius: var(--card-border-radius);
    box-shadow: var(--box-shadow);
    overflow: hidden;
}

.toggle-box {
    background: var(--color-blanco);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    color: var(--color-oscuro);
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
    color: var(--color-oscuro);
}

.toggle-panel .empresa {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
    color: var(--color-oscuro);
}

.logo {
    width: 120px;
    height: auto;
    margin-bottom: 1rem;
}

.toggle-panel .mensaje {
    font-size: 1rem;
    color: var(--color-dark-variant);
    margin-top: 1rem;
    max-width: 300px;
}



/* ⚪ Panel derecho */
.box-formulario {
    background-color: var(--color-blanco);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: var(--color-oscuro);
    text-align: center;
}

.box-formulario form {
    width: 100%;
}

h1 {
    font-weight: 800;
    font-size: 1.8rem;
    color: var(--color-oscuro);
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
    width: 50%;
    padding: 0.75rem;
    background: var(--color-azul-1);
    color: var(--color-blanco);
    font-weight: 500;
    font-size: 1rem;
    border: none;
    border-radius: var(--border-radius-2);
    cursor: pointer;
    transition: 0.3s ease;
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

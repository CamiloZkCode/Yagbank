<template>
    <aside :class="{ abierto: menuStore.abierto }">
        <!-- Versión móvil -->
        <div class="sidebar-mobile" v-if="isMobile">
            <div class="logo-mobile">
                <img src="@/assets/img/logo.png" alt="logo">
            </div>
            <div class="nav-links">
                <router-link to="/inicio" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Home.png" alt="">
                </router-link>

                <router-link to="/usuarios" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Usuario.png" alt="">
                </router-link>

                <router-link to="/credito-cliente" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Credito.png" alt="">
                </router-link>

                <router-link to="/credito-funcionario" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/CreditoFuncionario.png" alt="">
                </router-link>

                <router-link to="/ingresos" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Ingre.png" alt="">
                </router-link>

                <router-link to="/gastos" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Gastos.png" alt="">
                </router-link>

                <router-link to="/caja" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Caja1.png" alt="">
                </router-link>

                <router-link to="/caja-mes" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/CajaMensual.png" alt="">
                </router-link>

                <router-link to="/politicas" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Info.png" alt="">
                </router-link>

                <a href="#" @click.prevent="handleLogout" class="mi-enlace">
                    <img class="icono-sidebar" src="/src/assets/icons/Logout.png" alt="">
                </a>


            </div>
        </div>

        <!-- Versión desktop -->
        <div v-else>
            <div class="top">
                <div class="logo">
                    <img src="@/assets/img/logo.png" alt="logo">
                    <h2>YAG <span class="danger">BANK</span></h2>
                </div>
                <div class="cerrar" id="cerrar-btn" @click="cerrarMenu">
                    <span class="material-symbols-outlined">close</span>
                </div>
            </div>

            <div class="sidebar">
                <router-link to="/inicio" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Home.png" alt="">
                    <h3>Inicio</h3>
                </router-link>

                <router-link v-if="auth.isAdmin || auth.isSupervisor" to="/usuarios" class="mi-enlace"
                    active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Usuario.png" alt="">
                    <h3>Gestion Usuarios</h3>
                </router-link>

                <router-link to="/credito-cliente" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Credito.png" alt="">
                    <h3>Credito Cliente</h3>
                </router-link>

                <router-link to="/credito-funcionario" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/CreditoFuncionario.png" alt="">
                    <h3>Credito Funcionario</h3>
                </router-link>

                <router-link v-if="auth.isAdmin" to="/ingresos" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Ingre.png" alt="">
                    <h3>Informe Ingresos</h3>
                </router-link>

                <router-link to="/gastos" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Gastos.png" alt="">
                    <h3>informe Gastos</h3>
                </router-link>

                <router-link to="/caja" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Caja1.png" alt="">
                    <h3>Caja</h3>
                </router-link>


                <router-link to="/caja-mes" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/CajaMensual.png" alt="">
                    <h3>Caja Mensual</h3>
                </router-link>

                <router-link to="/politicas" class="mi-enlace" active-class="active">
                    <img class="icono-sidebar" src="/src/assets/icons/Info.png" alt="">
                    <h3>Politicas</h3>
                </router-link>

                <a href="#" @click.prevent="handleLogout" class="mi-enlace">
                    <img class="icono-sidebar" src="/src/assets/icons/Logout.png" alt="">
                    <h3>Cerrar Sesión</h3>
                </a>


            </div>
        </div>
    </aside>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useRouter } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const auth = useAuthStore()
const menuStore = useMenuStore()
const router = useRouter()
const isMobile = ref(false)

function checkScreenSize() {
    isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', checkScreenSize)
})

function cerrarMenu() {
    menuStore.abierto = false
}

function handleLogout() {
    auth.logout()
    router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

.material-symbols-outlined {
    font-variation-settings:
        'FILL' 1,
        'wght' 400,
        'GRAD' 0,
        'opsz' 24
}

.mi-enlace {
    color: var(--color-oscuro);
    text-decoration: none;
}

img {
    display: block;
    width: 100%;
}

h1 {
    font-weight: 800;
    font-size: 1.8rem;
}

h2 {
    font-size: 1.4rem;
    font-weight: 600;
}

h3 {
    font-size: 0.87rem;
}

h4 {
    font-size: 0.8rem;
}

h5 {
    font-size: 0.77rem;
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

/*===========================ASIDEBAR ===============*/
aside {
    height: 100vh;
}

aside .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1.4rem;
}

aside .logo {
    display: flex;
    gap: 0.5rem;
}

aside .logo img {
    width: 3rem;
    height: 3rem;
}

aside .cerrar {
    display: none;
}

/*==================== SIDEBAR ================*/
aside .sidebar {
    display: flex;
    flex-direction: column;
    height: 86vh;
    position: relative;
    top: 1.5rem;
}

aside h3 {
    font-weight: 500;
}

aside .sidebar .mi-enlace {
    display: flex;
    color: var(--color-info-gris);
    margin-left: 1.6rem;
    gap: 1rem;
    align-items: center;
    position: relative;
    height: 3.4rem;
    transition: all 300ms ease;
}

.icono-sidebar {
    width: 1.6rem;
    height: 1.6rem;
    object-fit: contain;

}

aside .sidebar .mi-enlace span {
    font-size: 1.6rem;
    transition: all 300ms ease;
}

aside .sidebar .mi-enlace:last-child {
    position: absolute;
    bottom: 2rem;
    width: 100%;
}

aside .sidebar .mi-enlace.active {
    background: var(--color-light);
    color: var(--color-azul-1);
    margin-left: 0;
}

aside .sidebar .mi-enlace.active:before {
    content: "";
    width: 6px;
    height: 100%;
    background: var(--color-azul-1);
}

aside .sidebar .mi-enlace.active span {
    color: var(--color-azul-1);
    margin-left: calc(1rem - 3px);
}

aside .sidebar .mi-enlace:hover {
    color: var(--color-azul-1);
}

aside .sidebar .mi-enlace:hover span {
    margin-left: 1rem;
}

/*==================== MEDIA QUERIES ==================*/
@media screen and (max-width: 1200px) {
    aside .logo h2 {
        display: none;
    }

    aside .sidebar h3 {
        display: none;
    }

    aside .sidebar .mi-enlace {
        width: 5.6rem;
    }

    aside .sidebar .mi-enlace:last-child {
        position: relative;
        margin-top: 1.8rem;
    }
}

/*=== Mobile (768px) ===*/
@media screen and (max-width: 768px) {
    aside {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 5rem;
        background: var(--color-blanco);
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .sidebar-mobile {
        display: flex;
        align-items: center;
        height: 100%;
        padding: 0 1rem;
    }

    .logo-mobile img {
        width: 2.5rem;
        height: 2.5rem;
        margin-right: 1rem;
    }


    .icono-sidebar {
        width: 2.5rem;
        height: 2.5rem;
        object-fit: contain;
    }

    .nav-links {
        display: flex;
        overflow-x: auto;
        flex: 1;
        gap: 1rem;
        padding: 0.8rem 0;
        -webkit-overflow-scrolling: touch;
    }

    .nav-links::-webkit-scrollbar {
        display: none;
    }

    .nav-links .mi-enlace {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 4rem;
        height: 4rem;
        border-radius: 50%;
        background: var(--color-light);
    }

    .nav-links .mi-enlace.active {
        background: var(--color-dark-variant);
    }

    .nav-links .mi-enlace span {
        font-size: 2rem;
    }

    /* Oculta elementos no necesarios en mobile */
    .top,
    .sidebar:not(.sidebar-mobile) {
        display: none;
    }
}
</style>
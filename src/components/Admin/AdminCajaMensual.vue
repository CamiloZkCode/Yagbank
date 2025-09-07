<template>
    <div class="global">
        <h1>Caja Mensual {{ userName }}</h1>
        <div class="contenedor-datos">
            <div class="fechas">
                <h3>Fecha Inicial:</h3>
                <input type="text" readonly>
                <h3>Fecha Final:</h3>
                <input type="text" readonly>
            </div>

            <div class="datos">
                <!-- Tarjetas Activas -->
                <div class="tarjetas">
                    <div class="tarjeta">
                        <h3>Tarjetas Activas</h3>
                    </div>
                    <div class="valores">
                        <span>80</span>
                    </div>
                </div>

                <!-- Datos Capital -->
                <div class="datos-capital">
                    <div class="capital">
                        <h3>Datos Capital</h3>
                        <h3>$13000</h3>
                    </div>
                    <div class="valores-capital">
                        <span>Fecha Cambio: <b>2025-10-31</b> </span>
                        <span>C.Tarjetas: <b>$11.250</b></span>
                        <span>Efectivo: <b>$1924</b></span>
                        <span>Capital: <b>$11076</b></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="contenedor-tabla">
            <div class="tabla-scrollable">
                <table class="tabla-cajamensual">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Caja Inicial</th>
                            <th>Recogica</th>
                            <th>Prestamo</th>
                            <th>Gastos</th>
                            <th>Tarjetas</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template>
                            <tr>
                                <td>

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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userName = computed(() => authStore.user?.nombre || 'Usuario no identificado');


</script>
<style scoped>
.global h1{
    display: flex;
    justify-content: center;
}
.contenedor-datos {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--color-morado-4);
    color: var(--color-blanco);
    border-radius: var(--card-border-radius);
    box-shadow: var(--box-shadow);
    padding: var(--card-padding);
    margin-top: 1rem;
}

/* Fechas */
.fechas {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
    font-size: 1rem;
    width: 100%;
    max-width: 400px;
}

input {
    font-size: 1rem;
    border-radius: 5px;
    padding: 0.5rem;
    width: 100%;
}

/* Contenedor de tarjetas */
.datos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
    width: 60%;
}

/* Tarjeta normal */
.datos .tarjetas {
    display: flex;
    flex-direction: column;
    background: var(--color-oscuro);
    color: var(--color-blanco);
    min-height: 100px;
    align-items: center;
    border-radius: var(--card-border-radius);
    box-shadow: var(--box-shadow);
}

.datos .tarjetas .tarjeta {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.5rem;
}

.datos .tarjetas .valores {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    font-weight: bold;
    width: 100%;
}

/* Capital */
.datos .datos-capital {
    display: flex;
    flex-direction: column;
    background: var(--color-oscuro);
    color: var(--color-blanco);
    min-height: 140px;
    border-radius: var(--card-border-radius);
    box-shadow: var(--box-shadow);
}

.datos .datos-capital .capital {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.3rem;
}

.datos .datos-capital .valores-capital {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.3rem;
    font-weight: bold;
    font-size: 1rem;
    padding: 0.3rem;
}

/*====================TABLA================0*/

.contenedor-tabla {
    margin-top: 1.0rem;
}

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

@media screen and (max-width: 768px) {
    .fechas {
        font-size: 0.9rem;
    }

    .datos {
        grid-template-columns: 1fr 2fr;
        /* ✅ Tarjetas pequeñas, Capital más grande */
        width: 100%;
    }

    .datos .tarjetas h3 {
        font-size: 0.95rem;
        text-align: center;
        justify-content: center;
    }

    .datos .tarjetas {
        min-height: 80px;
        font-size: 0.9rem;
    }



    .datos .datos-capital {
        min-height: 120px;
        font-size: 0.9rem;
    }

    .datos .tarjetas .valores {
        font-size: 1rem;
    }

    .datos .datos-capital .valores-capital {
        font-size: 0.85rem;
        gap: 0.2rem;
        padding: 0.5rem;
    }
}
</style>

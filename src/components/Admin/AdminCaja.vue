<template>
    <div class="global">
        <h1>Caja Nombre Funcionario</h1>
        <div class="contenedor-caja">
            <div class="cabecera-formulario">
                <div class="fecha-centrada">{{ formatoFecha(formulario.fecha) }}</div>
                   <router-link to="/caja-mes" class="enlace-calendario"> <span class="icono-calendario material-symbols-outlined">
                    calendar_month
                </span> </router-link>
            </div>

            <div class="caja-diaria">
                <form action="">
                    <div class="punto-formulario">
                        <label>Ingresos:</label>
                        <input type="number" v-model="valorDesdeBD" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label>Caja Inicial:</label>
                        <input type="number" v-model="valorDesdeBD" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label>Recogida:</label>
                        <input type="number" v-model="valorDesdeBD" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label>Prestamos:</label>
                        <input type="number" v-model="valorDesdeBD" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label>Gastos:</label>
                        <input type="number" v-model="valorDesdeBD" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label>Caja:</label>
                        <input type="number" v-model="valorDesdeBD" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label>Clavos Total:</label>
                        <input type="number" v-model="valorDesdeBD" readonly>
                    </div>
                    <div class="punto-formulario">
                        <label>Clientes Clavo:</label>
                        <input type="number" v-model="valorDesdeBD" readonly>
                    </div>

                    <div class="contenedor-boton">
                        <button>CONFIRMAR CUADRE</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref} from 'vue';

const valorDesdeBD = ref(0); // Este valor vendría de tu base de datos

const formulario = ref({
  fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
  ingresos: 0,
  cajaInicial: 0,
  recogida: 0,
  prestamos: 0,
  gastos: 0,
  cajaFinal: 0,
  clavosTotal: 0,
  clientesClavo: 0
});

// Función para formatear la fecha visualmente
const formatoFecha = (fechaISO) => {
  const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(fechaISO).toLocaleDateString('es-ES', opciones);
};

</script>

<style scoped>
.global {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
}

.contenedor-caja {
    width: 1000px;
    border: 1px solid var(--color-info-luz);
    position: relative;
    background: var(--color-blanco);
    border-radius: 1rem;
    margin-top: 1rem;


}

.cabecera-formulario {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--color-info-luz);
}

.enlace-calendario {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  text-decoration: none;
}

.icono-calendario {
  padding: 0.4rem;
  background: var(--color-azul-1);
  color: var(--color-blanco);
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Asegúrate de que la fecha quede centrada */
.fecha-centrada {
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
  width: 100%;
}
.caja-diaria {
    padding: 1.5rem;
}

.caja-diaria form {
    width: 100%;
    max-width: 100%;
}

.punto-formulario {
    display: flex;
    align-items: center;
    padding: 0.48rem;
    border-bottom: 1px solid var(--color-info-luz);
}

.punto-formulario label {
    text-align: left;
    left: 0;
    width: 1000px;
    padding-right: 2rem;
    font-size: 1.1rem;
    font-weight: 500;
}

.punto-formulario input {
    flex-grow: 1;
    padding: 0.5rem;
    border-radius: 4px;
    font-weight: 550;
    width: 200px;
    font-size: 1.1rem;
    text-align: right;
}

.punto-formulario input::-webkit-outer-spin-button,
.punto-formulario input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.contenedor-boton {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
    width: 100%;
}

button {
    width: 90%;
    max-width: 800px;
    padding: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    background: var(--color-azul-1);
    color: var(--color-blanco);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background: var(--color-aprobado-1);
}




/*=============================Media Querry=========================================*/


@media screen and (max-width: 768px) {
    .global {
        padding: 0.5rem;
    }

    .contenedor-caja {
        width: 100%;
        max-width: 100%;
    }

    .cabecera-formulario {
        height: 35px;
    }

    .fecha-centrada {
        font-size: 1rem;
    }

    .icono-calendario {
        right: 10px;
        padding: 0.3rem;
        font-size: 1.3rem;
    }

    .caja-diaria {
        padding: 1rem;
    }

    .punto-formulario {
        flex-wrap: nowrap;
        margin-bottom: 1rem;
        padding: 0.3rem;
    }


    .punto-formulario label {
        width: 40%;
        min-width: 120px;
        text-align: left;
        font-size: 0.95rem;
        padding-right: 0;
    }

    .punto-formulario input {
        width: 60%;
        max-width: 250px;
        padding: 0.5rem;
        font-size: 0.95rem;
    }

    .contenedor-boton {
        margin: 1.5rem 0;
    }

    button {
        width: 100%;
        max-width: 100%;
        padding: 0.8rem;
    }
}
</style>
<template>
    <div>
        <div class="contenedor-botones">
            <button class="gastos" @click="mostrarGastos = true">
                Registrar Gasto
                <img class="icono-boton" src="/src/assets/Icons/GastosBoton.png" alt="">
            </button>
        </div>


        <!-- Modal Gastos -->
        <div v-if="mostrarGastos" class="modal-overlay">
            <div class="modal-content">
                <span class="material-symbols-outlined close-icon" @click="mostrarGastos = false">close</span>
                <h2>Registrar Gasto</h2>
                <form @submit.prevent="guardarGasto">

                    <!-- Tipo de Gasto -->
                    <label>Tipo de Gasto:</label>
                    <select v-model="gasto.tipo" required>
                        <option disabled value="">-- Tipo de Gasto --</option>
                        <option value="Ahorro">Ahorro</option>
                        <option value="Retiro">Retiro</option>
                        <option value="Gasolina">Gasolina</option>
                        <option value="Lavada">Lavada</option>
                        <option value="Pinchada">Pinchada</option>
                        <option value="Cambio de Aceite">Cambio de Aceite</option>
                        <option value="Internet Celular">Internet Celular</option>
                        <option value="Nomina Lider">Nómina Líder</option>
                        <option value="Nomina Encargado de Sede">Nómina Encargado de Sede</option>
                        <option value="Nomina Auditor">Nómina Auditor</option>
                        <option value="Servicio de Luz">Servicio de Luz</option>
                        <option value="Servicio de Agua">Servicio de Agua</option>
                        <option value="Servicio Internet Casa">Servicio Internet Casa</option>
                        <option value="Compra de Moto">Compra de Moto</option>
                        <option value="Impermeable">Impermeable</option>
                        <option value="Casco">Casco</option>
                        <option value="Chaleco Reflectivo">Chaleco Reflectivo</option>
                    </select>

                    <!-- Nombre del Gasto -->
                    <label>Nombre del Gasto:</label>
                    <input v-model="gasto.nombre" type="text" placeholder="Ingrese nombre del gasto" required />

                    <!-- Valor -->
                    <label>Valor del Gasto:</label>
                    <input v-model="gasto.valor" type="number" placeholder="Monto" required min="1" />

                    <!-- Fecha (automática) -->
                    <label>Fecha:</label>
                    <input v-model="gasto.fecha" type="date" readonly />

                    <!-- Foto Prueba -->
                    <label>Foto Prueba:</label>
                    <input type="file" @change="onFileChange" accept="image/*" />

                    <!-- Descripción -->
                    <label>Descripción:</label>
                    <textarea v-model="gasto.descripcion" placeholder="Descripción" rows="3"></textarea>

                    <button type="submit">Guardar Gasto</button>
                </form>
            </div>
        </div>



    </div>


</template>

<script setup>
import { ref } from 'vue'

// Modal
const mostrarGastos = ref(false)

// Gasto nuevo
const gasto = ref({
    tipo: '',
    nombre: '',
    valor: null,
    fecha: new Date().toISOString().substring(0, 10), // Fecha automática
    descripcion: '',
    foto: null
})


// Manejo de archivo
const onFileChange = (e) => {
    gasto.value.foto = e.target.files[0] || null
}

// Guardar gasto
const guardarGasto = () => {
    const nuevo = {
        id: Date.now(),
        ...gasto.value
    }

    listaGastos.value.push(nuevo)
    mostrarGastos.value = false

    gasto.value = {
        tipo: '',
        nombre: '',
        valor: null,
        fecha: new Date().toISOString().substring(0, 10),
        descripcion: '',
        foto: null
    }
}

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

.contenedor-botones .gastos {
    background: var(--color-morado-4);
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

.icono-boton{
    width: 2rem;
    height: 2rem;
    object-fit: contain;
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

textarea {
    width: 100%;
    resize: vertical;
    padding: 0.5rem;
    border: 1px solid var(--color-info-luz);
    border-radius: 6px;
    margin-bottom: 10px;
}

.close-icon:hover {
    color: var(--color-rojo-5);
}
</style>
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useCajaStore } from '@/stores/caja';

const cajaStore = useCajaStore();
let stopAvisoTimer; // Variable para almacenar la función de limpieza

onMounted(() => {
  stopAvisoTimer = cajaStore.startAvisoTimer(); // Iniciar el temporizador y guardar la función de limpieza
});

onUnmounted(() => {
  if (stopAvisoTimer) stopAvisoTimer(); // Limpiar el temporizador
});
</script>

<template>
  <router-view />
  <div v-if="cajaStore.mostrarModalAviso" class="modal-overlay">
    <div class="modal-content">
      <h3>Aviso de Cierre de Caja</h3>
      <p>La caja se cerrará automáticamente pronto. Por favor, confirma el cuadre ahora.</p>
      <div class="modal-buttons">
        <button @click="cajaStore.mostrarModalAviso = false">Entendido</button>
      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

:root {
  --color-azul-1: #0188db;
  --color-amarillo-2: #f4b908;
  --color-naranja-3: #f48608;
  --color-morado-4: #b5106b;
  --color-rojo-5: #b6212b;
  --color-aprobado-1: #67c119;
  --color-blanco: #FFF;
  --color-info-gris: #7d8da1;
  --color-info-luz: #dce1eb;
  --color-oscuro: #363949;
  --color-light: rgba(132, 139, 200, 0.18);
  --color-primary-variant: #2749aa;
  --color-dark-variant: #677483;
  --color-background: #f6f6f9;
  --card-border-radius: 2rem;
  --border-radius-1: 0.4rem;
  --border-radius-2: 0.8rem;
  --border-radius-3: 1.2rem;

  --card-padding: 1rem;
  --padding-1: 1.2rem;
  --box-shadow: 0 2rem 3rem var(--color-light);
}

* {
  margin: 0;
  padding: 0;
  outline: 0;
  appearance: none;
  border: 0;
  text-decoration: none;
  list-style: none;
  box-sizing: border-box;
}


html {
  font-size: 14px;
}

body {
  font-family: 'poppins', sans-serif;
  width: 100vw;
  height: 100vh;
  font-size: 0.88rem;
  background: var(--color-background);
  user-select: none;
  overflow-x: hidden;

}

body.dark-theme-variables {
  --color-background: #181a1e;
  --color-blanco: #202528;
  --color-oscuro: #edeffd;
  --color-dark-variant: #a3bdcc;
  --color-light: rgba(0, 0, 0, 0.4);
  --box-shadow: 0 2rem 3rem var(--color-light);
}

body,
html,
div,
header,
main,
aside,
section,
button,
input {
  transition: background-color 300ms ease, color 300ms ease, border-color 300ms ease;
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
  text-align: center;
  box-shadow: var(--box-shadow);
}

.modal-content h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-oscuro);
  margin-bottom: 1rem;
}

.modal-content p {
  margin-bottom: 1rem;
  font-size: 1rem;
  color: var(--color-dark-variant);
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.modal-content button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  width: 150px;
  background: var(--color-aprobado-1);
  color: var(--color-blanco);
  transition: background-color 300ms ease;
}

.modal-content button:hover {
  background: var(--color-azul-1);
}

/* =================== Media Queries  =================== */
/*1200px*/
</style>

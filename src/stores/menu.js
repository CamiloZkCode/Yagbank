import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMenuStore = defineStore('menu', () => {
  const abierto = ref(false)

  function abrir() {
    abierto.value = true
  }

  function cerrar() {
    abierto.value = false
  }

  function toggle() {
    abierto.value = !abierto.value
  }

  return { abierto, abrir, cerrar, toggle }
})






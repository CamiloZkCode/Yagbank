import { defineStore } from 'pinia'
import API from '@/services/axios'
import router from '@/router/index'
import alertify from 'alertifyjs'
import 'alertifyjs/build/css/alertify.css'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: localStorage.getItem('token') !== null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    requiereDatos: JSON.parse(localStorage.getItem('requiereDatos')) || false // Nuevo estado
  }),
  actions: {
    async login(username, password) {
      try {
        const response = await API.post('/auth/login', {
          username,
          contraseña: password
        })

        const { token, user, requiereDatos } = response.data

        this.isAuthenticated = true
        this.user = user
        this.token = token
        this.requiereDatos = requiereDatos || false
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('requiereDatos', JSON.stringify(requiereDatos || false))

        if (user.debe_cambiar_contrasena) {
          alertify.alert(
            'Cambio de contraseña requerido',
            'Por favor, cambia tu contraseña antes de continuar.',
            () => {
              router.push('/cambiar-contrasena');
            }
          );
        } else {
          router.push('/inicio');
        }

        return true
      } catch (error) {
        console.error('Error en login:', error.response?.data || error.message)
        throw error
      }
    },
    
    setDatosCompletados() {
      this.requiereDatos = false
      localStorage.setItem('requiereDatos', JSON.stringify(false))
    },
    
    logout() {
      this.isAuthenticated = false
      this.user = null
      this.token = null
      this.requiereDatos = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('requiereDatos')
    }
  },
  getters: {
    isAdmin: (state) => state.user?.rol?.toLowerCase() === 'administrador',
    isSupervisor: (state) => state.user?.rol?.toLowerCase() === 'supervisor',
    isAsesor: (state) => state.user?.rol?.toLowerCase() === 'asesor',
  }
})
import axios from 'axios'

// Crea una instancia de Axios con la URL base de backend
const API = axios.create({
  baseURL: 'http://localhost:3000/api',
})

// Agregar token automáticamente a cada request si existe
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default API
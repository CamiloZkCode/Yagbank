import API from '@/services/axios'


//Función : Crear prestamos , accede a ruta en el backend
export async function crearPrestamos(prestamos) {
  try {
    const res = await API.post('/prestamos/registrarPrestamos', prestamos)
    return res.data
  } catch (err) {
    throw err.response?.data || err
  } 
}
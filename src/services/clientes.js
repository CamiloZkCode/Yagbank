import API from '@/services/axios'



//Función : Crear cliente , accede a ruta en el backend
export async function crearClientes(clients) {
  try {
    const res = await API.post('/clientes/registrarClientes', clients)
    return res.data
  } catch (err) {
    throw err.response?.data || err
  } 
}
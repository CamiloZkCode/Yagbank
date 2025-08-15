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

export async function listarClientesConPrestamos(id_admin) {
  try {
    console.log("Enviando petición a /clientes/listarClientesConPrestamos/"+id_admin)
    const res = await API.get(`/clientes/listarClientesConPrestamos/${id_admin}`)
    console.log("Respuesta recibida:", res.data)
    return res.data.clientes || []
  } catch (err) {
    console.error("Error en listarClientesConPrestamos:", err)
    throw err.response?.data || err
  }
}
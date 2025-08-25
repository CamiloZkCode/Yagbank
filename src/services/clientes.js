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

export async function listarClientesConPrestamosSupervisor(id_supervisor) {
  try {
    console.log("Enviando petición a /clientes/listarClientesConPrestamos/"+id_supervisor)
    const res = await API.get(`/clientes/listarClientesConPrestamosSupervisor/${id_supervisor}`)
    console.log("Respuesta recibida:", res.data)
    return res.data.clientes || []
  } catch (err) {
    console.error("Error en listarClientesConPrestamos:", err)
    throw err.response?.data || err
  }
}
export async function listarClientesConPrestamosAsesor(id_asesor) {
  try {
    console.log("Enviando petición a /clientes/listarClientesConPrestamos/"+id_asesor)
    const res = await API.get(`/clientes/listarClientesConPrestamosAsesor/${id_asesor}`)
    console.log("Respuesta recibida:", res.data)
    return res.data.clientes || []
  } catch (err) {
    console.error("Error en listarClientesConPrestamos:", err)
    throw err.response?.data || err
  }
}


// Editar un cliente
export async function editarCliente(documento_cliente, clienteEditado) {
  try {
    console.log("Enviando petición a /clientes/editarClientes/" + documento_cliente, clienteEditado)

    // Mandamos los datos en el body del PUT
    const res = await API.post(`/clientes/editarClientes/${documento_cliente}`, clienteEditado)

    console.log("Respuesta recibida:", res.data)
    return res.data // aquí devuelves la respuesta del backend
  } catch (err) {
    console.error("Error en editarCliente:", err)
    throw err.response?.data || err
  }
}
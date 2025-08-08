import API from '@/services/axios'

// Función: Registrar usuario ,accede a ruta en el backend
export async function registrarUsuario(usuario) {
  try {
    const res = await API.post('/usuarios/registrousuario', usuario)
    return res.data
  } catch (err) {
    throw err.response?.data || err
  }
}
//Función : Rellenar tabla en vista administradores , accede a ruta en el backend
export async function creartablaUsuarioXAdministrador(data) {
  try {
    const res = await API.post('/usuarios/cargartablausuarioXadmin',data)
    console.log('Respuesta de /usuarios/adminUsuarios:', res.data)
    return res.data
  } catch (err) {
    throw err.response?.data || err
  } 
}
//Función : Rellenar tabla en vista supervisores , accede a ruta en el backend
export async function creartablaUsuarioXSupervisor(data) {
  try {
    const res = await API.post('/usuarios/cargartablausuarioXsupervisor', data)
    return res.data
  } catch (err) {
    throw err.response?.data || err
  } 
}

// Función: Obtener supervisores
export async function obtenerSupervisores() {
  try {
    const res = await API.get('/usuarios/supervisores')
    return res.data
  } catch (err) {
    throw err.response?.data || err
  }
}

export async function cambiarEstado(id) {
  try {
    const res = await API.post(`/usuarios/${id}/estado`)
    alert('Estado cambiado');
    return res.data
  } catch (err) {
    throw err.response?.data || err
  }
}



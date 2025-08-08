import API from '@/services/axios'


export async function crearRutas(rutas) {
  try {
    const res = await API.post('/rutas/crearRuta', rutas)
    return res.data
  } catch (err) {
    throw err.response?.data || err
  } 
}


export async function obtenerAsesores(id_supervisor) {
  try {
    const res = await API.post('/rutas/cargarAsesores', {id_supervisor})
    return res.data
  } catch (err) {
    throw err.response?.data || err
  } 
}


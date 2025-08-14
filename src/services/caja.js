import API from '@/services/axios'

export async function GenerarCaja(data) {
  try {
    const res = await API.post('/cajas/generar', data)
    return res.data
  } catch (err) {
    throw err.response?.data || err
  } 
}

export async function obtenerCajaPorRol(caja) {
  try {
    const res = await API.get('/cajas/por-rol', caja)
    return res.data
  } catch (err) {
    throw err.response?.data || err
  } 
}

export async function cerrarCaja(caja) {
  try {
    const res = await API.post('/cajas/cerrar-caja', caja)
    return res.data
  } catch (err) {
    throw err.response?.data || err
  } 
}


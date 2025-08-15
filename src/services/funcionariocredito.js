import API from "@/services/axios";

// Crear préstamo (funcionario lo solicita)
export async function crearPrestamoFuncionario(data) {
  try {
    const res = await API.post("/funcionario/crear-funcionario", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

// Obtener solicitudes pendientes (para admin)
export async function obtenerSolicitudesPendientes() {
  try {
    const res = await API.get("/funcionario/pendientes");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

// Aceptar préstamo
export async function aceptarPrestamo(id_prestamo) {
  try {
    const res = await API.post(`/funcionario/aprobar/${id_prestamo}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

// Rechazar préstamo
export async function rechazarPrestamo(id_prestamo) {
  try {
    const res = await API.post(`/funcionario/rechazar/${id_prestamo}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

// Obtener préstamos aceptados
export async function obtenerPrestamosAceptados() {
  try {
    const res = await API.get("/funcionario/aprobados");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

// Cambiar estado a liquidado
export async function liquidarPrestamo(id_prestamo) {
  try {
    const res = await API.post(`/funcionario/liquidar/${id_prestamo}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

import API from "@/services/axios";

export async function obtenerCajaPorRol(params) {
  try {
    const res = await API.get("/caja/obtener", { params });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function cerrarCaja() {
  try {
    const res = await API.post("/caja/cerrar");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function GenerarCaja(data) {
  try {
    const res = await API.post("/caja/generar", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export const verificarCajasDependientes = async (fecha) => {
  try {
    const response = await API.get("/caja/verificar", {
      params: { fecha }, // Solo pasamos fecha, usuario y rol vienen del token
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

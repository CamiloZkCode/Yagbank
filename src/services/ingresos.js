import API from "@/services/axios";

export async function crearIngresoCaja(data) {
  try {
    const res = await API.post("/ingresos/crear-ingreso", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}
import API from "@/services/axios";

export async function crearIngresoCaja(data) {
  try {
    const res = await API.post("/ingresos/crear-ingreso", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function obtenerIngresos() {
  try{
    const res = await API.get("/ingresos/ver-ingreso");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
  
}
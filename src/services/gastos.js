import API from "@/services/axios";

export async function crearGastosCaja(data) {
  try {
    const res = await API.post("/gastos/crear-gastos", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function obtenerGastos() {
  try {
    const res = await API.get("/gastos/usuarios-gastos");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function mostrarTodosGastos() {
  try {
    const res = await API.get("/gastos/todos-gastos");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

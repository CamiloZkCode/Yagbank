// src/services/pago.js
import API from "@/services/axios";

export async function realizarPago(data) {
  try {
    const res = await API.post("/pagos/realizar", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function obtenerDatosPagos() {
  try {
    const res = await API.get("/pagos/datos");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function obtenerCuotasPrestamo(id) {
  try {
    const res = await API.get(`/pagos/cuotas/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function marcarClavo(data) {
  try {
    const res = await API.post("/pagos/clavo", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function marcarNota(data) {
  try {
    const res = await API.post("/pagos/nota", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function guardarOrdenPrestamos(orden) {
  try {
    // orden es un array: [{id_prestamo: 1, orden: 1}, {id_prestamo: 2, orden: 2}]
    const res = await API.post("/pagos/orden", { orden });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

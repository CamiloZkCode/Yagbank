const {
  crearGasto,
  mostrarGasto,
  mostrarGastosParaAdmin,
} = require("../models/gastos.models");
const { obtenerCajaPorUsuarioYFecha } = require("../models/caja.models");
const { fechaHoy } = require("../utils/fechas.js");



async function crearGastoCaja(req, res) {
  try {
    const { nombre, descripcion, valor } = req.body;
    const id_usuario = req.user?.id_usuario;

    // Validar datos
    if (!id_usuario) {
      return res.status(401).json({
        error: "NO_AUTORIZADO",
        message: "Usuario no autenticado",
      });
    }

    if (!nombre || !descripcion || !valor) {
      return res.status(400).json({
        error: "DATOS_INCOMPLETOS",
        message: "Todos los campos son requeridos",
      });
    }

    if (typeof valor !== "number" || isNaN(valor) || Number(valor) <= 0) {
      return res.status(400).json({
        error: "MONTO_INVALIDO",
        message: "El valor debe ser un número positivo",
      });
    }

    // Obtener caja activa del usuario para hoy
    const hoy = fechaHoy();
    
    const caja = await obtenerCajaPorUsuarioYFecha(id_usuario, hoy);

    if (!caja) {
      return res.status(400).json({
        error: "CAJA_NO_DISPONIBLE",
        message: "No hay caja activa para el usuario hoy",
      });
    }

    // Preparar datos del gasto
    const datosGasto = {
      id_caja: caja.id_caja,
      usuario_id: id_usuario,
      nombre,
      descripcion,
      valor: Number(valor),
      fecha: hoy,
    };

    const idGasto = await crearGasto(datosGasto);

    return res.status(201).json({
      success: true,
      message: "Gasto creado exitosamente",
      data: { id_gasto: idGasto, ...datosGasto, url_foto: "" },
    });
  } catch (error) {
    console.error("Error en crearGastoCaja:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message || "Error interno del servidor",
    });
  }
}

async function obtenerGastos(req, res) {
  try {
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario) {
      return res.status(401).json({
        error: "NO_AUTORIZADO",
        message: "Usuario no autenticado",
      });
    }

    const gastos = await mostrarGasto(id_usuario);
    return res.status(200).json({
      success: true,
      data: gastos,
    });
  } catch (error) {
    console.error("Error en obtenerGastos:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message || "Error interno del servidor",
    });
  }
}

async function TodosGastos(req, res) {
  try {
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario) {
      return res.status(401).json({
        error: "NO_AUTORIZADO",
        message: "Usuario no autenticado",
      });
    }

    const gastos = await mostrarGastosParaAdmin(id_usuario);
    return res.status(200).json({
      success: true,
      data: gastos,
    });
  } catch (error) {
    console.error("Error en TodosGastos:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message || "Error interno del servidor",
    });
  }
}

module.exports = {
  crearGastoCaja,
  obtenerGastos,
  TodosGastos,
};

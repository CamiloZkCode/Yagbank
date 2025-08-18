const { crearIngreso, mostrarIngreso } = require("../models/ingresos.models");
const { obtenerCajaPorUsuarioYFecha } = require("../models/caja.models");

async function crearIngresoCaja(req, res) {
  try {
    const { id_usuario_destino, tipo, descripcion, valor } = req.body;

    // Validaciones mejoradas
    if (!id_usuario_destino || !tipo || !descripcion || !valor) {
      return res.status(400).json({
        error: "DATOS_INCOMPLETOS",
        message: "Todos los campos son requeridos",
      });
    }

    if (typeof valor !== "number" || valor <= 0) {
      return res.status(400).json({
        error: "MONTO_INVALIDO",
        message: "El valor debe ser un número positivo",
      });
    }

    // Formato de fecha corregido
    const hoy = new Date().toISOString().split("T")[0];

    // Verificación de caja
    const caja = await obtenerCajaPorUsuarioYFecha(id_usuario_destino, hoy);

    if (!caja) {
      return res.status(400).json({
        error: "CAJA_NO_DISPONIBLE",
        message: "No hay caja activa para el usuario hoy",
      });
    }

    // Datos corregidos para coincidir con la estructura de la tabla
    const datosIngreso = {
      id_caja: caja.id_caja,
      usuario_id: id_usuario_destino, // Cambiado a usuario_id
      tipo,
      descripcion,
      valor,
      fecha: hoy,
    };

    const idIngreso = await crearIngreso(datosIngreso);

    return res.status(201).json({
      success: true,
      message: "Ingreso creado exitosamente",
      data: { id_ingreso: idIngreso, ...datosIngreso },
    });
  } catch (error) {
    console.error("Error en crearIngreso:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message || "Error interno del servidor", // Mostrar el mensaje real del error
    });
  }
}

async function obtenerIngresos(req, res) {
  try {
    const ingresos = await mostrarIngreso();
    return res.status(200).json({
      success: true,
      data: ingresos,
    });
  } catch (error) {
    console.error("Error en obtenerIngresos:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message || "Error interno del servidor",
    });
  }
}

module.exports = {
  crearIngresoCaja,
  obtenerIngresos
};

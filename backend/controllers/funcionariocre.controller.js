const db = require("../config/db");

const {
  crearPrestamo,
  obtenerPrestamosPorFuncionario,
  obtenerPrestamosPorAdministrador,
  actualizarEstadoPrestamo,
  obtenerPrestamoPorId,
  crearPagoFuncionario,
  actualizarPrestamoFuncionario,
} = require("../models/funcionariocre.models");
const { obtenerCajaPorUsuarioYFecha } = require("../models/caja.models");
const { actualizarCajaCobrado } = require("../models/pagos.models");
const { fechaHoy } = require("../utils/fechas.js");

async function crearPrestamoFuncionario(req, res) {
  try {
    const { monto } = req.body;
    const { id_usuario } = req.user;

    if (!monto || typeof monto !== "number" || monto <= 0) {
      return res.status(400).json({
        error: "MONTO_INVALIDO",
        message: "El monto debe ser un número positivo",
      });
    }

    const hoy = fechaHoy();
    const caja = await obtenerCajaPorUsuarioYFecha(id_usuario, hoy);
    if (!caja) {
      return res.status(400).json({
        error: "CAJA_NO_DISPONIBLE",
        message: "No hay caja activa para el usuario hoy",
      });
    }

    const datosPrestamo = {
      id_caja: caja.id_caja,
      id_funcionario: id_usuario,
      autorizado_por: null,
      fecha: hoy,
      monto,
      abono: 0,
      saldo: monto,
      estado: "Pendiente",
    };

    const idPrestamo = await crearPrestamo(datosPrestamo);
    return res.status(201).json({
      success: true,
      message: "Préstamo creado exitosamente",
      data: { id_prestamo: idPrestamo, ...datosPrestamo },
    });
  } catch (error) {
    console.error("Error en crearPrestamoFuncionario:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error interno del servidor",
    });
  }
}

async function obtenerSolicitudesPendientes(req, res) {
  try {
    const prestamos = await obtenerPrestamosPorAdministrador(
      req.user.id_usuario,
      "Pendiente"
    );
    return res.status(200).json({ success: true, data: prestamos });
  } catch (error) {
    console.error("Error en obtenerSolicitudesPendientes:", error);
    return res
      .status(500)
      .json({ error: "SERVER_ERROR", message: error.message });
  }
}

async function obtenerPrestamosAceptados(req, res) {
  try {
    let prestamos;
    if (req.user.id_rol === 1) {
      prestamos = await obtenerPrestamosPorAdministrador(req.user.id_usuario);
    } else {
      prestamos = await obtenerPrestamosPorFuncionario(req.user.id_usuario);
    }
    return res.status(200).json({ success: true, data: prestamos });
  } catch (error) {
    console.error("Error en obtenerPrestamosAceptados:", error);
    return res
      .status(500)
      .json({ error: "SERVER_ERROR", message: error.message });
  }
}

async function aceptarPrestamo(req, res) {
  try {
    await actualizarEstadoPrestamo(
      req.params.id_prestamo,
      "Aprobado",
      req.user.id_usuario
    );
    return res
      .status(200)
      .json({ success: true, message: "Préstamo aprobado exitosamente" });
  } catch (error) {
    console.error("Error en aceptarPrestamo:", error);
    return res
      .status(500)
      .json({ error: "SERVER_ERROR", message: "Error interno del servidor" });
  }
}

async function rechazarPrestamo(req, res) {
  try {
    await actualizarEstadoPrestamo(
      req.params.id_prestamo,
      "Rechazado",
      req.user.id_usuario
    );
    return res
      .status(200)
      .json({ success: true, message: "Préstamo rechazado exitosamente" });
  } catch (error) {
    console.error("Error en rechazarPrestamo:", error);
    return res
      .status(500)
      .json({ error: "SERVER_ERROR", message: "Error interno del servidor" });
  }
}

async function realizarPagoFuncionario(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { id_prestamo, tipo, monto } = req.body;
    const user = req.user;

    if (user.id_rol !== 1) {
      return res.status(403).json({
        error: "ACCESO_DENEGADO",
        message: "Solo administradores pueden realizar pagos",
      });
    }

    const prestamo = await obtenerPrestamoPorId(conn, id_prestamo);
    if (!prestamo || prestamo.estado !== "Aprobado") {
      return res.status(400).json({
        error: "PRESTAMO_INVALIDO",
        message: "Préstamo no encontrado o no aprobado",
      });
    }

    const hoy = fechaHoy();
    const caja = await obtenerCajaPorUsuarioYFecha(
      prestamo.id_funcionario,
      hoy
    );
    if (!caja) {
      return res.status(400).json({
        error: "CAJA_NO_DISPONIBLE",
        message:
          "No hay caja abierta hoy para el funcionario que solicitó el préstamo",
      });
    }

    let pagoMonto = tipo === "abono" ? monto : prestamo.saldo;
    if (pagoMonto <= 0 || pagoMonto > prestamo.saldo) {
      return res.status(400).json({
        error: "MONTO_INVALIDO",
        message: "Monto inválido para el pago",
      });
    }

    // Crear el registro de pago
    await crearPagoFuncionario(conn, {
      id_caja: caja.id_caja,
      id_prestamo,
      valor: pagoMonto,
      recibido_por: user.id_usuario,
    });

    // Actualizar préstamo
    await actualizarPrestamoFuncionario(conn, id_prestamo, pagoMonto);

    // Actualizar caja
    await actualizarCajaCobrado(conn, caja.id_caja, pagoMonto);

    // Verificar liquidación
    const updatedPrestamo = await obtenerPrestamoPorId(conn, id_prestamo);
    if (updatedPrestamo.saldo <= 0) {
      await actualizarEstadoPrestamo(
        conn,
        id_prestamo,
        "Liquidado",
        user.id_usuario
      );
    }

    await conn.commit();
    return res
      .status(200)
      .json({ success: true, message: "Pago realizado exitosamente" });
  } catch (error) {
    await conn.rollback();
    console.error("Error en realizarPagoFuncionario:", error);
    return res
      .status(500)
      .json({ error: "SERVER_ERROR", message: error.message });
  } finally {
    conn.release();
  }
}

module.exports = {
  crearPrestamoFuncionario,
  obtenerSolicitudesPendientes,
  aceptarPrestamo,
  rechazarPrestamo,
  obtenerPrestamosAceptados,
  realizarPagoFuncionario,
};

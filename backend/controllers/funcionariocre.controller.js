const {
  crearPrestamo,
  obtenerPrestamosPorFuncionario,
  obtenerPrestamosPorAdministrador,
  actualizarEstadoPrestamo,
} = require("../models/funcionariocre.models");
const { obtenerCajaPorUsuarioYFecha } = require("../models/caja.models");

async function crearPrestamoFuncionario(req, res) {
  try {
    const { monto } = req.body;
    const { id_usuario } = req.user; // Obtenido del middleware de autenticación

    // Validar monto
    if (!monto || typeof monto !== "number" || monto <= 0) {
      return res.status(400).json({
        error: "MONTO_INVALIDO",
        message: "El monto debe ser un número positivo",
      });
    }

    // Obtener caja activa del usuario para hoy
    const hoy = new Date().toISOString().split("T")[0];
    const caja = await obtenerCajaPorUsuarioYFecha(id_usuario, hoy);
    if (!caja) {
      return res.status(400).json({
        error: "CAJA_NO_DISPONIBLE",
        message: "No hay caja activa para el usuario hoy",
      });
    }

    // Preparar datos del préstamo
    const datosPrestamo = {
      id_caja: caja.id_caja,
      id_funcionario: id_usuario,
      autorizado_por: null, // Se establece como NULL al crear
      fecha: hoy,
      monto,
      abono: 0,
      saldo: monto, // Saldo inicial igual al monto
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

    return res.status(200).json({
      success: true,
      data: prestamos,
    });
  } catch (error) {
    console.error("Error en obtenerSolicitudesPendientes:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message,
    });
  }
}

async function obtenerPrestamosAceptados(req, res) {
  try {
    let prestamos;
    if (req.user.id_rol === 1) { // Administrador
      prestamos = await obtenerPrestamosPorAdministrador(
        req.user.id_usuario,
        "Aprobado"
      );
    } else { // Supervisor o Asesor
      prestamos = await obtenerPrestamosPorFuncionario(
        req.user.id_usuario,
        "Aprobado"
      );
    }

    return res.status(200).json({
      success: true,
      data: prestamos,
    });
  } catch (error) {
    console.error("Error en obtenerPrestamosAceptados:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message,
    });
  }
}

async function aceptarPrestamo(req, res) {
  try {
    // Validación de rol ya hecha por el middleware
    await actualizarEstadoPrestamo(
      req.params.id_prestamo,
      "Aprobado",
      req.user.id_usuario
    );

    return res.status(200).json({
      success: true,
      message: "Préstamo aprobado exitosamente",
    });
  } catch (error) {
    console.error("Error en aceptarPrestamo:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error interno del servidor",
    });
  }
}

async function rechazarPrestamo(req, res) {
  try {
    // Validación de rol ya hecha por el middleware
    await actualizarEstadoPrestamo(
      req.params.id_prestamo,
      "Rechazado",
      req.user.id_usuario
    );

    return res.status(200).json({
      success: true,
      message: "Préstamo rechazado exitosamente",
    });
  } catch (error) {
    console.error("Error en rechazarPrestamo:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error interno del servidor",
    });
  }
}

async function obtenerPrestamosAceptados(req, res) {
  try {
    let prestamos;
    if (req.user.id_rol === 1) {
      // Mantenemos esta lógica diferente
      prestamos = await obtenerPrestamosPorAdministrador(
        req.user.id_usuario,
        "Aprobado"
      );
    } else {
      prestamos = await obtenerPrestamosPorFuncionario(
        req.user.id_usuario,
        "Aprobado"
      );
    }

    return res.status(200).json({
      success: true,
      data: prestamos,
    });
  } catch (error) {
    console.error("Error en obtenerPrestamosAceptados:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error interno del servidor",
    });
  }
}

async function liquidarPrestamo(req, res) {
  try {
    // Validación de rol ya hecha por el middleware
    await actualizarEstadoPrestamo(
      req.params.id_prestamo,
      "Liquidado",
      req.user.id_usuario
    );

    return res.status(200).json({
      success: true,
      message: "Préstamo liquidado exitosamente",
    });
  } catch (error) {
    console.error("Error en liquidarPrestamo:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error interno del servidor",
    });
  }
}

module.exports = {
  crearPrestamoFuncionario,
  obtenerSolicitudesPendientes,
  aceptarPrestamo,
  rechazarPrestamo,
  obtenerPrestamosAceptados,
  liquidarPrestamo,
};

const db = require("../config/db");
const { crearPrestamo } = require("../models/prestamos.models");
const { obtenerCajaPorUsuarioYFecha } = require("../models/caja.models");

async function registrarPrestamos(req, res) {
  const conn = await db.getConnection();
  try {
    const nuevoPrestamo = req.body;

    // ==================== VALIDACIONES INICIALES ====================
    // 1. Validar campos obligatorios mínimos
    if (
      !nuevoPrestamo.documento_cliente ||
      !nuevoPrestamo.valor_prestamo ||
      !nuevoPrestamo.forma_pago ||
      !nuevoPrestamo.numero_cuotas ||
      !nuevoPrestamo.creado_por
    ) {
      return res
        .status(400)
        .json({
          message:
            "Faltan campos obligatorios: documento_cliente, valor_prestamo, forma_pago, numero_cuotas, creado_por",
        });
    }

    // ==================== FUNCIONES DE CÁLCULO ====================
    // Calcular interés, total y valor_diario
    function calcularValoresPrestamo(valorPrestamo, numeroCuotas) {
      if (typeof valorPrestamo !== "number" || valorPrestamo <= 0) {
        throw new Error("El valor del préstamo debe ser un número positivo");
      }
      if (
        typeof numeroCuotas !== "number" ||
        numeroCuotas <= 0 ||
        !Number.isInteger(numeroCuotas)
      ) {
        throw new Error("El número de cuotas debe ser un entero positivo");
      }

      const interes = Number((valorPrestamo * 0.2).toFixed(2));
      const total = Number((valorPrestamo + interes).toFixed(2));
      const valorDiario = Number((total / numeroCuotas).toFixed(2));

      return { interes, total, valorDiario };
    }

    // Calcular fecha de finalización (lunes a sábado, excluyendo domingos)
    function calcularFechaFinalizacion(fechaInicio, numeroCuotas) {
      if (!(fechaInicio instanceof Date)) {
        throw new Error("La fecha de inicio debe ser un objeto Date válido");
      }
      if (
        typeof numeroCuotas !== "number" ||
        numeroCuotas <= 0 ||
        !Number.isInteger(numeroCuotas)
      ) {
        throw new Error("El número de cuotas debe ser un entero positivo");
      }

      let fechaActual = new Date(fechaInicio);
      fechaActual.setDate(fechaActual.getDate() + 1); // Inicia un día después
      let diasAgregados = 0;

      while (diasAgregados < numeroCuotas) {
        fechaActual.setDate(fechaActual.getDate());
        const diaSemana = fechaActual.getDay();
        if (diaSemana !== 0) {
          // Excluye solo domingos (0)
          diasAgregados++;
        }
      }

      return fechaActual.toISOString().split("T")[0];
    }

    // Calcular valores del préstamo
    const { interes, total, valorDiario } = calcularValoresPrestamo(
      nuevoPrestamo.valor_prestamo,
      nuevoPrestamo.numero_cuotas
    );

    // Calcular fecha_finalizacion
    const hoy = new Date().toISOString().split("T")[0];
    const fechaFinalizacion = calcularFechaFinalizacion(
      new Date(hoy),
      nuevoPrestamo.numero_cuotas
    );

    // ==================== LÓGICA PRINCIPAL ====================
    await conn.beginTransaction();

    // 2. Obtener el asesor asignado al cliente
    const [cliente] = await conn.query(
      `SELECT id_asesor 
       FROM clientes 
       WHERE documento_cliente = ? AND estado = TRUE
       LIMIT 1`,
      [nuevoPrestamo.documento_cliente]
    );

    if (!cliente || !cliente[0]) {
      await conn.rollback();
      return res.status(404).json({
        error: "CLIENTE_NO_ENCONTRADO",
        message: "Cliente no existe o está inactivo",
      });
    }

    const idAsesor = cliente[0].id_asesor;

    // 3. Verificar que el asesor existe y está activo
    const [asesor] = await conn.query(
      `SELECT id_usuario FROM usuarios 
       WHERE id_usuario = ? AND id_rol = '3' AND estado = TRUE
       LIMIT 1`,
      [idAsesor]
    );

    if (!asesor[0]) {
      await conn.rollback();
      return res.status(400).json({
        error: "ASESOR_INVALIDO",
        message: "El asesor asignado no existe o no está activo",
      });
    }

    // 4. Obtener la caja del asesor para HOY
    const cajaAsesor = await obtenerCajaPorUsuarioYFecha(idAsesor, hoy);

    if (!cajaAsesor) {
      await conn.rollback();
      return res.status(400).json({
        error: "CAJA_NO_DISPONIBLE",
        message: "El asesor no tiene caja abierta hoy",
      });
    }

    // 5. Validar préstamo único por cliente/día
    const [prestamoExistente] = await conn.query(
      `SELECT id_prestamo FROM prestamos_clientes 
       WHERE documento_cliente = ? AND fecha_inicio = ?
       LIMIT 1`,
      [nuevoPrestamo.documento_cliente, hoy]
    );

    if (prestamoExistente[0]) {
      await conn.rollback();
      return res.status(400).json({
        error: "PRESTAMO_DUPLICADO",
        message: "Ya existe un préstamo para este cliente hoy",
      });
    }

    // ==================== CREAR PRÉSTAMO ====================
    const datosPrestamo = {
      ...nuevoPrestamo,
      id_caja: cajaAsesor.id_caja,
      creado_por: nuevoPrestamo.creado_por, // Ajustado, asumiendo que creado_por viene del body
      fecha_inicio: hoy,
      interes,
      total,
      valor_diario: valorDiario,
      fecha_finalizacion: fechaFinalizacion,
    };

    const idPrestamo = await crearPrestamo(datosPrestamo);
    await conn.commit();

    // ==================== RESPUESTA EXITOSA ====================
    return res.status(201).json({
      success: true,
      id_prestamo: idPrestamo,
      caja: {
        id: cajaAsesor.id_caja,
        asesor: idAsesor,
        fecha: hoy,
      },
      warnings:
        nuevoPrestamo.creado_por !== idAsesor
          ? `Préstamo vinculado a la caja del asesor (ID: ${idAsesor})`
          : undefined,
      calculos: {
        interes,
        total,
        valor_diario: valorDiario,
        fecha_finalizacion: fechaFinalizacion,
      },
    });
  } catch (error) {
    await conn.rollback();
    console.error("Error en registrarPrestamos:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error interno del servidor",
    });
  } finally {
    conn.release();
  }
}

module.exports = { registrarPrestamos };

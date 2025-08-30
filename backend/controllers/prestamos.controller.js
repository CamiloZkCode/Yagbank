const db = require("../config/db");
const { crearPrestamo, crearCuotas } = require("../models/prestamos.models");
const { obtenerCajaPorUsuarioYFecha } = require("../models/caja.models");
const { fechaHoy } = require("../utils/fechas.js");
const moment = require("moment-timezone");

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
      return res.status(400).json({
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

      const interes = Number((valorPrestamo * 0.2).toFixed(2)); // 20%
      const total = Number((valorPrestamo + interes).toFixed(2));
      const valorCuota = Number((total / numeroCuotas).toFixed(2));

      return { interes, total, valorCuota };
    }

    // Calcular fecha de finalización según forma de pago
    function calcularFechaFinalizacion(
      fechaInicioStr,
      numeroCuotas,
      formaPago
    ) {
      if (!fechaInicioStr || typeof fechaInicioStr !== "string") {
        throw new Error("La fecha de inicio debe ser un string YYYY-MM-DD");
      }

      let fecha = moment.tz(fechaInicioStr, "YYYY-MM-DD", "America/Bogota");
      if (!fecha.isValid()) {
        throw new Error("fechaInicio no es válida");
      }

      switch (formaPago) {
        case "Diario": {
          let cobradas = 0;
          while (cobradas < numeroCuotas) {
            fecha = fecha.add(1, "day");
            if (fecha.day() !== 0) {
              // 0 = domingo
              cobradas++;
            }
          }
          break;
        }

        case "Semanal": {
          for (let i = 0; i < numeroCuotas; i++) {
            fecha = fecha.add(7, "day");
            if (fecha.day() === 0) {
              fecha = fecha.add(1, "day"); // mover al lunes
            }
          }
          break;
        }

        case "Quincenal": {
          for (let i = 0; i < numeroCuotas; i++) {
            fecha = fecha.add(15, "day");
            if (fecha.day() === 0) {
              fecha = fecha.add(1, "day");
            }
          }
          break;
        }

        case "Mensual": {
          for (let i = 0; i < numeroCuotas; i++) {
            fecha = fecha.add(1, "month");
            if (fecha.day() === 0) {
              fecha = fecha.add(1, "day");
            }
          }
          break;
        }

        default:
          throw new Error(`Forma de pago no soportada: ${formaPago}`);
      }

      // Seguridad: nunca devolver domingo
      if (fecha.day() === 0) {
        fecha = fecha.add(1, "day");
      }

      return fecha.format("YYYY-MM-DD");
    }

    // Calcular valores del préstamo
    const { interes, total, valorCuota } = calcularValoresPrestamo(
      nuevoPrestamo.valor_prestamo,
      nuevoPrestamo.numero_cuotas
    );

    const hoy = fechaHoy(); // fecha de creación con zona horaria Bogotá

    const fechaFinalizacion = calcularFechaFinalizacion(
      hoy,
      nuevoPrestamo.numero_cuotas,
      nuevoPrestamo.forma_pago
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

    //Validar Estado del Prestamo
    const [prestamoActivo] = await conn.query(
      `SELECT id_prestamo 
    FROM prestamos_clientes 
    WHERE documento_cliente = ? AND estado = 'Activo'
    LIMIT 1`,
      [nuevoPrestamo.documento_cliente]
    );

    if (prestamoActivo[0]) {
      await conn.rollback();
      return res.status(400).json({
        error: "PRESTAMO_ACTIVO",
        message:
          "El cliente ya tiene un préstamo activo y no puede solicitar otro hasta liquidarlo o cancelarlo",
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
      valor_diario: valorCuota,
      fecha_finalizacion: fechaFinalizacion,
    };

    const idPrestamo = await crearPrestamo(datosPrestamo);
    const numeroCuotas = Number(nuevoPrestamo.numero_cuotas);


    // ===== Crear cuotas automáticamente =====
    await crearCuotas(
      idPrestamo,
      numeroCuotas,
      hoy,
      valorCuota,
      nuevoPrestamo.forma_pago,
      cajaAsesor.id_caja
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      id_prestamo: idPrestamo,
      caja: { id: cajaAsesor.id_caja, asesor: idAsesor, fecha: hoy },
      calculos: {
        interes,
        total,
        valor_diario: valorCuota,
        fecha_finalizacion: fechaFinalizacion,
      },
    });
  } catch (error) {
    await conn.rollback();
    console.error("Error en registrarPrestamos:", error);
    return res
      .status(500)
      .json({ error: "SERVER_ERROR", message: error.message });
  } finally {
    conn.release();
  }
}

module.exports = { registrarPrestamos };


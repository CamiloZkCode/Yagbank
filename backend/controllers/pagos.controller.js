const db = require("../config/db");
const {
  pagarCuotaIndividual,
  pagarTodasCuotas,
  actualizarCajaCobrado,
  verificarLiquidacion,
  getPrestamosActivos,
  getCuotasPrestamo,
  updateCuotaStates,
  guardarOrdenPrestamos,
} = require("../models/pagos.models");
const { obtenerCajaPorUsuarioYFecha } = require("../models/caja.models");
const { fechaHoy } = require("../utils/fechas.js");

async function realizarPago(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { id_prestamo, tipo, monto } = req.body;
    const today = fechaHoy();

    // Actualizar estados de cuotas morosas antes de procesar el pago
    await updateCuotaStates(today);

    // Verificar préstamo activo
    const [prestamoRows] = await conn.query(
      `
      SELECT * FROM prestamos_clientes WHERE id_prestamo = ? AND estado = 'Activo'
    `,
      [id_prestamo]
    );
    if (prestamoRows.length === 0) {
      throw new Error("Préstamo no encontrado o no activo");
    }
    const prestamo = prestamoRows[0];

    // Obtener el asesor del cliente
    const [clienteRows] = await conn.query(
      `
      SELECT id_asesor FROM clientes WHERE documento_cliente = ?
    `,
      [prestamo.documento_cliente]
    );
    const idAsesor = clienteRows[0].id_asesor;

    // Verificar caja del asesor
    const caja = await obtenerCajaPorUsuarioYFecha(idAsesor, today);
    if (!caja) {
      throw new Error("No hay caja abierta para el asesor hoy");
    }

    let totalAmount = 0;

    if (tipo === "cuota") {
      // PASO 1: Priorizar cuota del día actual (fecha_pago == today y estado != 'pagada')
      let [cuotaRows] = await conn.query(
        `
        SELECT id_cuota, monto AS monto_original
        FROM cuotas 
        WHERE id_prestamo = ? AND estado != 'pagada' AND fecha_pago = ?
        LIMIT 1
      `,
        [id_prestamo, today]
      );

      // PASO 2: Si no hay para today, buscar la primera cuota pendiente futura (fecha_pago > today, ORDER BY fecha_pago ASC)
      if (cuotaRows.length === 0) {
        [cuotaRows] = await conn.query(
          `
          SELECT id_cuota, monto AS monto_original
          FROM cuotas 
          WHERE id_prestamo = ? AND estado != 'pagada' AND fecha_pago > ?
          ORDER BY fecha_pago ASC LIMIT 1
        `,
          [id_prestamo, today]
        );
      }

      // PASO 3: Si no hay actuales ni futuras, caer en la primera morosa (estado = 'no_pagada', ORDER BY numero_cuota ASC para pagar la más antigua primero)
      if (cuotaRows.length === 0) {
        [cuotaRows] = await conn.query(
          `
          SELECT id_cuota, monto AS monto_original
          FROM cuotas 
          WHERE id_prestamo = ? AND estado = 'no_pagada'
          ORDER BY numero_cuota ASC LIMIT 1
        `,
          [id_prestamo]
        );
      }

      if (cuotaRows.length === 0) {
        throw new Error("No hay cuotas pendientes");
      }
      const cuota = cuotaRows[0];
      if (monto <= 0 || monto > prestamo.total) {
        throw new Error("Monto inválido para el pago de la cuota");
      }
      // Opcional: Si quieres limitar el monto al de la cuota seleccionada (evitar abonar más de lo debido en una cuota)
      // if (monto > cuota.monto_original) {
      //   throw new Error("Monto excede la cuota seleccionada");
      // }
      totalAmount = await pagarCuotaIndividual(
        conn,
        cuota.id_cuota,
        caja.id_caja,
        today,
        monto
      );
    } else if (tipo === "todo") {
      totalAmount = await pagarTodasCuotas(
        conn,
        id_prestamo,
        caja.id_caja,
        today,
        monto
      );
    } else {
      throw new Error("Tipo de pago inválido");
    }

    await actualizarCajaCobrado(conn, caja.id_caja, totalAmount);
    await verificarLiquidacion(conn, id_prestamo);

    await conn.commit();
    res.json({ success: true, amount: totalAmount });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
}

async function getDatosPagos(req, res) {
  try {
    console.log("Usuario autenticado:", req.user);
    const userId = req.user.id_usuario;
    const role = req.user.id_rol;
    const today = fechaHoy();
    console.log("Consultando datos de pagos:", { userId, role, today });

    // Actualizar estados de cuotas morosas antes de obtener datos
    await updateCuotaStates(today);

    const clientes = await getPrestamosActivos(userId, role, today);
    console.log("Clientes devueltos:", clientes);

    let queryContadores = `
      SELECT 
        COUNT(DISTINCT pc.id_prestamo) as tarjetas_cobradas,
        SUM(cu.monto) as valor_recaudado
      FROM cuotas cu
      JOIN prestamos_clientes pc ON cu.id_prestamo = pc.id_prestamo
      JOIN clientes cl ON pc.documento_cliente = cl.documento_cliente
      WHERE cu.fecha_pagada = ? AND cu.estado = 'pagada'
    `;
    const paramsCont = [today];
    if (role === 3) {
      queryContadores += ` AND cl.id_asesor = ?`;
      paramsCont.push(userId);
    } else if (role === 2) {
      queryContadores += ` AND cl.id_asesor IN (SELECT id_usuario FROM usuarios WHERE id_administrador = ?)`;
      paramsCont.push(userId);
    }
    console.log("Query contadores:", queryContadores, "Params:", paramsCont);
    const [cont] = await db.query(queryContadores, paramsCont);
    console.log("Contadores:", cont);

    res.json({
      clientes,
      contadores: cont[0] || { tarjetas_cobradas: 0, valor_recaudado: 0 },
    });
  } catch (error) {
    console.error("Error en getDatosPagos:", error);
    res.status(500).json({ error: "Error al obtener datos de pagos" });
  }
}

async function getCuotas(req, res) {
  try {
    const { id } = req.params;
    const today = fechaHoy();

    // Actualizar estados de cuotas morosas antes de obtener cuotas
    await updateCuotaStates(today);

    const cuotas = await getCuotasPrestamo(id);
    res.json(cuotas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener cuotas" });
  }
}

async function marcarClavo(req, res) {
  try {
    const { documento_cliente } = req.body;
    const [existe] = await db.query(
      `SELECT * FROM clientes_clavo WHERE documento_cliente = ?`,
      [documento_cliente]
    );
    if (!existe[0]) {
      await db.query(
        `INSERT INTO clientes_clavo (documento_cliente, cuotas_morosas) VALUES (?, 999)`,
        [documento_cliente]
      );
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

async function marcarNota(req, res) {
  try {
    const { documento_cliente, nota_credito } = req.body;
    await db.query(
      `UPDATE clientes SET nota_credito = ? WHERE documento_cliente = ?`,
      [nota_credito, documento_cliente]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

async function guardarOrden(req, res) {
  try {
    const userId = req.user.id_usuario;
    const { orden } = req.body;

    await guardarOrdenPrestamos(userId, orden);

    res.json({ success: true, message: "Orden guardada correctamente" });
  } catch (error) {
    console.error("Error en guardarOrden:", error);
    res.status(500).json({ error: "Error al guardar orden" });
  }
}

module.exports = {
  realizarPago,
  getDatosPagos,
  getCuotas,
  marcarClavo,
  marcarNota,
  guardarOrden,
};

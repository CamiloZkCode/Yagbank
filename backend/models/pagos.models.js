const db = require("../config/db");
const moment = require("moment-timezone");

// Pagar una cuota individual
async function pagarCuotaIndividual(conn, idCuota, idCaja, fechaPagada, monto) {
  const [cuota] = await conn.query(
    `
    SELECT monto AS monto_original
    FROM cuotas 
    WHERE id_cuota = ? AND pagada = FALSE
  `,
    [idCuota]
  );

  if (!cuota) {
    throw new Error("Cuota no encontrada o ya pagada");
  }

  await conn.query(
    `
    UPDATE cuotas 
    SET pagada = TRUE, fecha_pagada = ?, id_caja = ?, monto = ?
    WHERE id_cuota = ?
  `,
    [fechaPagada, idCaja, monto, idCuota]
  );

  return monto;
}

// Pagar todas las cuotas restantes
async function pagarTodasCuotas(
  conn,
  idPrestamo,
  idCaja,
  fechaPagada,
  montoTotal
) {
  const [cuotas] = await conn.query(
    `
    SELECT id_cuota, monto 
    FROM cuotas 
    WHERE id_prestamo = ? AND pagada = FALSE 
    ORDER BY numero_cuota
  `,
    [idPrestamo]
  );

  if (cuotas.length === 0) {
    throw new Error("No hay cuotas pendientes");
  }

  let remainingAmount = montoTotal;
  let totalAmount = 0;
  for (const cuota of cuotas) {
    if (remainingAmount <= 0) break;
    const montoCuota = Math.min(remainingAmount, cuota.monto);
    totalAmount += await pagarCuotaIndividual(
      conn,
      cuota.id_cuota,
      idCaja,
      fechaPagada,
      montoCuota
    );
    remainingAmount -= montoCuota;
  }

  return totalAmount;
}

// Actualizar total recaudado en caja
async function actualizarCajaCobrado(conn, idCaja, amount) {
  await conn.query(
    `
    UPDATE caja 
    SET total_cobrado = total_cobrado + ? 
    WHERE id_caja = ?
  `,
    [amount, idCaja]
  );
}

// Verificar si el préstamo está liquidado
async function verificarLiquidacion(conn, idPrestamo) {
  // Calcular el saldo restante
  const [result] = await conn.query(
    `
    SELECT 
      pc.total as prestamo_total,
      COALESCE(SUM(cu.monto), 0) as abono_total
    FROM prestamos_clientes pc
    LEFT JOIN cuotas cu ON cu.id_prestamo = pc.id_prestamo AND cu.pagada = TRUE
    WHERE pc.id_prestamo = ?
    GROUP BY pc.id_prestamo, pc.total
  `,
    [idPrestamo]
  );

  if (result.length === 0) {
    throw new Error("Préstamo no encontrado");
  }

  const saldoRestante = result[0].prestamo_total - result[0].abono_total;

  if (saldoRestante <= 0) {
    await conn.query(
      `
      UPDATE prestamos_clientes 
      SET estado = 'Liquidado' 
      WHERE id_prestamo = ?
    `,
      [idPrestamo]
    );
    // Marcar todas las cuotas restantes como pagadas con monto 0
    await conn.query(
      `
      UPDATE cuotas 
      SET pagada = TRUE, monto = 0, fecha_pagada = ?
      WHERE id_prestamo = ? AND pagada = FALSE
    `,
      [moment().tz("America/Bogota").format("YYYY-MM-DD"), idPrestamo]
    );
  }
}

// Obtener datos para la vista de pagos
async function getPrestamosActivos(userId, role, fecha) {
  let query = `
    SELECT 
      pc.id_prestamo,
      cl.documento_cliente as id_cliente,
      CONCAT(cl.nombre, ' ', cl.apellido) as nombre,
      cl.direccion_casa as direccion,
      cl.telefono,
      pc.valor_prestamo as prestamo_principal,
      pc.total as prestamo_total,
      pc.interes,
      pc.numero_cuotas,
      pc.fecha_inicio as fecha_prestamo,
      pc.fecha_finalizacion,
      cl.nota_credito,
      cl.referencia,
      (SELECT COUNT(*) FROM cuotas cu WHERE cu.id_prestamo = pc.id_prestamo AND cu.pagada = TRUE) as cuotas_pagadas,
      (SELECT SUM(cu.monto) FROM cuotas cu WHERE cu.id_prestamo = pc.id_prestamo AND cu.pagada = TRUE) as abono_total,
      (SELECT monto FROM cuotas cu WHERE cu.id_prestamo = pc.id_prestamo AND cu.pagada = TRUE ORDER BY cu.fecha_pagada DESC LIMIT 1) as abono,
      (SELECT COUNT(*) FROM cuotas cu WHERE cu.id_prestamo = pc.id_prestamo AND cu.fecha_pago < ? AND cu.pagada = FALSE) as cuotas_mora
    FROM prestamos_clientes pc
    JOIN clientes cl ON pc.documento_cliente = cl.documento_cliente
    WHERE pc.estado = 'Activo'
  `;
  const params = [fecha];
  if (role === 3) {
    query += ` AND cl.id_asesor = ?`;
    params.push(userId);
  } else if (role === 2) {
    query += ` AND cl.id_asesor IN (SELECT id_usuario FROM usuarios WHERE id_administrador = ?)`;
    params.push(userId);
  }
  console.log("Ejecutando query:", query, "Params:", params);
  const [rows] = await db.query(query, params);
  console.log("Préstamos activos encontrados:", rows);
  return rows.map((row) => ({
    ...row,
    abono_capital: Math.max(0, (row.abono_total || 0) - row.interes),
    saldo_restante: row.prestamo_total - (row.abono_total || 0),
  }));
}

// Obtener cuotas de un préstamo
async function getCuotasPrestamo(idPrestamo) {
  const [rows] = await db.query(
    `
    SELECT numero_cuota, fecha_pago, monto, pagada, fecha_pagada
    FROM cuotas
    WHERE id_prestamo = ?
    ORDER BY numero_cuota
  `,
    [idPrestamo]
  );

  return rows;
}

module.exports = {
  pagarCuotaIndividual,
  pagarTodasCuotas,
  actualizarCajaCobrado,
  verificarLiquidacion,
  getPrestamosActivos,
  getCuotasPrestamo,
};

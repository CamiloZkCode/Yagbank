const db = require("../config/db");

async function crearPrestamo(prestamo) {
  const {
    id_caja,
    id_funcionario,
    autorizado_por,
    fecha,
    monto,
    abono,
    saldo,
    estado,
  } = prestamo;
  const query = `
    INSERT INTO prestamos_funcionarios (
      id_caja, id_funcionario, autorizado_por, fecha, monto, abono, saldo, estado
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    id_caja,
    id_funcionario,
    autorizado_por,
    fecha,
    monto,
    abono || 0,
    saldo,
    estado || "Pendiente",
  ];
  const [result] = await db.query(query, values);
  return result.insertId;
}

async function obtenerPrestamosPorFuncionario(id_funcionario, estado = null) {
  let query = `
    SELECT pf.*, u.nombre AS nombre_funcionario
    FROM prestamos_funcionarios pf
    JOIN usuarios u ON pf.id_funcionario = u.id_usuario
    WHERE pf.id_funcionario = ?
  `;
  const values = [id_funcionario];
  if (estado) {
    query += ` AND pf.estado = ?`;
    values.push(estado);
  } else {
    query += ` AND pf.estado IN ('Aprobado', 'Liquidado')`;
  }
  query += ` ORDER BY CASE WHEN pf.estado = 'Aprobado' THEN 0 ELSE 1 END, fecha DESC`;
  const [prestamos] = await db.query(query, values);
  return prestamos;
}

async function obtenerPrestamosPorAdministrador(
  id_administrador,
  estado = null
) {
  let query = `
    SELECT 
      pf.*, 
      u.nombre AS nombre_funcionario,
      u.id_rol,
      jefe.nombre AS nombre_supervisor,
      autorizo.nombre AS nombre_autorizado
    FROM prestamos_funcionarios pf
    JOIN usuarios u ON pf.id_funcionario = u.id_usuario
    LEFT JOIN usuarios jefe ON u.id_administrador = jefe.id_usuario
    LEFT JOIN usuarios supervisores ON jefe.id_administrador = supervisores.id_usuario
    LEFT JOIN usuarios autorizo ON pf.autorizado_por = autorizo.id_usuario
    WHERE (
      (u.id_rol = 2 AND u.id_administrador = ?)
      OR
      (u.id_rol = 3 AND jefe.id_administrador = ?)
    )
  `;
  const values = [id_administrador, id_administrador];
  if (estado) {
    query += ` AND pf.estado = ?`;
    values.push(estado);
  } else {
    query += ` AND pf.estado IN ('Aprobado', 'Liquidado')`;
  }
  query += ` ORDER BY CASE WHEN pf.estado = 'Aprobado' THEN 0 ELSE 1 END, fecha DESC`;
  const [prestamos] = await db.query(query, values);
  return prestamos;
}

async function actualizarEstadoPrestamo(
  conn,
  id_prestamo,
  estado,
  autorizado_por = null
) {
  const query = `
    UPDATE prestamos_funcionarios
    SET estado = ?, autorizado_por = ?
    WHERE id_prestamo = ?
  `;
  await conn.query(query, [estado, autorizado_por, id_prestamo]);
}

async function obtenerPrestamoPorId(conn, id_prestamo) {
  const query = `
    SELECT pf.*, u.nombre AS nombre_funcionario
    FROM prestamos_funcionarios pf
    JOIN usuarios u ON pf.id_funcionario = u.id_usuario
    WHERE pf.id_prestamo = ?
  `;
  const [prestamo] = await conn.query(query, [id_prestamo]);
  return prestamo[0] || null;
}
async function crearPagoFuncionario(
  conn,
  { id_caja, id_prestamo, valor, recibido_por }
) {
  const query = `
    INSERT INTO pagos_prestamos_funcionarios (id_caja, id_prestamo, valor, recibido_por)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await conn.query(query, [
    id_caja,
    id_prestamo,
    valor,
    recibido_por,
  ]);
  return result.insertId;
}

async function actualizarPrestamoFuncionario(conn, id_prestamo, monto) {
  const query = `
    UPDATE prestamos_funcionarios
    SET abono = abono + ?, saldo = saldo - ?
    WHERE id_prestamo = ?
  `;
  await conn.query(query, [monto, monto, id_prestamo]);
}

module.exports = {
  crearPrestamo,
  obtenerPrestamosPorFuncionario,
  obtenerPrestamosPorAdministrador,
  actualizarEstadoPrestamo,
  obtenerPrestamoPorId,
  crearPagoFuncionario,
  actualizarPrestamoFuncionario,
};

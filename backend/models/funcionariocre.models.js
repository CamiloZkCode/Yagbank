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
  }

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
      jefe.nombre AS nombre_supervisor
    FROM prestamos_funcionarios pf
    JOIN usuarios u ON pf.id_funcionario = u.id_usuario
    LEFT JOIN usuarios jefe ON u.id_administrador = jefe.id_usuario
    LEFT JOIN usuarios supervisores ON jefe.id_administrador = supervisores.id_usuario
    WHERE (
      -- Supervisores directos del administrador
      (u.id_rol = 2 AND u.id_administrador = ?)
      OR
      -- Asesores cuyos supervisores reportan al administrador
      (u.id_rol = 3 AND jefe.id_administrador = ?)
    )
  `;

  const values = [id_administrador, id_administrador];

  if (estado) {
    query += ` AND pf.estado = ?`;
    values.push(estado);
  }

  const [prestamos] = await db.query(query, values);
  return prestamos;
}

async function actualizarEstadoPrestamo(id_prestamo, estado, autorizado_por) {
  const query = `
    UPDATE prestamos_funcionarios
    SET estado = ?, autorizado_por = ?
    WHERE id_prestamo = ?
  `;
  const values = [estado, autorizado_por, id_prestamo];
  await db.query(query, values);
}

async function obtenerPrestamoPorId(id_prestamo) {
  const query = `
    SELECT pf.*, u.nombre AS nombre_funcionario
    FROM prestamos_funcionarios pf
    JOIN usuarios u ON pf.id_funcionario = u.id_usuario
    WHERE pf.id_prestamo = ?
  `;
  const [prestamo] = await db.query(query, [id_prestamo]);
  return prestamo[0] || null;
}

module.exports = {
  crearPrestamo,
  obtenerPrestamosPorFuncionario,
  obtenerPrestamosPorAdministrador,
  actualizarEstadoPrestamo,
  obtenerPrestamoPorId,
};

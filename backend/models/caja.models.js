const db = require("../config/db");

const crearCaja = async (id_usuario, fecha, caja_inicial = 0) => {
  const [result] = await db.execute(
    `INSERT INTO caja (id_usuario, fecha, caja_inicial, total_cobrado, total_prestado, total_ingresos, total_gastos) 
     VALUES (?, ?, ?, 0, 0, 0, 0)`,
    [id_usuario, fecha, caja_inicial]
  );
  return result.insertId;
};

const obtenerCajaPorUsuarioYFecha = async (id_usuario, fecha) => {
  const [rows] = await db.execute(
    `SELECT * FROM caja WHERE id_usuario = ? AND fecha = ?`,
    [id_usuario, fecha]
  );
  return rows[0];
};

const actualizarCaja = async (id_caja, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  await db.execute(
    `UPDATE caja SET ${setClause} WHERE id_caja = ?`,
    [...values, id_caja]
  );
};

const obtenerCajasPorRol = async (id_usuario, rol, fecha) => {
  let query = '';
  let params = [];

  if (rol === 'Administrador') {
    query = `
      SELECT 
        COALESCE(SUM(c.caja_inicial), 0) as caja_inicial,
        COALESCE(SUM(c.caja_final), 0) as caja_final,
        COALESCE(SUM(c.total_cobrado), 0) as total_cobrado,
        COALESCE(SUM(c.total_prestado), 0) as total_prestado,
        COALESCE(SUM(c.total_ingresos), 0) as total_ingresos,
        COALESCE(SUM(c.total_gastos), 0) as total_gastos,
        COALESCE(SUM(c.clavos_dia), 0) as clavos_dia,
        COALESCE(SUM(c.clientes_clavos_totales), 0) as clientes_clavos_totales
      FROM caja c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      JOIN usuarios s ON u.id_administrador = s.id_usuario
      WHERE s.id_administrador = ? AND c.fecha = ?;
    `;
    params = [id_usuario, fecha];
  } else if (rol === 'Supervisor') {
    query = `
      SELECT c.*
      FROM caja c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE u.id_administrador = ? AND c.fecha = ?;
    `;
    params = [id_usuario, fecha];
  } else if (rol === 'Asesor') {
    query = `
      SELECT *
      FROM caja
      WHERE id_usuario = ? AND fecha = ?;
    `;
    params = [id_usuario, fecha];
  }

  const [rows] = await db.execute(query, params);
  return rows;
};

module.exports = {
  crearCaja,
  obtenerCajaPorUsuarioYFecha,
  actualizarCaja,
  obtenerCajasPorRol
};

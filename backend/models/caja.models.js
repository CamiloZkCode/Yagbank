
const db = require("../config/db");

const crearCaja = async (id_usuario, fecha, caja_inicial = 0) => {
  const [result] = await db.execute(
    `INSERT INTO caja (
      id_usuario, fecha, caja_inicial, total_cobrado, total_prestado, total_ingresos, total_gastos
    ) VALUES (?, ?, ?, 0, 0, 0, 0)`,
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
  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  await db.execute(`UPDATE caja SET ${setClause} WHERE id_caja = ?`, [
    ...values,
    id_caja,
  ]);
};

const obtenerCajasPorRol = async (id_usuario, rol, fecha) => {
  let query = "";
  let params = [];

  if (rol === "Administrador") {
    query = `
      SELECT 
        ? as fecha,
        COALESCE(SUM(c.caja_inicial), 0) as caja_inicial,
        COALESCE(SUM(c.caja_final), 0) as caja_final,
        COALESCE(SUM(c.total_cobrado), 0) as total_cobrado,
        COALESCE(SUM(c.total_prestado), 0) as total_prestado,
        COALESCE(SUM(c.total_ingresos), 0) as total_ingresos,
        COALESCE(SUM(c.total_gastos), 0) as total_gastos,
        COALESCE(SUM(c.clavos_dia), 0) as clavos_dia,
        COALESCE(SUM(c.clientes_clavos_totales), 0) as clientes_clavos_totales,
        COALESCE((
          SELECT SUM(pf.monto) 
          FROM prestamos_funcionarios pf
          JOIN usuarios u ON pf.id_funcionario = u.id_usuario
          WHERE pf.fecha = ? 
            AND pf.estado = 'Aprobado'
            AND (u.id_administrador = ? OR u.id_usuario = ?)
        ), 0) as total_prestamos_funcionarios,
        COALESCE((
          SELECT SUM(pc.valor_prestamo)
          FROM prestamos_clientes pc
          JOIN usuarios u ON pc.creado_por = u.id_usuario
          WHERE pc.fecha_inicio = ?
            AND (u.id_administrador = ? OR u.id_usuario = ?)
        ), 0) as total_prestamos_clientes
      FROM caja c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.fecha = ?;
    `;
    params = [
      fecha, fecha, id_usuario, id_usuario,
      fecha, id_usuario, id_usuario, fecha
    ];
  }

  else if (rol === "Supervisor") {
    query = `
      SELECT 
        c.*,
        COALESCE((
          SELECT SUM(pf.monto) 
          FROM prestamos_funcionarios pf
          JOIN usuarios u ON pf.id_funcionario = u.id_usuario
          WHERE pf.fecha = c.fecha
            AND pf.estado = 'Aprobado'
            AND u.id_administrador = ?
        ), 0) as total_prestamos_funcionarios,
        COALESCE((
          SELECT SUM(pc.valor_prestamo)
          FROM prestamos_clientes pc
          JOIN usuarios u ON pc.creado_por = u.id_usuario
          WHERE pc.fecha_inicio = c.fecha
            AND u.id_administrador = ?
        ), 0) as total_prestamos_clientes
      FROM caja c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE u.id_administrador = ? AND c.fecha = ?;
    `;
    params = [id_usuario, id_usuario, id_usuario, fecha];
  }

  else if (rol === "Asesor") {
    query = `
      SELECT 
        c.*,
        COALESCE((
          SELECT SUM(monto) 
          FROM prestamos_funcionarios 
          WHERE fecha = c.fecha 
            AND id_funcionario = ?
            AND estado = 'Aprobado'
        ), 0) as total_prestamos_funcionarios,
        COALESCE((
          SELECT SUM(valor_prestamo)
          FROM prestamos_clientes
          WHERE fecha_inicio = c.fecha
            AND creado_por = ?
        ), 0) as total_prestamos_clientes
      FROM caja c
      WHERE c.id_usuario = ? AND c.fecha = ?;
    `;
    params = [id_usuario, id_usuario, id_usuario, fecha];
  }

  const [rows] = await db.execute(query, params);
  return rows;
};

module.exports = {
  crearCaja,
  obtenerCajaPorUsuarioYFecha,
  actualizarCaja,
  obtenerCajasPorRol,
};

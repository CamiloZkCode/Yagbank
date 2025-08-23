const db = require("../config/db");

async function crearGasto(gastos) {
  const { id_caja, usuario_id, nombre, descripcion, valor, fecha } = gastos;

  const query = `
    INSERT INTO gastos (id_caja, usuario_id, nombre, descripcion, valor, fecha, url_foto)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    id_caja,
    usuario_id,
    nombre,
    descripcion,
    valor,
    fecha,
    "", // Valor predeterminado para url_foto
  ];

  const [result] = await db.query(query, values);
  return result.insertId;
}

async function mostrarGasto(id_usuario) {
  const sql = `
    SELECT
      g.id_gasto,
      g.fecha,
      g.nombre,
      g.valor,
      g.descripcion,
      g.url_foto
    FROM gastos g
    WHERE g.usuario_id = ?
    ORDER BY g.fecha DESC
  `;

  const [rows] = await db.query(sql, [id_usuario]);
  return rows;
}

const mostrarGastosParaAdmin = async (id_admin) => {
  const sql = `
    SELECT
      g.id_gasto,
      g.fecha,
      g.nombre AS tipo_gasto,
      u.nombre AS usuario,
      r.rol AS cargo,
      jefe.nombre AS nombre_supervisor,
      g.valor,
      g.descripcion,
      g.url_foto
    FROM gastos g
    JOIN usuarios u ON g.usuario_id = u.id_usuario
    JOIN roles r ON u.id_rol = r.id_rol
    LEFT JOIN usuarios jefe ON u.id_administrador = jefe.id_usuario
    WHERE 
      -- Supervisores directos del administrador
      (u.id_rol = 2 AND u.id_administrador = ?)
      OR
      -- Asesores cuyos supervisores reportan al administrador
      (u.id_rol = 3 AND u.id_administrador IN (
          SELECT id_usuario FROM usuarios 
          WHERE id_rol = 2 AND id_administrador = ?
      ))
    ORDER BY g.fecha DESC
  `;
  const [rows] = await db.query(sql, [id_admin, id_admin]);
  return rows;
};

module.exports = {
  crearGasto,
  mostrarGasto,
  mostrarGastosParaAdmin,
};

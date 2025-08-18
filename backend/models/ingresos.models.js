const db = require("../config/db");

async function crearIngreso(ingreso) {
  const { id_caja, usuario_id, tipo, descripcion, valor, fecha } = ingreso;

  const query = ` 
    INSERT INTO ingresos (
    id_caja, usuario_id, tipo, descripcion, valor , fecha) 
    VALUES (?,?,?,?,?,?)`;

  const values = [id_caja, usuario_id, tipo, descripcion, valor, fecha];

  const [result] = await db.query(query, values);
  return result.insertId;
}


async function mostrarIngreso() {
  const sql  =
  `
  SELECT
  i.fecha,
  i.tipo,
  u.nombre AS usuario,
  i.valor,
  i.descripcion
  FROM ingresos i
  JOIN usuarios u ON i.usuario_id = u.id_usuario
  ORDER BY i.fecha DESC
  `;

  const [rows] = await db.query(sql);
  return rows;
  
}


module.exports = {
  crearIngreso,
  mostrarIngreso
};




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


module.exports = {
  crearIngreso,
};

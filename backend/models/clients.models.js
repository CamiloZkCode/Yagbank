const db = require("../config/db");

async function crearCliente(cliente) {
  const {
    documento_cliente, nombre, apellido,
    direccion_casa, direccion_trabajo, telefono, ocupacion,
    referencia, fecha_creacion, url_cedula, url_negocio,
    url_documentonegocio, creado_por, estado,  id_asesor
  } = cliente;

  const query = `
    INSERT INTO clientes (
      documento_cliente, nombre, apellido,
direccion_casa, direccion_trabajo, telefono, ocupacion,
      referencia, fecha_creacion, url_cedula, url_negocio,
      url_documentonegocio, creado_por, estado, id_asesor
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    documento_cliente, nombre, apellido,
    direccion_casa, direccion_trabajo, telefono, ocupacion,
    referencia, fecha_creacion, url_cedula, url_negocio,
    url_documentonegocio, estado, creado_por, id_asesor
  ];

  await db.query(query, values);
}

async function obtenerClientesPorUsuario(usuario_id) {
  const [clientes] = await db.query(`
    SELECT * FROM clientes WHERE creado_por = ?
  `, [usuario_id]);
  return clientes;
}

module.exports = {
  crearCliente,
  obtenerClientesPorUsuario,
};
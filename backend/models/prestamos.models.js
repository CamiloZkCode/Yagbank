const db = require("../config/db");

async function crearPrestamo(prestamo) {
  const {
    id_prestamo,documento_cliente, valor_prestamo,forma_pago,numero_cuotas,valor_diario,total,fecha_inicio,creado_por
  } = cliente;

  const query = `
    INSERT INTO prestamos_clientes (
    id_prestamo,documento_cliente, valor_prestamo,forma_pago,numero_cuotas,valor_diario,total,fecha_inicio,creado_por
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    id_prestamo,documento_cliente, valor_prestamo,forma_pago,numero_cuotas,valor_diario,total,fecha_inicio,creado_por
  ];

  await db.query(query, values);
}

module.exports = {
  crearPrestamo,
};
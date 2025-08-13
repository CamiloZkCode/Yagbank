const db = require("../config/db");

async function crearPrestamo(prestamo) {
  const {
    documento_cliente, valor_prestamo, forma_pago, numero_cuotas,
    valor_diario, total, fecha_inicio, creado_por, id_caja, fecha_finalizacion, interes
  } = prestamo;

  const query = `
    INSERT INTO prestamos_clientes (
      id_caja, documento_cliente, fecha_inicio, valor_prestamo,
      forma_pago, numero_cuotas, valor_diario, interes, total,
      creado_por, fecha_finalizacion
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    id_caja, documento_cliente, fecha_inicio, valor_prestamo,
    forma_pago, numero_cuotas, valor_diario, interes, total,
    creado_por, fecha_finalizacion
  ];

  const [result] = await db.query(query, values);
  return result.insertId;
}

async function crearCuota(cuota) {
  const { id_prestamo, id_caja, numero_cuota, fecha_pago, monto } = cuota;
  const query = `
    INSERT INTO cuotas (id_prestamo, id_caja, numero_cuota, fecha_pago, monto, pagada)
    VALUES (?, ?, ?, ?, ?, FALSE)
  `;
  const values = [id_prestamo, id_caja, numero_cuota, fecha_pago, monto];
  await db.query(query, values);
}

module.exports = {
  crearPrestamo,
  crearCuota,
};

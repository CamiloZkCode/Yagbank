const db = require("../config/db");
const moment = require("moment-timezone");


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


// ==========================
// CREAR CUOTAS AUTOMÁTICAS
// ==========================
async function crearCuotas(idPrestamo, numeroCuotas, fechaInicio, valorCuota, formaPago) {
  const cuotas = [];
  let fecha = moment.tz(fechaInicio, "YYYY-MM-DD", "America/Bogota");

  for (let i = 1; i <= numeroCuotas; i++) {
    // Avanzar fecha según modalidad
    switch (formaPago) {
      case "Diario":
        do { fecha = fecha.add(1, "day"); } while (fecha.day() === 0); // saltar domingos
        break;
      case "Semanal":
        fecha = fecha.add(7, "days");
        if (fecha.day() === 0) fecha = fecha.add(1, "day");
        break;
      case "Quincenal":
        fecha = fecha.add(15, "days");
        if (fecha.day() === 0) fecha = fecha.add(1, "day");
        break;
      case "Mensual":
        fecha = fecha.add(1, "month");
        if (fecha.day() === 0) fecha = fecha.add(1, "day");
        break;
      default:
        throw new Error("Forma de pago inválida");
    }

    cuotas.push([idPrestamo, null, i, fecha.format("YYYY-MM-DD"), valorCuota, 'pendiente']);
  }

  const query = `
    INSERT INTO cuotas (id_prestamo, id_caja, numero_cuota, fecha_pago, monto,estado)
    VALUES ?
  `;
  await db.query(query, [cuotas]);
}




module.exports = {
  crearPrestamo,
  crearCuotas,
};

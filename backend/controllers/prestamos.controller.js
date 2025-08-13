const db = require("../config/db");
const { crearPrestamo, crearCuota } = require('../models/prestamos.models');

async function registrarPrestamos(req, res) {
  const conn = await db.getConnection();
  try {
    const nuevoPrestamo = req.body;

    // Validación básica de campos
    if (!nuevoPrestamo.documento_cliente ||
        !nuevoPrestamo.valor_prestamo ||
        !nuevoPrestamo.forma_pago ||
        !nuevoPrestamo.numero_cuotas ||
        !nuevoPrestamo.valor_diario ||
        !nuevoPrestamo.total ||
        !nuevoPrestamo.id_caja ||
        typeof nuevoPrestamo.interes !== 'number') {
      return res.status(400).json({ message: 'Faltan campos obligatorios o interes inválido' });
    }

    await conn.beginTransaction();

    // Validar que no exista préstamo igual para ese cliente y fecha
    const [existing] = await conn.query(
      'SELECT * FROM prestamos_clientes WHERE documento_cliente = ? AND fecha_inicio = ?',
      [nuevoPrestamo.documento_cliente, nuevoPrestamo.fecha_inicio || new Date()]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'El préstamo ya existe para ese cliente en esta fecha' });
    }

    // Ajustar fechas
    nuevoPrestamo.fecha_inicio = nuevoPrestamo.fecha_inicio ? new Date(nuevoPrestamo.fecha_inicio) : new Date();

    // Insertar préstamo y obtener id
    const idPrestamo = await crearPrestamo(nuevoPrestamo);

    // Crear cuotas saltando domingos
    let fechaPago = new Date(nuevoPrestamo.fecha_inicio);
    fechaPago.setDate(fechaPago.getDate() + 1);

    for (let i = 1; i <= nuevoPrestamo.numero_cuotas; i++) {
      while (fechaPago.getDay() === 0) {
        fechaPago.setDate(fechaPago.getDate() + 1);
      }

      await crearCuota({
        id_prestamo: idPrestamo,
        id_caja: nuevoPrestamo.id_caja,
        numero_cuota: i,
        fecha_pago: fechaPago,
        monto: nuevoPrestamo.valor_diario
      });

      fechaPago.setDate(fechaPago.getDate() + 1);
    }

    await conn.commit();

    res.status(201).json({ message: 'Préstamo y cuotas creados correctamente', id_prestamo: idPrestamo });

  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error al crear el préstamo y cuotas' });
  } finally {
    conn.release();
  }
}

module.exports = {
  registrarPrestamos,
};

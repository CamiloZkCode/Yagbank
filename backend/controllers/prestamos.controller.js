const db = require("../config/db");
const { crearPrestamo } = require('../models/prestamos.models');


async function registrarPrestamos(req, res) {
  try {
    const nuevoPrestamo = req.body;

     if (!nuevoPrestamo.documento_cliente ||!nuevoPrestamo.valor_prestamo ||!nuevoPrestamo.forma_pago ||
        !nuevoPrestamo.numero_cuotas ||!nuevoPrestamo.valor_diario ||!nuevoPrestamo.total||!nuevoPrestamo.documento_cliente 
      ) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const [existing] = await db.query(
      'SELECT * FROM prestamos_cliente WHERE id_prestamos = ?',
      [nuevoCliente.id_prestamos]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'El prestamo ya existe' });
    }

    nuevoPrestamo.creado_por = req.user.id_usuario;
    nuevoPrestamo.fecha_inicio = new Date();

    await crearPrestamo(nuevoPrestamo);
    res.status(201).json({ message: 'Prestamo creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear el Prestamo' });
  }
}



module.exports = {
  registrarPrestamos,
};
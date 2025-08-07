const { crearCliente, obtenerClientesPorUsuario } = require('../models/clients.models');
const db = require('../config/db');

async function registrarClientes(req, res) {
  try {
    const nuevoCliente = req.body;

     if (!nuevoCliente.documento_cliente || !nuevoCliente.nombre || !nuevoCliente.apellido || 
        !nuevoCliente.direccion_casa || !nuevoCliente.direccion_trabajo || !nuevoCliente.telefono || 
        !nuevoCliente.ocupacion || !nuevoCliente.referencia || !nuevoCliente.url_cedula || 
        !nuevoCliente.estado || !nuevoCliente.id_ruta) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const [existing] = await db.query(
      'SELECT * FROM clientes WHERE documento_cliente = ?',
      [nuevoCliente.documento_cliente]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'El cliente ya existe' });
    }

    nuevoCliente.creado_por = req.user.id_usuario;
    nuevoCliente.fecha_creacion = new Date();

    await crearCliente(nuevoCliente);
    res.status(201).json({ message: 'Cliente creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear el cliente' });
  }
}

async function listarMisClientes(req, res) {
  try {
    const clientes = await obtenerClientesPorUsuario(req.user.id_usuario);
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los clientes' });
  }
}

module.exports = {
  registrarClientes,
  listarMisClientes,
};
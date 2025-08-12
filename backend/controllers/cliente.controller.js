const usuariosModel = require("../models/user.models");
const db = require("../config/db");


async function EditarCliente(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }

    const { documento } = req.params;
    const {
      nombre,
      apellido,
      direccion_casa,
      direccion_trabajo,
      telefono,
      ocupacion,
      referencia,
      id_asesor
    } = req.body;

    // Verificar si el cliente existe
    const [clienteExistente] = await db.query(
      "SELECT documento_cliente FROM clientes WHERE documento_cliente = ?",
      [documento]
    );

    if (!clienteExistente || clienteExistente.length === 0) {
      return res.status(404).json({ success: false, message: "Cliente no encontrado" });
    }

    // Actualizar cliente
    await db.query(
      `UPDATE clientes 
       SET nombre = ?, apellido = ?, direccion_casa = ?, direccion_trabajo = ?, 
           telefono = ?, ocupacion = ?, referencia = ?, id_asesor = ?
       WHERE documento_cliente = ?`,
      [
        nombre,
        apellido,
        direccion_casa,
        direccion_trabajo,
        telefono,
        ocupacion,
        referencia,
        id_asesor, // este es el usuario asesor asignado
        documento
      ]
    );

    // Obtener datos actualizados
    const [clienteActualizado] = await db.query(
      "SELECT * FROM clientes WHERE documento_cliente = ?",
      [documento]
    );

    res.json({
      success: true,
      message: "Cliente actualizado correctamente",
      cliente: clienteActualizado[0]
    });
  } catch (error) {
    console.error("Error al editar cliente:", error);
    res.status(500).json({ success: false, message: "Error al editar cliente" });
  }
}
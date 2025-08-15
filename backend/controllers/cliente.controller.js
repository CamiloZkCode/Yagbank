const usuariosModel = require("../models/user.models");
const db = require("../config/db");


async function obtenerInfoPrestamosCliente(req, res) {
  const { id_usuario } = req.user; // ID del administrador logueado
  const conn = await db.getConnection();

  try {
    // =================== CLIENTES CON PRÉSTAMO ACTIVO ===================
    const [clientes] = await conn.query(
      `SELECT 
        c.documento_cliente,
        c.nombre,
        c.apellido,
        c.direccion_casa,
        c.telefono,
        c.ocupacion,
        c.estado AS cliente_activo,
        c.fecha_creacion,
        p.id_prestamo,
        p.valor_prestamo,
        p.numero_cuotas,
        p.valor_diario,
        p.interes,
        p.total,
        p.fecha_inicio,
        p.fecha_finalizacion,
        p.estado AS estado_prestamo,
        a.nombre AS nombre_asesor,
        s.nombre AS nombre_supervisor,
        a.id_usuario AS id_asesor,
        s.id_usuario AS id_supervisor
      FROM clientes c
      LEFT JOIN prestamos_clientes p 
        ON c.documento_cliente = p.documento_cliente
        AND p.estado = 'Activo'
      INNER JOIN usuarios a ON c.id_asesor = a.id_usuario
      LEFT JOIN usuarios s ON a.id_administrador = s.id_usuario
      LEFT JOIN usuarios admin ON s.id_administrador = admin.id_usuario
      WHERE admin.id_usuario = ?  -- Clientes bajo este administrador
         OR s.id_usuario = ?     -- O clientes de supervisores directos
         OR a.id_usuario = ?      -- O clientes del asesor directo (si el admin consulta su propio portafolio)
      ORDER BY c.nombre, c.apellido`,
      [id_usuario, id_usuario, id_usuario]
    );

    if (!clientes.length) {
      return res.status(200).json({
        clientes: [],
        message: "No se encontraron clientes para este administrador"
      });
    }

    // =================== OBTENER HISTORIAL PARA CADA CLIENTE ===================
    const documentosClientes = clientes.map(c => c.documento_cliente);
    const [historiales] = await conn.query(
      `SELECT 
        id_prestamo,
        documento_cliente,
        valor_prestamo,
        numero_cuotas,
        valor_diario,
        interes,
        total,
        fecha_inicio,
        fecha_finalizacion,
        estado
      FROM prestamos_clientes
      WHERE documento_cliente IN (?)
      ORDER BY documento_cliente, fecha_inicio DESC`,
      [documentosClientes]
    );

    // Organizar el historial por cliente
    const historialPorCliente = historiales.reduce((acc, prestamo) => {
      if (!acc[prestamo.documento_cliente]) {
        acc[prestamo.documento_cliente] = [];
      }
      acc[prestamo.documento_cliente].push(prestamo);
      return acc;
    }, {});

    // Combinar datos
    const resultado = clientes.map(cliente => ({
      ...cliente,
      historial: historialPorCliente[cliente.documento_cliente] || []
    }));

    return res.json({
      clientes: resultado
    });

  } catch (error) {
    console.error("Error en listarClientesConPrestamos:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error interno del servidor"
    });
  } finally {
    conn.release();
  }
}

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


module.exports = { obtenerInfoPrestamosCliente };

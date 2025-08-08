const usuariosModel = require('../models/user.models');
const db = require('../config/db');

async function cambiarEstadoUsuario(req, res) {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const [existing] = await db.query(
      'SELECT estado FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'El usuario no existe' });
    }

    // Cambiar el estado (toggle)
    await db.query(
      'UPDATE usuarios SET estado = NOT estado WHERE id_usuario = ?',
      [id]
    );

    // Obtener el nuevo estado
    const [updated] = await db.query(
      'SELECT estado FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    const nuevoEstado = updated[0].estado;

    res.status(200).json({
      message: 'Estado del usuario cambiado correctamente',
      nuevoEstado: nuevoEstado,
      estadoTexto: nuevoEstado ? 'Activo' : 'Inactivo'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
}



const getSupervisores = async (req, res) => {
  try {
    const supervisores = await usuariosModel.obtenerSupervisores();
    res.status(200).json(supervisores);
  } catch (error) {
    console.error('Error al obtener supervisores:', error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener supervisores' });
  }
};

const getUsuariosxSupervisor = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const UsuariosXSupervisor = await usuariosModel.obtenerUsuariosXSupervisor(id_usuario);
    res.status(200).json(UsuariosXSupervisor);
  } catch (error) {
    console.error('Error al obtener supervisores:', error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener supervisores' });
  }
};

const getUsuariosxAdmin = async (req, res) => {
  try {
    const id_administrador = req.user.id_usuario; // <-- ID desde el token JWT
    const UsuariosXAdmin = await usuariosModel.obtenerUsuariosxAdmin(id_administrador);
    res.status(200).json(UsuariosXAdmin);
  } catch (error) {
    console.error('Error al obtener lista de usuarios:', error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener lista de usuarios' });
  }
};





module.exports = {
  getUsuariosxAdmin,
  getSupervisores,
  getUsuariosxSupervisor,
  cambiarEstadoUsuario,
  };
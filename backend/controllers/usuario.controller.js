const usuariosModel = require('../models/user.models');


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
  getUsuariosxSupervisor
  };
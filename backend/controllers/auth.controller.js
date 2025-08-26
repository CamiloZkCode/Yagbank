const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByUsername, getRolById,obtenerDatosUsuario } = require("../models/user.models");
const {obtenerCajaPorUsuarioYFecha, crearCaja } = require("../models/caja.models");
const { fechaHoy } = require("../utils/fechas.js");


async function login(req, res) {
  const { username, contraseña } = req.body;

  //Buscar Username en la tabla y verificar que exista
  const user = await findUserByUsername(username);
  if (!user) return res.status(401).json({ message: "Usuario no registrado" });

  // Verificar el estado del usuario
  if (user.estado !== 1) {
    //
    return res.status(403).json({
      message:
        "Cuenta inactiva o suspendida. Por favor, contacte al administrador.",
    });
  }

  //validar contraseña
  const match = await bcrypt.compare(contraseña, user.contraseña_hash);
  if (!match) return res.status(401).json({ message: "Contraseña incorrecta" });

  const rol = await getRolById(user.id_rol);

  //Creacion de caja diaria 
  const fecha = fechaHoy();
  let caja = await obtenerCajaPorUsuarioYFecha(user.id_usuario, fecha);
  if (!caja) {
    await crearCaja(user.id_usuario, fecha, 0); // 0 = caja inicial por defecto
  }

  const token = jwt.sign(
    {
      id_usuario: user.id_usuario,
      rol,
      id_rol: user.id_rol,
      debe_cambiar_contrasena: user.debe_cambiar_contrasena,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

   const datosUsuario = await obtenerDatosUsuario(user.id_usuario);

  res.json({
    token,
    user: {
      id: user.id_usuario,
      nombre: user.nombre,
      rol,
      id_rol: user.id_rol,
      debe_cambiar_contrasena: user.debe_cambiar_contrasena,
    },

    requiereDatos: !datosUsuario // true si no existen los datos
  });
}

module.exports = { login };

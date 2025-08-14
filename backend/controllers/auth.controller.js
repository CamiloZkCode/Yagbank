const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByUsername, getRolById } = require("../models/user.models");
const {obtenerCajaPorUsuarioYFecha, crearCaja } = require("../models/caja.models")

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
  const fechaHoy = new Date().toISOString().split("T")[0];
  let caja = await obtenerCajaPorUsuarioYFecha(user.id_usuario, fechaHoy);
  if (!caja) {
    await crearCaja(user.id_usuario, fechaHoy, 0); // 0 = caja inicial por defecto
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

  res.json({
    token,
    user: {
      id: user.id_usuario,
      nombre: user.nombre,
      rol,
      id_rol: user.id_rol,
      debe_cambiar_contrasena: user.debe_cambiar_contrasena,
    },
  });
}

module.exports = { login };

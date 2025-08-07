const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByUsername, getRolById } = require('../models/user.models');

async function login(req, res) {
  const { username, contraseña } = req.body;

  const user = await findUserByUsername(username);
  if (!user) return res.status(401).json({ message: 'Usuario no registrado' });

  const match = await bcrypt.compare(contraseña, user.contraseña_hash);
  if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

  const rol = await getRolById(user.id_rol);

  const token = jwt.sign(
    { id_usuario: user.id_usuario, rol,id_rol: user.id_rol },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token, user: { id: user.id_usuario, nombre: user.nombre, rol,id_rol: user.id_rol } });
}

module.exports = { login };
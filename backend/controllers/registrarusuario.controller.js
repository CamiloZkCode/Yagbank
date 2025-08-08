const bcrypt = require('bcrypt');
const db = require('../config/db');

async function registrarUsuario(req, res) {
  const { id_usuario, nombre,telefono,correo, id_rol, id_administrador } = req.body;

  try {
    // Validar que los campos obligatorios estén presentes
    if (!id_usuario || !nombre || !telefono|| !correo|| !id_rol) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Obtener el nombre del rol para incluirlo en el username
    const [rolData] = await db.query('SELECT rol FROM roles WHERE id_rol = ?', [id_rol]);
    if (rolData.length === 0) {
      return res.status(400).json({ message: 'Rol no válido' });
    }
    const nombreRol = rolData[0].rol.toLowerCase();

    // Generar el username automático
    const username = generarUsername(id_usuario, nombre, nombreRol);

    // Establecer contraseña predeterminada
    const contraseña = "yagbank2025";
    const hash = await bcrypt.hash(contraseña, 10);

    // Verificar si el usuario ya existe
    const [existing] = await db.query(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Insertar el nuevo usuario
    await db.query(
      `INSERT INTO usuarios (id_usuario, nombre,telefono,correo, username, contraseña_hash, id_rol, id_administrador)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario, nombre,telefono,correo, username, hash, id_rol, id_administrador || null]
    );

    res.status(201).json({ 
      message: 'Usuario registrado correctamente',
      datos: {
        username: username,
        contraseña_temporal: contraseña 
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
}



// Función para generar el username automático
function generarUsername(idUsuario, nombreCompleto, rol) {
  // Tomar las primeras 3 letras del primer nombre
  const primerNombre = nombreCompleto.split(' ')[0].toLowerCase();
  const inicialesNombre = primerNombre.substring(0, 3);
  
  // Tomar los últimos 3 dígitos de la cédula
  const ultimosDigitos = idUsuario.toString().slice(-3);
  
  // Crear el username combinando estos elementos
  return `${inicialesNombre}${ultimosDigitos}.${rol}`;
}



module.exports = { registrarUsuario};
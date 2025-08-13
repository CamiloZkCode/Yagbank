const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
  try {
    // 1. Obtener el encabezado de autorización de manera segura
    const authHeader = req.header('Authorization') || req.header('authorization');
    
    // 2. Verificar si existe el encabezado
    if (!authHeader) {
      return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    // 3. Extraer el token del encabezado
    const receivedToken = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    // 4. Verificar el token
    const decoded = jwt.verify(receivedToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error en verificación de token:', error.message);
    return res.status(401).json({ 
      message: 'Token inválido o expirado',
      error: error.message 
    });
  }
}

function verificarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user?.rol) {
      return res.status(403).json({ message: 'Información de rol no disponible' });
    }
    
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }
    next();
  };
}

function verificarCambioContrasena(req, res, next) {
  if (req.user.debe_cambiar_contrasena) {
    return res.status(403).json({
      message: 'Debe cambiar su contraseña antes de continuar.'
    });
  }
  next();
}


module.exports = { verificarToken, verificarRoles,verificarCambioContrasena };
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controller');
const { cambiarContrasena } = require('../controllers/usuario.controller');
const { verificarToken, verificarRoles } = require('../middlewares/auth.middlewares');

router.post('/login', login);
router.post('/actualizarContrasena',verificarToken,cambiarContrasena)

module.exports = router;
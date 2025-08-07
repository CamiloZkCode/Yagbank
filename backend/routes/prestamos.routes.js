const express = require('express');
const router = express.Router();
const { registrarPrestamos } = require('../controllers/prestamos.controller');
const { verificarToken, verificarRoles } = require('../middlewares/auth.middlewares');

router.post('/registrarPrestamos', verificarToken,registrarPrestamos);


module.exports = router;
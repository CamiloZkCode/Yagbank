const express = require('express');
const router = express.Router();
const { registrarClientes,listarMisClientes } = require('../controllers/registrarclientes.controller');
const { obtenerInfoPrestamosCliente } = require ('../controllers/cliente.controller')
const { verificarToken, verificarRoles } = require('../middlewares/auth.middlewares');

router.post('/registrarClientes', verificarToken,registrarClientes);
router.get('/ConsultarCLientes', listarMisClientes);
router.get('/listarClientesConPrestamos/:id_admin', verificarToken, obtenerInfoPrestamosCliente)

module.exports = router;
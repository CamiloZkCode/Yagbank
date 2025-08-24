const express = require('express');
const router = express.Router();
const { registrarClientes,listarMisClientes } = require('../controllers/registrarclientes.controller');
const { obtenerInfoPrestamosCliente,obtenerInfoPrestamosClientesSupervisor } = require ('../controllers/cliente.controller')
const { verificarToken, verificarRoles } = require('../middlewares/auth.middlewares');

router.post('/registrarClientes', verificarToken,registrarClientes);
router.get('/ConsultarCLientes', listarMisClientes);
router.get('/listarClientesConPrestamos/:id_admin', verificarToken, obtenerInfoPrestamosCliente)
router.get('/listarClientesConPrestamosSupervisor/:id_supervisor', verificarToken, obtenerInfoPrestamosClientesSupervisor)

module.exports = router;
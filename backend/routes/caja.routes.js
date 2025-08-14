const express = require('express');
const router = express.Router();
const CajaController = require('../controllers/caja.controller.js');
const { verificarToken } = require('../middlewares/auth.middlewares');


router.post('/generar', verificarToken, CajaController.generarCajaDiaria);
router.get('/por-rol', verificarToken, CajaController.obtenerCajaPorRol);
router.post('/cerrar-caja', verificarToken, CajaController.cerrarCaja);

module.exports = router;
const express = require('express');
const router = express.Router();
const CajaController = require('../controllers/caja.controller.js');
const { verificarToken } = require('../middlewares/auth.middlewares');


router.post('/generar', verificarToken, CajaController.generarCajaDiaria);
router.get('/obtener', verificarToken, CajaController.obtenerCajaPorRol);
router.post('/cerrar', verificarToken, CajaController.cerrarCaja);
router.get('/verificar', verificarToken, CajaController.verificarCajasDependientes );

module.exports = router;
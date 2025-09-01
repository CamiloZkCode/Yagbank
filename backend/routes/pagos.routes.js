const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middlewares');
const { realizarPago, getDatosPagos, getCuotas, marcarClavo, marcarNota,guardarOrden } = require('../controllers/pagos.controller');

router.post('/realizar', verificarToken, realizarPago);
router.get('/datos', verificarToken, getDatosPagos);
router.get('/cuotas/:id', verificarToken, getCuotas);
router.post('/clavo', verificarToken, marcarClavo);
router.post('/nota', verificarToken, marcarNota);
router.post('/orden', verificarToken, guardarOrden);

module.exports = router;
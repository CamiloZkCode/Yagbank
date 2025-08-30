const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middlewares');
const { realizarPago, getDatosPagos, getCuotas, marcarClavo, marcarNota } = require('../controllers/pagos.controller');

router.post('/realizar', verificarToken, realizarPago);
router.get('/datos', verificarToken, getDatosPagos);
router.get('/cuotas/:id', verificarToken, getCuotas);
router.post('/clavo', verificarToken, marcarClavo);
router.post('/nota', verificarToken, marcarNota);

module.exports = router;
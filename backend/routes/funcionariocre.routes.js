const express = require('express');
const router = express.Router();
const {
  crearPrestamoFuncionario,
  obtenerSolicitudesPendientes,
  aceptarPrestamo,
  rechazarPrestamo,
  obtenerPrestamosAceptados,
  liquidarPrestamo,
} = require('../controllers/funcionariocre.controller');
const { verificarToken } = require('../middlewares/auth.middlewares');

// Rutas modificadas con verificarRoles
router.post('/crear-funcionario', verificarToken, crearPrestamoFuncionario);
router.get('/pendientes', verificarToken, obtenerSolicitudesPendientes);
router.post('/aprobar/:id_prestamo', verificarToken, aceptarPrestamo);
router.post('/rechazar/:id_prestamo', verificarToken,rechazarPrestamo);
router.get('/aprobados', verificarToken, obtenerPrestamosAceptados);
router.post('/liquidar/:id_prestamo', verificarToken, liquidarPrestamo);

module.exports = router;
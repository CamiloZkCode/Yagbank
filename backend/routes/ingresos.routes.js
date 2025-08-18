const express = require('express');
const router = express.Router();
const { crearIngresoCaja, obtenerIngresos } = require("../controllers/ingreso.controller");

// Cambiado para coincidir con tu frontend
router.post('/crear-ingreso', crearIngresoCaja);
router.get('/ver-ingreso', obtenerIngresos)

module.exports = router;
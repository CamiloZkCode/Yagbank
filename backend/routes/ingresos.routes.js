const express = require('express');
const router = express.Router();
const { crearIngresoCaja } = require("../controllers/ingreso.controller");

// Cambiado para coincidir con tu frontend
router.post('/crear-ingreso', crearIngresoCaja);

module.exports = router;
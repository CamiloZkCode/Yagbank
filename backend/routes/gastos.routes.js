const express = require('express');
const router = express.Router();
const { verificarToken, verificarRoles } = require('../middlewares/auth.middlewares');
const { crearGastoCaja, obtenerGastos, TodosGastos } = require("../controllers/gastos.controller");

router.post('/crear-gastos',  verificarToken, crearGastoCaja);
router.get('/usuarios-gastos', verificarToken, obtenerGastos);
router.get('/todos-gastos',verificarToken, TodosGastos);

module.exports = router;
const express = require('express');
const router = express.Router();
const { verificarToken, verificarRoles } = require('../middlewares/auth.middlewares');
const {getAsesores , crearRuta } = require('../controllers/rutas.controller');


router.post('/cargarAsesores',verificarToken,getAsesores);
router.post('/crearRuta' , verificarToken, crearRuta);

module.exports = router;
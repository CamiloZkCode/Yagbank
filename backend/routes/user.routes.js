const express = require('express');
const router = express.Router();
const { registrarUsuario } = require('../controllers/registrarusuario.controller');
const { verificarToken, verificarRoles } = require('../middlewares/auth.middlewares');
const usuariocontroller = require('../controllers/usuario.controller');
const {getUsuariosxAdmin} = require('../controllers/usuario.controller');
const {getUsuariosxSupervisor} = require('../controllers/usuario.controller');




router.post('/registrousuario', verificarToken, verificarRoles('Administrador','Supervisor'), registrarUsuario);
router.get('/supervisores', usuariocontroller.getSupervisores);
router.post('/cargartablausuarioXadmin',verificarToken,getUsuariosxAdmin);
router.post('/cargartablausuarioXsupervisor',verificarToken,getUsuariosxSupervisor);
module.exports = router; 


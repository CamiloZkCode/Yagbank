const express = require('express');
const router = express.Router();
const { registrarUsuario } = require('../controllers/registrarusuario.controller');
const { verificarToken, verificarRoles } = require('../middlewares/auth.middlewares');
const usuariocontroller = require('../controllers/usuario.controller');
const {getUsuariosxAdmin,getUsuariosxSupervisor,cambiarEstadoUsuario,EditarUsuario,getAsesores} = require('../controllers/usuario.controller');


router.post('/registrousuario', verificarToken, verificarRoles('Administrador','Supervisor'), registrarUsuario);
router.get('/supervisores', usuariocontroller.getSupervisores);
router.post('/asesores',verificarToken,getAsesores);
router.post('/cargartablausuarioXadmin',verificarToken,getUsuariosxAdmin);
router.post('/cargartablausuarioXsupervisor',verificarToken,getUsuariosxSupervisor);
router.post('/:id/estado',verificarToken,cambiarEstadoUsuario)
router.post('/:id/editar', verificarToken, EditarUsuario);
module.exports = router; 


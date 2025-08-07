const bcrypt = require('bcrypt');

const contraseñaPlano = 'admin';

bcrypt.hash(contraseñaPlano, 10).then(hash => {
  console.log('Hash generado:', hash);
});
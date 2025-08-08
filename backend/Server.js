const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const clientsRoutes =require ('./routes/clients.routes');
const prestamosRoutes =require ('./routes/prestamos.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use ('/api/clientes',clientsRoutes);
app.use ('/api/prestamos',prestamosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
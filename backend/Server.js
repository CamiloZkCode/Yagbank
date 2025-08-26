const express = require("express");
const cors = require("cors");
const cron = require("node-cron"); // Importar node-cron
require("dotenv").config();
process.env.TZ = "America/Bogota";
const moment = require("moment-timezone");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const clientsRoutes = require("./routes/clients.routes");
const prestamosRoutes = require("./routes/prestamos.routes");
const CajaRoutes = require("./routes/caja.routes");
const PrestamoFuncionario = require("./routes/funcionariocre.routes");
const IngresoRoutes = require("./routes/ingresos.routes");
const GastosRoutes = require("./routes/gastos.routes");

const CajaController = require("./controllers/caja.controller");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/clientes", clientsRoutes);
app.use("/api/prestamos", prestamosRoutes);
app.use("/api/caja", CajaRoutes);
app.use("/api/funcionario", PrestamoFuncionario);
app.use("/api/ingresos", IngresoRoutes);
app.use("/api/gastos", GastosRoutes);

// Programar cierre automático de cajas a medianoche (America/Bogota)
cron.schedule(
  "59 23 * * *",
  async () => {
    console.log(
      "Iniciando cierre automático de cajas a las:",
      moment().tz("America/Bogota").format("YYYY-MM-DD HH:mm:ss")
    );
    try {
      await CajaController.cerrarCajaAutomatica();
      console.log("Cierre automático de cajas completado con éxito.");
    } catch (error) {
      console.error("Error durante el cierre automático de cajas:", error);
    }
  },
  {
    timezone: "America/Bogota",
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

const { crearCaja, obtenerCajaPorUsuarioYFecha, actualizarCaja, obtenerCajasPorRol} = require("../models/caja.models.js"); 
const db = require("../config/db");

const CajaController = {
  async generarCajaDiaria(req, res) {
    try {
      const { id_usuario, fecha } = req.body;
      let caja = await obtenerCajaPorUsuarioYFecha(id_usuario, fecha);

      // Crear si no existe
      if (!caja) {
        const id_caja = await crearCaja(id_usuario, fecha);
        caja = { id_caja, caja_inicial: 0 };
      }

      const id_caja = caja.id_caja;

      // Calcular totales
      const [[{ total_cobrado }]] = await db.execute(
        `SELECT IFNULL(SUM(monto),0) AS total_cobrado 
         FROM cuotas WHERE id_caja = ? AND pagada = 1`,
        [id_caja]
      );

      const [[{ total_prestado }]] = await db.execute(
        `SELECT IFNULL(SUM(valor_prestamo),0) AS total_prestado 
         FROM prestamos_clientes WHERE id_caja = ?`,
        [id_caja]
      );

      const [[{ total_ingresos }]] = await db.execute(
        `SELECT IFNULL(SUM(valor),0) AS total_ingresos 
         FROM ingresos WHERE id_caja = ?`,
        [id_caja]
      );

      const [[{ total_gastos }]] = await db.execute(
        `SELECT IFNULL(SUM(valor),0) AS total_gastos 
         FROM gastos WHERE id_caja = ?`,
        [id_caja]
      );

      // Actualizar caja
      const caja_final =
        Number(caja.caja_inicial) +
        total_cobrado +
        total_ingresos -
        total_gastos;

      await actualizarCaja(id_caja, {
        total_cobrado,
        total_prestado,
        total_ingresos,
        total_gastos,
        caja_final,
      });

      res.json({
        message: "Caja diaria generada/actualizada",
        id_caja,
        total_cobrado,
        total_prestado,
        total_ingresos,
        total_gastos,
        caja_final,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error generando caja diaria" });
    }
  },

  async obtenerCajaPorRol(req, res) {
    try {
      const { id_usuario, rol, fecha } = req.query;
      const cajas = await obtenerCajasPorRol(id_usuario, rol, fecha);
      res.json(cajas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error obteniendo cajas" });
    }
  },

  async cerrarCaja(req, res) {
    try {
      const { id_usuario } = req.user; // desde JWT
      const fechaHoy = new Date().toISOString().split("T")[0];

      const caja = await obtenerCajaPorUsuarioYFecha(id_usuario, fechaHoy);
      if (!caja) {
        return res.status(404).json({ message: "Caja no encontrada" });
      }

      // Calcular caja final por si no está actualizada
      const caja_final =
        Number(caja.caja_inicial) +
        Number(caja.total_cobrado) +
        Number(caja.total_ingresos) -
        Number(caja.total_gastos);

      await actualizarCaja(caja.id_caja, {
        caja_final,
        Estado_caja: 0, // cerrada
      });

      res.json({ message: "Caja cerrada con éxito", caja_final });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al cerrar la caja" });
    }
  },
};

module.exports = CajaController;

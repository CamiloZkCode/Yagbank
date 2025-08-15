const {
  crearCaja,
  obtenerCajaPorUsuarioYFecha,
  actualizarCaja,
  obtenerCajasPorRol,
} = require("../models/caja.models.js");

const db = require("../config/db");

const CajaController = {
  async generarCajaDiaria(req, res) {
    try {
      const { id_usuario, fecha } = req.body;

      // Verificar si ya existe la caja para ese usuario y fecha
      let caja = await obtenerCajaPorUsuarioYFecha(id_usuario, fecha);
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

      const [[{ total_prestado_clientes }]] = await db.execute(
        `SELECT IFNULL(SUM(valor_prestamo),0) AS total_prestado_clientes 
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

      const [[{ total_prestamos_funcionarios }]] = await db.execute(
        `SELECT IFNULL(SUM(monto),0) AS total_prestamos_funcionarios 
         FROM prestamos_funcionarios 
         WHERE id_caja = ? AND estado = 'Aprobado'`,
        [id_caja]
      );

      // Calcular caja final
      const caja_final =
        Number(caja.caja_inicial) + Number(total_cobrado) + Number(total_ingresos) -
        (Number(total_gastos) + Number(total_prestamos_funcionarios) + Number(total_prestado_clientes));

      // Actualizar registro de caja
      await actualizarCaja(id_caja, {
        total_cobrado,
        total_prestado: Number(total_prestado_clientes) + Number(total_prestamos_funcionarios),
        total_ingresos,
        total_gastos: Number(total_gastos),
        caja_final,
      });

      res.json({
        message: "Caja diaria generada/actualizada",
        id_caja,
        total_cobrado,
        total_prestado: total_prestado_clientes + Number(total_prestamos_funcionarios),
        total_ingresos,
        total_gastos: Number(total_gastos),
        total_prestamos_funcionarios,
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

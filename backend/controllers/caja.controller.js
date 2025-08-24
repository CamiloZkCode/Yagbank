const {
  crearCaja,
  obtenerCajaPorUsuarioYFecha,
  actualizarCaja,
  obtenerCajasPorRol,
  verificarCajasDependientes,
  obtenerCajaAnterior,
} = require("../models/caja.models.js");
const db = require("../config/db");

const CajaController = {
  async generarCajaDiaria(req, res, next) {
    try {
      const { id_usuario, fecha } = req.body;
      const rol = req.user?.rol;

      if (!id_usuario || !fecha) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      let caja = await obtenerCajaPorUsuarioYFecha(id_usuario, fecha);
      let caja_inicial = 0;

      if (!caja) {
        // Chequear caja anterior para inicial
        caja_inicial = await obtenerCajaAnterior(id_usuario, fecha);
        const id_caja = await crearCaja(id_usuario, fecha, caja_inicial);
        caja = { id_caja, caja_inicial, Estado_caja: 1 };
      } else {
        caja_inicial = caja.caja_inicial;
      }

      if (caja.Estado_caja === 0) {
        return res
          .status(400)
          .json({ error: "La caja ya está cerrada, no se puede actualizar" });
      }

      const id_caja = caja.id_caja;

      // Nueva sección: Crear cajas para dependientes si rol es superior
      if (rol !== "Asesor") {
        let dependentQuery = "";
        let params = [];

        if (rol === "Administrador") {
          dependentQuery = `
            SELECT u.id_usuario
            FROM usuarios u
            WHERE 
              (u.id_rol = (SELECT id_rol FROM roles WHERE rol = 'Supervisor') AND u.id_administrador = ?)
              OR
              (u.id_rol = (SELECT id_rol FROM roles WHERE rol = 'Asesor') AND u.id_administrador IN (
                SELECT id_usuario FROM usuarios 
                WHERE id_rol = (SELECT id_rol FROM roles WHERE rol = 'Supervisor') 
                AND id_administrador = ?
              ))
          `;
          params = [id_usuario, id_usuario];
        } else if (rol === "Supervisor") {
          dependentQuery = `
            SELECT u.id_usuario
            FROM usuarios u
            WHERE u.id_rol = (SELECT id_rol FROM roles WHERE rol = 'Asesor') 
            AND u.id_administrador = ?
          `;
          params = [id_usuario];
        }

        const [dependents] = await db.execute(dependentQuery, params);

        for (const dep of dependents) {
          const depId = dep.id_usuario;
          let depCaja = await obtenerCajaPorUsuarioYFecha(depId, fecha);
          if (!depCaja) {
            const depInicial = await obtenerCajaAnterior(depId, fecha);
            await crearCaja(depId, fecha, depInicial);
          }
        }
      }

      // Función auxiliar mejorada
      const calcularTotal = async (query, params, defaultValue = 0) => {
        try {
          const [[result]] = await db.execute(query, params);
          return result
            ? Number(Object.values(result)[0]) || defaultValue
            : defaultValue;
        } catch (error) {
          console.warn(
            `Error calculando total (${query.split(" ")[2]}):`,
            error.message
          );
          return defaultValue;
        }
      };

      // Calcular totales
      const [
        total_cobrado,
        total_prestado_clientes,
        total_prestamos_funcionarios,
        total_ingresos,
        total_gastos,
        clavos_dia,
        clientes_clavos_totales,
      ] = await Promise.all([
        calcularTotal(
          `SELECT IFNULL(SUM(monto),0) AS total FROM cuotas WHERE id_caja = ? AND pagada = 1`,
          [id_caja]
        ),
        calcularTotal(
          `SELECT IFNULL(SUM(valor_prestamo),0) AS total FROM prestamos_clientes WHERE id_caja = ?`,
          [id_caja]
        ),
        calcularTotal(
          `SELECT IFNULL(SUM(monto),0) AS total FROM prestamos_funcionarios WHERE id_caja = ? AND estado = 'Aprobado'`,
          [id_caja]
        ),
        calcularTotal(
          `SELECT IFNULL(SUM(valor),0) AS total FROM ingresos WHERE id_caja = ?`,
          [id_caja]
        ),
        calcularTotal(
          `SELECT IFNULL(SUM(valor),0) AS total FROM gastos WHERE id_caja = ?`,
          [id_caja]
        ),
        calcularTotal(
          `SELECT COUNT(*) AS total FROM clientes_clavo WHERE documento_cliente IN 
           (SELECT documento_cliente FROM prestamos_clientes WHERE id_caja = ?)`,
          [id_caja]
        ),
        calcularTotal(`SELECT COUNT(*) AS total FROM clientes_clavo`, []),
      ]);

      const total_prestado =
        Number(total_prestado_clientes) + Number(total_prestamos_funcionarios);
      const caja_final =
        Number(caja.caja_inicial) +
        Number(total_cobrado) +
        Number(total_ingresos) -
        (Number(total_gastos) + Number(total_prestado));

      await actualizarCaja(id_caja, {
        total_cobrado,
        total_prestado,
        total_ingresos,
        total_gastos,
        clavos_dia,
        clientes_clavos_totales,
        caja_final,
        Estado_caja: caja.Estado_caja,
      });

      const responseData = {
        message: "Caja diaria generada/actualizada",
        id_caja,
        id_usuario,
        rol,
        total_cobrado,
        total_prestado,
        total_ingresos,
        total_gastos,
        clavos_dia,
        clientes_clavos_totales,
        caja_final,
        Estado_caja: caja.Estado_caja,
      };

      res.json(responseData);
    } catch (error) {
      next(error);
    }
  },

  async obtenerCajaPorRol(req, res, next) {
    try {
      const { id_usuario, rol, fecha } = req.query;

      if (!id_usuario || !rol || !fecha) {
        return res.status(400).json({ error: "Faltan parámetros requeridos" });
      }

      const caja = await obtenerCajasPorRol(id_usuario, rol, fecha);
      res.json(caja);
    } catch (error) {
      next(error);
    }
  },

  async cerrarCaja(req, res, next) {
    try {
      const { id_usuario, rol } = req.user;
      const fechaHoy = new Date().toISOString().split("T")[0]; // Ahora con TZ fijado

      const cajasAbiertas = await verificarCajasDependientes(
        id_usuario,
        rol,
        fechaHoy
      );

      if (cajasAbiertas.length > 0) {
        return res.status(400).json({
          error: "No se puede cerrar la caja. Hay cajas dependientes abiertas",
          cajasAbiertas: cajasAbiertas.map((c) => ({
            id_usuario: c.id_usuario,
            nombre: c.nombre,
            estado: c.Estado_caja,
          })),
        });
      }
      // 3. Obtener datos consolidados
      const cajaConsolidada = await obtenerCajasPorRol(
        id_usuario,
        rol,
        fechaHoy
      );

      let cajaUsuario = await obtenerCajaPorUsuarioYFecha(id_usuario, fechaHoy);
      if (!cajaUsuario) {
        const id_caja_nueva = await crearCaja(id_usuario, fechaHoy);
        cajaUsuario = { id_caja: id_caja_nueva, Estado_caja: 1 };
      }

      if (cajaUsuario.Estado_caja === 0) {
        return res.status(400).json({ error: "La caja ya está cerrada" });
      }

      // Actualizar con consolidados y cerrar
      await actualizarCaja(cajaUsuario.id_caja, {
        total_cobrado: Number(cajaConsolidada.total_cobrado) || 0,
        total_prestado: Number(cajaConsolidada.total_prestado) || 0,
        total_ingresos: Number(cajaConsolidada.total_ingresos) || 0,
        total_gastos: Number(cajaConsolidada.total_gastos) || 0,
        clavos_dia: Number(cajaConsolidada.clavos_dia) || 0,
        clientes_clavos_totales:
          Number(cajaConsolidada.clientes_clavos_totales) || 0,
        caja_final: Number(cajaConsolidada.caja_final) || 0,
        Estado_caja: 0,
      });

      res.json({
        message: "Caja cerrada con éxito",
        ...cajaConsolidada,
        Estado_caja: 0,
      });
    } catch (error) {
      console.error("Error en cerrarCaja:", error);
      next(error);
    }
  },

  async verificarCajasDependientes(req, res, next) {
    try {
      const { id_usuario, rol } = req.user; // Obtenemos del token, no de query
      const { fecha } = req.query;

      if (!fecha) {
        return res
          .status(400)
          .json({ error: "El parámetro fecha es requerido" });
      }

      const cajasAbiertas = await verificarCajasDependientes(
        id_usuario,
        rol,
        fecha
      );

      res.json({
        cajasAbiertas,
        count: cajasAbiertas.length,
      });
    } catch (error) {
      console.error("Error en verificarCajasDependientes:", error);
      next(error);
    }
  },

  async cerrarCajaAutomatica(req, res, next) {
    try {
      const fechaHoy = new Date().toISOString().split("T")[0];
      // Obtener todas las cajas abiertas del día actual
      const [abiertas] = await db.execute(
        `SELECT c.id_caja, c.id_usuario, r.rol 
         FROM caja c 
         JOIN usuarios u ON c.id_usuario = u.id_usuario
         JOIN roles r ON u.id_rol = r.id_rol
         WHERE c.fecha = ? AND c.Estado_caja = 1`,
        [fechaHoy]
      );

      // Ordenar por rol: Asesores primero, luego Supervisores, Administradores
      const ordenRoles = ["Asesor", "Supervisor", "Administrador"];
      abiertas.sort(
        (a, b) => ordenRoles.indexOf(a.rol) - ordenRoles.indexOf(b.rol)
      );

      // Cerrar cada caja
      for (const caja of abiertas) {
        const cajaConsolidada = await obtenerCajasPorRol(
          caja.id_usuario,
          caja.rol,
          fechaHoy
        );
        await actualizarCaja(caja.id_caja, {
          total_cobrado: Number(cajaConsolidada.total_cobrado) || 0,
          total_prestado: Number(cajaConsolidada.total_prestado) || 0,
          total_ingresos: Number(cajaConsolidada.total_ingresos) || 0,
          total_gastos: Number(cajaConsolidada.total_gastos) || 0,
          clavos_dia: Number(cajaConsolidada.clavos_dia) || 0,
          clientes_clavos_totales:
            Number(cajaConsolidada.clientes_clavos_totales) || 0,
          caja_final: Number(cajaConsolidada.caja_final) || 0,
          Estado_caja: 0,
        });
        console.log(
          `Caja cerrada automáticamente para usuario ${caja.id_usuario} (rol: ${caja.rol})`
        );
      }

      // Si se llama como endpoint, responder
      if (res) {
        res.json({
          message: "Cierre automático de cajas completado",
          closedCount: abiertas.length,
        });
      }
    } catch (error) {
      console.error("Error en cerrarCajaAutomatica:", error);
      if (res) {
        next(error);
      } else {
        throw error; // Para el cron, solo lanzar error para logging
      }
    }
  },
};

module.exports = CajaController;

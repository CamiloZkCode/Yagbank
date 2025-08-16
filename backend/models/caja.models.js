const db = require("../config/db");

const crearCaja = async (id_usuario, fecha, caja_inicial = 0) => {
  const [result] = await db.execute(
    `INSERT INTO caja (
      id_usuario, fecha, caja_inicial, total_cobrado, total_prestado, 
      total_ingresos, total_gastos, clavos_dia, clientes_clavos_totales, Estado_caja
    ) VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 1)`,
    [id_usuario, fecha, caja_inicial]
  );
  return result.insertId;
};

const obtenerCajaPorUsuarioYFecha = async (id_usuario, fecha) => {
  const [rows] = await db.execute(
    `SELECT * FROM caja WHERE id_usuario = ? AND fecha = ?`,
    [id_usuario, fecha]
  );
  return rows[0];
};

const actualizarCaja = async (id_caja, data) => {
  const validFields = {
    total_cobrado: data.total_cobrado ?? null,
    total_prestado: data.total_prestado ?? null,
    total_ingresos: data.total_ingresos ?? null,
    total_gastos: data.total_gastos ?? null,
    clavos_dia: data.clavos_dia ?? null,
    clientes_clavos_totales: data.clientes_clavos_totales ?? null,
    caja_final: data.caja_final ?? null,
    Estado_caja: data.Estado_caja ?? null,
  };

  const keys = Object.keys(validFields).filter((k) => validFields[k] !== null);
  const values = keys.map((k) => validFields[k]);

  if (keys.length === 0) return;

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  await db.execute(`UPDATE caja SET ${setClause} WHERE id_caja = ?`, [
    ...values,
    id_caja,
  ]);
};

const obtenerCajasPorRol = async (id_usuario, rol, fecha) => {
  if (!id_usuario || !rol || !fecha) {
    throw new Error("Faltan parámetros requeridos");
  }

  // Primero, obtener caja propia siempre
  const cajaPropia = (await obtenerCajaPorUsuarioYFecha(id_usuario, fecha)) || {
    caja_inicial: 0,
    caja_final: 0,
    total_cobrado: 0,
    total_prestado: 0,
    total_ingresos: 0,
    total_gastos: 0,
    clavos_dia: 0,
    clientes_clavos_totales: 0,
    Estado_caja: 1, // Default abierto si no existe
  };

  let sums = {
    caja_inicial: 0,
    caja_final: 0,
    total_cobrado: 0,
    total_prestado: 0,
    total_ingresos: 0,
    total_gastos:0,
    clavos_dia: 0,
    clientes_clavos_totales: 0,
  };

  let query = "";
  let params = [];

  if (rol === "Administrador") {
    query = `
      SELECT 
        COALESCE(SUM(c.caja_inicial), 0) AS caja_inicial,
        COALESCE(SUM(c.caja_final), 0) AS caja_final,
        COALESCE(SUM(c.total_cobrado), 0) AS total_cobrado,
        COALESCE(SUM(c.total_prestado), 0) AS total_prestado,
        COALESCE(SUM(c.total_ingresos), 0) AS total_ingresos,
        COALESCE(SUM(c.total_gastos), 0) AS total_gastos,
        COALESCE(SUM(c.clavos_dia), 0) AS clavos_dia,
        MAX(c.clientes_clavos_totales) AS clientes_clavos_totales
      FROM caja c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.fecha = ?
        AND (
          (u.id_rol = (SELECT id_rol FROM roles WHERE rol = 'Supervisor') AND u.id_administrador = ?)
          OR
          (u.id_rol = (SELECT id_rol FROM roles WHERE rol = 'Asesor') AND u.id_administrador IN (
            SELECT id_usuario FROM usuarios 
            WHERE id_rol = (SELECT id_rol FROM roles WHERE rol = 'Supervisor') 
            AND id_administrador = ?
          ))
        );
    `;
    params = [fecha, id_usuario, id_usuario];

    const [sumRows] = await db.execute(query, params);
    sums = sumRows[0] || sums; // Sums de dependientes + propia ya incluida en query
  } else if (rol === "Supervisor") {
    query = `
      SELECT 
        COALESCE(SUM(c.caja_inicial), 0) AS caja_inicial,
        COALESCE(SUM(c.caja_final), 0) AS caja_final,
        COALESCE(SUM(c.total_cobrado), 0) AS total_cobrado,
        COALESCE(SUM(c.total_prestado), 0) AS total_prestado,
        COALESCE(SUM(c.total_ingresos), 0) AS total_ingresos,
        COALESCE(SUM(c.total_gastos), 0) AS total_gastos,
        COALESCE(SUM(c.clavos_dia), 0) AS clavos_dia,
        MAX(c.clientes_clavos_totales) AS clientes_clavos_totales
      FROM caja c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.fecha = ?
       AND u.id_rol = (SELECT id_rol FROM roles WHERE rol = 'Asesor') 
        AND u.id_administrador = ?;
    `;
    params = [fecha, id_usuario];
  }
   if (rol !== "Asesor") {
    const [sumRows] = await db.execute(query, params);
    sums = sumRows[0] || sums;

    sums.caja_inicial = Number(sums.caja_inicial) || 0;
    sums.caja_final = Number(sums.caja_final) || 0;
    sums.total_cobrado = Number(sums.total_cobrado) || 0;
    sums.total_prestado = Number(sums.total_prestado) || 0;
    sums.total_ingresos = Number(sums.total_ingresos) || 0;
    sums.total_gastos = Number(sums.total_gastos) || 0
    sums.clavos_dia = Number(sums.clavos_dia) || 0;
    sums.clientes_clavos_totales = Number(sums.clientes_clavos_totales) || 0;
    
  }// Para asesor, sums ya son de propia


// Combinar con caja propia (sumar, no reemplazar)
  sums.caja_inicial += Number(cajaPropia.caja_inicial) || 0;
  sums.caja_final += Number(cajaPropia.caja_final) || 0;
  sums.total_cobrado += Number(cajaPropia.total_cobrado) || 0;
  sums.total_prestado += Number(cajaPropia.total_prestado) || 0;
  sums.total_ingresos += Number(cajaPropia.total_ingresos) || 0;
  sums.total_gastos += Number(cajaPropia.total_gastos) || 0;
  sums.clavos_dia += Number(cajaPropia.clavos_dia) || 0;
  sums.clientes_clavos_totales = Math.max(
    Number(cajaPropia.clientes_clavos_totales) || 0,
    sums.clientes_clavos_totales || 0
  );

  // Calcular caja_final consolidada
  sums.caja_final = (
    Number(sums.caja_inicial) +
    Number(sums.total_cobrado) +
    Number(sums.total_ingresos) -
    (Number(sums.total_gastos) + Number(sums.total_prestado))
  );

  return {
    fecha,
    ...sums,
    Estado_caja: cajaPropia.Estado_caja,
  };
};

const verificarCajasDependientes = async (id_usuario, rol, fecha) => {
  let query = "";
  let params = [fecha];

  if (rol === "Administrador") {
    query = `
      SELECT c.id_usuario, u.nombre, c.Estado_caja 
      FROM caja c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.fecha = ?
        AND (
          (u.id_rol = (SELECT id_rol FROM roles WHERE rol = 'Supervisor') AND u.id_administrador = ?)
          OR
          (u.id_rol = (SELECT id_rol FROM roles WHERE rol = 'Asesor') AND u.id_administrador IN (
            SELECT id_usuario FROM usuarios 
            WHERE id_rol = (SELECT id_rol FROM roles WHERE rol = 'Supervisor') 
            AND id_administrador = ?
  ))
        )
      AND c.Estado_caja = 1;
    `;
    params.push(id_usuario, id_usuario);
  } else if (rol === "Supervisor") {
    query = `
      SELECT c.id_usuario, u.nombre, c.Estado_caja 
      FROM caja c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.fecha = ?
        AND u.id_rol = (SELECT id_rol FROM roles WHERE rol = 'Asesor') 
        AND u.id_administrador = ?
        AND c.Estado_caja = 1;
       
    `;
    params.push(id_usuario);
  } else {
    return []; // Asesores no tienen dependientes
  }

  const [rows] = await db.execute(query, params);
  return rows;
};

const obtenerCajaAnterior = async (id_usuario, fechaActual) => {
  const fechaAnterior = new Date(fechaActual);
  fechaAnterior.setDate(fechaAnterior.getDate() - 1);
  const fechaAnteriorStr = fechaAnterior.toISOString().split("T")[0];

  const [rows] = await db.execute(
    `SELECT caja_final FROM caja WHERE id_usuario = ? AND fecha = ?`,
    [id_usuario, fechaAnteriorStr]
  );
  return rows[0] ? rows[0].caja_final : 0;
};

module.exports = {
  crearCaja,
  obtenerCajaPorUsuarioYFecha,
  actualizarCaja,
  obtenerCajasPorRol,
  verificarCajasDependientes,
  obtenerCajaAnterior,
};

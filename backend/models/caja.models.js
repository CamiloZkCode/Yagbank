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

  // Caja propia del día (si no existe, usar ceros)
  const propia = (await obtenerCajaPorUsuarioYFecha(id_usuario, fecha)) || {
    caja_inicial: 0,
    caja_final: 0,
    total_cobrado: 0,
    total_prestado: 0,
    total_ingresos: 0,
    total_gastos: 0,
    clavos_dia: 0,
    clientes_clavos_totales: 0,
    Estado_caja: 1,
  };

  // Base dependientes: solo flujos, NO caja_inicial ni caja_final
  let dep = {
    total_cobrado: 0,
    total_prestado: 0,
    total_ingresos: 0,
    total_gastos: 0,
    clavos_dia: 0,
    clientes_clavos_totales: 0,
  };

  let query = "";
  let params = [];

  if (rol === "Administrador") {
    // ⚠️ Solo SUPERVISORES del administrador (no asesores), y solo flujos
    query = `
      SELECT 
        COALESCE(SUM(c.total_cobrado), 0) AS total_cobrado,
        COALESCE(SUM(c.total_prestado), 0) AS total_prestado,
        COALESCE(SUM(c.total_ingresos), 0) AS total_ingresos,
        COALESCE(SUM(c.total_gastos), 0) AS total_gastos,
        COALESCE(SUM(c.clavos_dia), 0) AS clavos_dia,
        MAX(c.clientes_clavos_totales) AS clientes_clavos_totales
      FROM caja c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.fecha = ?
        AND u.id_rol = (SELECT id_rol FROM roles WHERE rol = 'Supervisor')
        AND u.id_administrador = ?;
    `;
    params = [fecha, id_usuario];
  } else if (rol === "Supervisor") {
    // ⚠️ Asesores del supervisor, y solo flujos
    query = `
      SELECT 
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
    const [rows] = await db.execute(query, params);
    const r = rows[0] || {};
    dep.total_cobrado = Number(r.total_cobrado) || 0;
    dep.total_prestado = Number(r.total_prestado) || 0;
    dep.total_ingresos = Number(r.total_ingresos) || 0;
    dep.total_gastos = Number(r.total_gastos) || 0;
    dep.clavos_dia = Number(r.clavos_dia) || 0;
    dep.clientes_clavos_totales = Number(r.clientes_clavos_totales) || 0;
  }

  // Combinar: caja_inicial SOLO la propia. Flujos = propia + dependientes
  const total_cobrado = (Number(propia.total_cobrado) || 0) + dep.total_cobrado;
  const total_prestado =
    (Number(propia.total_prestado) || 0) + dep.total_prestado;
  const total_ingresos =
    (Number(propia.total_ingresos) || 0) + dep.total_ingresos;
  const total_gastos = (Number(propia.total_gastos) || 0) + dep.total_gastos;
  const clavos_dia = (Number(propia.clavos_dia) || 0) + dep.clavos_dia;
  const clientes_clavos_totales = Math.max(
    Number(propia.clientes_clavos_totales) || 0,
    dep.clientes_clavos_totales || 0
  );

  const caja_inicial = Number(propia.caja_inicial) || 0;

  // Recalculamos caja_final a partir de caja_inicial propia + flujos combinados
  const caja_final =
    caja_inicial +
    total_cobrado +
    total_ingresos -
    (total_gastos + total_prestado);

  return {
    fecha,
    caja_inicial,
    caja_final,
    total_cobrado,
    total_prestado,
    total_ingresos,
    total_gastos,
    clavos_dia,
    clientes_clavos_totales,
    Estado_caja: propia.Estado_caja,
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
        AND u.id_rol = (SELECT id_rol FROM roles WHERE rol = 'Supervisor')
        AND u.id_administrador = ?
        AND c.Estado_caja = 1;
    `;
    params.push(id_usuario);
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

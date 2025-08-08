const db = require("../config/db");

const getAllUsuarios = (callback) => {
  db.query("SELECT * FROM usuarios", callback);
};

async function findUserByUsername(username) {
  const [rows] = await db.query("SELECT * FROM usuarios WHERE username = ?", [
    username,
  ]);
  return rows[0];
}

async function getRolById(id_rol) {
  const [rows] = await db.query("SELECT rol FROM roles WHERE id_rol = ?", [
    id_rol,
  ]);
  return rows[0]?.rol;
}



const obtenerSupervisores = async () => {
  const [rows] = await db.query(
    "SELECT id_usuario AS id, nombre FROM usuarios WHERE id_rol = 2"
  );
  return rows;
};

const obtenerUsuariosXSupervisor = async (id_usuario)=>{
  const [rows] = await db.query(
    "SELECT * from usuarios where id_administrador = ?", [
    id_usuario,
  ]);
  return rows;
}

const obtenerUsuariosxAdmin = async (id_admin) => {
  const [rows] = await db.query(
    `
    SELECT 
      u.id_usuario AS id,
      u.nombre,
      u.telefono,
      u.correo,
      u.username,
      r.rol AS cargo,
      -- Estado como booleano y como texto
      u.estado,
      CASE 
        WHEN u.estado = true THEN 'Activo'
        ELSE 'Inactivo'
      END AS estado_texto,
      -- Datos del jefe directo
      jefe.nombre AS nombre_jefe,
      jefe_rol.rol AS cargo_jefe
    FROM usuarios u
    JOIN roles r ON u.id_rol = r.id_rol
    LEFT JOIN usuarios jefe ON u.id_administrador = jefe.id_usuario
    LEFT JOIN roles jefe_rol ON jefe.id_rol = jefe_rol.id_rol
    WHERE 
      -- Supervisores directos del administrador
      (u.id_rol = 2 AND u.id_administrador = ?)
      OR 
      -- Asesores cuyos supervisores reportan al administrador
      (u.id_rol = 3 AND u.id_administrador IN (
        SELECT id_usuario FROM usuarios 
        WHERE id_rol = 2 AND id_administrador = ?
      ))
    `,
    [id_admin, id_admin]
  );
  return rows;
};

module.exports = {
  getAllUsuarios,
  findUserByUsername,
  getRolById,
  obtenerSupervisores,
  obtenerUsuariosxAdmin,
  obtenerUsuariosXSupervisor
};

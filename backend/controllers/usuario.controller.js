const usuariosModel = require("../models/user.models");
const db = require("../config/db");
const bcrypt = require('bcrypt');



//Modificar el estado del usuario
async function cambiarEstadoUsuario(req, res) {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const [existing] = await db.query(
      "SELECT estado FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "El usuario no existe" });
    }

    // Cambiar el estado (toggle)
    await db.query(
      "UPDATE usuarios SET estado = NOT estado WHERE id_usuario = ?",
      [id]
    );

    // Obtener el nuevo estado
    const [updated] = await db.query(
      "SELECT estado FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    const nuevoEstado = updated[0].estado;

    res.status(200).json({
      message: "Estado del usuario cambiado correctamente",
      nuevoEstado: nuevoEstado,
      estadoTexto: nuevoEstado ? "Activo" : "Inactivo",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error del servidor" });
  }
}


//Obtener Supervisores
const getSupervisores = async (req, res) => {
  try {
    const supervisores = await usuariosModel.obtenerSupervisores();
    res.status(200).json(supervisores);
  } catch (error) {
    console.error("Error al obtener supervisores:", error);
    res
      .status(500)
      .json({ mensaje: "Error del servidor al obtener supervisores" });
  }
};

const getUsuariosxSupervisor = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const UsuariosXSupervisor =
      await usuariosModel.obtenerUsuariosXSupervisor(id_usuario);
    res.status(200).json(UsuariosXSupervisor);
  } catch (error) {
    console.error("Error al obtener supervisores:", error);
    res
      .status(500)
      .json({ mensaje: "Error del servidor al obtener supervisores" });
  }
};

const getUsuariosxAdmin = async (req, res) => {
  try {
    const id_administrador = req.user.id_usuario; // <-- ID desde el token JWT
    const UsuariosXAdmin =
      await usuariosModel.obtenerUsuariosxAdmin(id_administrador);
    res.status(200).json(UsuariosXAdmin);
  } catch (error) {
    console.error("Error al obtener lista de usuarios:", error);
    res
      .status(500)
      .json({ mensaje: "Error del servidor al obtener lista de usuarios" });
  }
};

async function EditarUsuario(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }

    const { id } = req.params;
    const { nombre, telefono, correo, id_rol, id_administrador, id_supervisor } = req.body;

    // Verificar si el usuario existe y obtener datos actuales para comparación
    const [existing] = await db.query(
      "SELECT id_usuario, id_rol, id_administrador FROM usuarios WHERE id_usuario = ?",
      [id]
    );
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    const usuarioActual = existing[0];

    // Validar rol nuevo existe
    const [rolExistente] = await db.query("SELECT id_rol FROM roles WHERE id_rol = ?", [id_rol]);
    if (!rolExistente || rolExistente.length === 0) {
      return res.status(400).json({ success: false, message: "El rol especificado no existe" });
    }

    // Logica para asignar id_administrador segun cambio de rol
    let nuevoIdAdministrador = id_administrador || null;

    // Si cambia a supervisor (ejemplo rol=2)
    if (id_rol === 2) {
      // El admin es el usuario logueado
      nuevoIdAdministrador = req.user.id_usuario;
    }
    // Si cambia a asesor (ejemplo rol=3)
    else if (id_rol === 3) {
      if (!id_supervisor) {
        return res.status(400).json({ success: false, message: "Debe especificar el supervisor para un asesor" });
      }
      // Obtener el administrador del supervisor seleccionado
      const [supervisorData] = await db.query(
        "SELECT id_administrador FROM usuarios WHERE id_usuario = ? AND id_rol = 2",
        [id_supervisor]
      );
      if (!supervisorData || supervisorData.length === 0) {
        return res.status(400).json({ success: false, message: "Supervisor no válido" });
      }
      nuevoIdAdministrador = supervisorData[0].id_administrador;
    }
    // Si no hay cambio especial, mantén el id_administrador que viene o el actual
    else {
      nuevoIdAdministrador = id_administrador || usuarioActual.id_administrador;
    }

    // Validar que nuevo administrador exista, si no es null
    if (nuevoIdAdministrador) {
      const [adminExistente] = await db.query(
        "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
        [nuevoIdAdministrador]
      );
      if (!adminExistente || adminExistente.length === 0) {
        return res.status(400).json({ success: false, message: "El administrador especificado no existe" });
      }
    }

    // Actualizar el usuario con nuevo id_administrador
    await db.query(
      `UPDATE usuarios 
         SET nombre = ?, telefono = ?, correo = ?, id_rol = ?, id_administrador = ? 
         WHERE id_usuario = ?`,
      [nombre, telefono, correo, id_rol, nuevoIdAdministrador, id]
    );

    // Devolver usuario actualizado
    const [usuarioActualizado] = await db.query(
      "SELECT id_usuario, nombre, telefono, correo, id_rol, id_administrador FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: usuarioActualizado[0],
    });
  } catch (error) {
    console.error("Error al editar usuario:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico ya está en uso por otro usuario",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al actualizar usuario",
    });
  }
}

const getAsesores = async (req, res) => {
  try {
    const { id_supervisor } = req.body; // o req.params.id si usas GET con :id
    if (!id_supervisor) {
      return res.status(400).json({ mensaje: 'Falta id_supervisor' });
    }
    const asesores = await usuariosModel.obtenerAsesores(id_supervisor);
    res.status(200).json(asesores);
  } catch (error) {
    console.error("Error al obtener asesores:", error);
    res.status(500).json({ mensaje: "Error del servidor al obtener asesores" });
  }
};
async function cambiarContrasena(req, res) {
  try {
    const { nuevaContrasena } = req.body;
    const id_usuario = req.user.id_usuario; // lo sacamos del token

    console.log("ID desde token:", id_usuario);

    if (!nuevaContrasena || nuevaContrasena.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener mínimo 6 caracteres' });
    }

    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

    const [resultado] = await db.query(
      "UPDATE usuarios SET contraseña_hash = ?, debe_cambiar_contrasena = 0 WHERE id_usuario = ?",
      [hashedPassword, id_usuario]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado o no se pudo actualizar' });
    }

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar contraseña' });
  }
}




module.exports = {
  getUsuariosxAdmin,
  getSupervisores,
  getUsuariosxSupervisor,
  cambiarEstadoUsuario,
  EditarUsuario,
  getAsesores,
  cambiarContrasena
};

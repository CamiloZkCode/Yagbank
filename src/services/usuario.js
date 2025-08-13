import API from "@/services/axios";

// Función: Registrar usuario ,accede a ruta en el backend
export async function registrarUsuario(usuario) {
  try {
    const res = await API.post("/usuarios/registrousuario", usuario);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}
//Función : Rellenar tabla en vista administradores , accede a ruta en el backend
export async function creartablaUsuarioXAdministrador(data) {
  try {
    const res = await API.post("/usuarios/cargartablausuarioXadmin", data);
    console.log("Respuesta de /usuarios/adminUsuarios:", res.data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}
//Función : Rellenar tabla en vista supervisores , accede a ruta en el backend
export async function creartablaUsuarioXSupervisor(data) {
  try {
    const res = await API.post("/usuarios/cargartablausuarioXsupervisor", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

// Función: Obtener supervisores
export async function obtenerSupervisores() {
  try {
    const res = await API.get("/usuarios/supervisores");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}
//Funcion: Obtener asesores
export async function obtenerAsesores(id_supervisor) {
  try {
    const res = await API.post("/usuarios/asesores",{ id_supervisor });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

//Función : Metodo para cambiar el estado del usuario activo/desactivo
export async function cambiarEstado(id) {
  try {
    const res = await API.post(`/usuarios/${id}/estado`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

//Funcion : Metodo para editar el usuario
export async function EditarUsuario(id, datosActualizados) {
  try {
    const res = await API.post(`/usuarios/${id}/editar`, datosActualizados);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function cambiarContrasena(datos) {
  try {
    const res = await API.post('/auth/actualizarContrasena', datos);
    return res.data;
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    throw error.response?.data || { message: "Error de conexión" };
  }
}
const usuariosModel = require('../models/user.models');
const db = require('../config/db');


const getAsesores = async (req, res) => {
  try {
    const { id_supervisor } = req.body; 
    if (!id_supervisor) {
      return res.status(400).json({ mensaje: "Falta el id del supervisor" });
    }

    const asesores = await usuariosModel.obtenerAsesores(id_supervisor);
    res.status(200).json(asesores);
  } catch (error) {
    console.error('Error al obtener asesores:', error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener asesores' });
  }
};


async function crearRuta(req, res) {
    try {
        const {id_ruta, id_asesor ,nombre_ruta  } = req.body;

        if (!id_ruta || !id_asesor|| !nombre_ruta) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        db.query(
            "INSERT INTO rutas (id_ruta,id_asesor,nombre_ruta) VALUES (?, ?, ?)",
            [id_ruta,id_asesor,nombre_ruta],
            (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({ message: "Ruta creada con éxito", id: result.insertId });
                }
            }
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAsesores,
    crearRuta
};
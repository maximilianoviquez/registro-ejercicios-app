import axios from "axios";

const API_URL = "https://movetrack.develotion.com/";

// obtengo los registros del usuario
const obtenerRegistros = async (token, idUser) => {
  try {
    const response = await axios.get(`${API_URL}registros.php?idUsuario=${idUser}`, {
      headers: { apikey: token, iduser: idUser },
    });

    return response.data;
  } catch (error) {
    console.error("Error obteniendo registros:", error);
    throw error;
  }
};

// agrego un registro
const agregarRegistro = async (token, idUser, registroData) => {
  try {
    const requestBody = {
      idActividad: Number(registroData.idActividad),
      tiempo: registroData.tiempo,
      fecha: registroData.fecha,
      idUsuario: idUser,
    };

    const response = await axios.post(`${API_URL}registros.php`, requestBody, {
      headers: { "Content-Type": "application/json", apikey: token, iduser: idUser },
    });

    return response.data;
  } catch (error) {
    console.error("Error al agregar registro:", error);
    throw error;
  }
};

// elimino un registro
const eliminarRegistro = async (token, idUser, id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error("ID inválido.");
    }

    const response = await axios.delete(`${API_URL}registros.php?idRegistro=${id}`, {
      headers: { "Content-Type": "application/json", apikey: token, iduser: idUser },
    });

    return id;
  } catch (error) {
    console.error("Error al eliminar registro:", error);
    throw error;
  }
};

const registroService = { obtenerRegistros, agregarRegistro, eliminarRegistro };

export default registroService;
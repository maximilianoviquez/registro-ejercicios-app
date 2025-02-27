import axios from "axios";

const API_URL = "https://movetrack.develotion.com/";

// registro del usuario
const registro = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}usuarios.php`, userData);
        if (response.data) {
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        console.error("Error en el registro:", error);
        throw error;
    }
};

// login del usuario
const login = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}login.php`, userData);
        if (response.data) {
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        console.error("Error en el login:", error);
        throw error;
    }
};

// cerrar sesionn
const logout = () => {
    localStorage.removeItem("user");
};

const authService = {
    registro,
    login,
    logout,
};

export default authService;
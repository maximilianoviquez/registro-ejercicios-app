import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registro, reset } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import "../styles/main.css";
import fondoRegistro from "../assets/fondo15.jpg";

const API_URL_PAISES = "https://movetrack.develotion.com/paises.php";

const Registro = () => {
  const [formData, setFormData] = useState({
    usuario: "",
    password: "",
    idPais: "",
  });

  const [error, setError] = useState("");
  const [paises, setPaises] = useState([]);
  const { usuario, password, idPais } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess) {
      navigate("/dashboard");
      dispatch(reset());
    }
  }, [isSuccess, navigate, dispatch]);

  useEffect(() => {
    const obtenerPaises = async () => {
      try {
        const response = await axios.get(API_URL_PAISES);
        setPaises(response.data.paises || []);
      } catch (error) {
        console.error("Error al obtener países:", error);
      }
    };
    obtenerPaises();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validarDatos = () => {
    if (usuario.trim().length < 6) {
      setError("El usuario debe tener al menos 6 caracteres.");
      return false;
    }
    if (password.trim().length < 6 || !/[A-Z]/.test(password)) {
      setError("La contraseña debe tener al menos 6 caracteres y una mayúscula.");
      return false;
    }
    if (!idPais) {
      setError("Debe seleccionar un país.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarDatos()) return;
    dispatch(registro(formData));
  };

  return (
    <div className="auth-container" style={{ backgroundImage: `url(${fondoRegistro})` }}>
      <Card className="auth-card">
        <Card.Body>
          <h2 className="text-center mb-4">📝 Registro</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>👤 Usuario</Form.Label>
              <Form.Control
                type="text"
                name="usuario"
                value={usuario}
                onChange={handleChange}
                placeholder="Ingrese su usuario"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>🔒 Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Ingrese su contraseña"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>🌍 País</Form.Label>
              <Form.Select name="idPais" value={idPais} onChange={handleChange} required>
                <option value="">Seleccione un país</option>
                {paises.map((pais) => (
                  <option key={pais.id} value={pais.id}>{pais.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button type="submit" className="w-100 btn-primary" disabled={isLoading}>
              {isLoading ? <Spinner as="span" animation="border" size="sm" /> : "Registrarse"}
            </Button>
          </Form>

          {error && <Alert variant="danger" className="mt-3 text-center">{error}</Alert>}
          {isError && <Alert variant="danger" className="mt-3 text-center">{message}</Alert>}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Registro;
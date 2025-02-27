import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, reset } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import "../styles/main.css";
// ruta para la imagen de fondo
import fondoLogin from "../assets/fondo10.jpg";

const Login = () => {
  const [formData, setFormData] = useState({
    usuario: "",
    password: "",
  });

  const { usuario, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message, user } = useSelector((state) => state.auth);

  // validoo
  const esUsuarioValido = usuario.trim().length >= 6;
  const esPasswordValida = password.trim().length >= 6 && /[A-Z]/.test(password);
  const formularioValido = esUsuarioValido && esPasswordValida;

  useEffect(() => {
    if (isSuccess || user) {
      navigate("/dashboard");
    }

    return () => {
      dispatch(reset());
    };
  }, [isSuccess, user, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formularioValido) {
      dispatch(login(formData));
    }
  };

  return (
    <div className="auth-container" style={{ backgroundImage: `url(${fondoLogin})` }}>
      <Card className="auth-card">
        <Card.Body>
          <h2 className="text-center mb-4">🔑 Iniciar Sesión</h2>
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

            <Button type="submit" className="w-100 btn-primary" disabled={!formularioValido || isLoading}>
              {isLoading ? <Spinner as="span" animation="border" size="sm" /> : "Ingresar"}
            </Button>
          </Form>

          {isError && <Alert variant="danger" className="mt-3">{message}</Alert>}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { obtenerRegistros, agregarRegistro, eliminarRegistro } from "../features/registros/registroSlice";
import axios from "axios";
import { Container, Form, Button, Table, Card, Alert, Spinner, Row, Col } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import InformeTiempo from "../components/InformeTiempo";
import EvolucionPersonal from "../components/EvolucionPersonal";
import "../styles/main.css";

const API_URL = "https://movetrack.develotion.com/";
const IMG_URL = "https://movetrack.develotion.com/imgs/";


const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { registros } = useSelector((state) => state.registros);

    const [actividadSeleccionada, setActividadSeleccionada] = useState("");
    const [tiempo, setTiempo] = useState("");
    const [fecha, setFecha] = useState("");
    const [actividades, setActividades] = useState([]);
    const [filtro, setFiltro] = useState("todos");
    const [loading, setLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null);


    useEffect(() => {
        if (user) {
            dispatch(obtenerRegistros({ token: user.apiKey, idUser: user.id }));

            axios
                .get(`${API_URL}actividades.php`, {
                    headers: { apikey: user.apiKey, iduser: user.id },
                })
                .then((response) => {
                    if (response.data && response.data.actividades) {
                        setActividades(response.data.actividades);
                    }
                })
                .catch((error) => console.error("Error al obtener actividades:", error));
        }
    }, [dispatch, user]);

    useEffect(() => {
        dispatch(obtenerRegistros({ token: user.apiKey, idUser: user.id }));
    }, [dispatch, user]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (actividadSeleccionada && tiempo && fecha) {
            setLoading(true);

            const nuevoRegistro = await dispatch(
                agregarRegistro({
                    token: user.apiKey,
                    idUser: user.id,
                    registroData: { idActividad: actividadSeleccionada, tiempo, fecha },
                })
            );

            //actualizo los registros en tiempo real
            if (nuevoRegistro.payload) {
                dispatch(obtenerRegistros({ token: user.apiKey, idUser: user.id }));
            }

            setLoading(false);
            setActividadSeleccionada("");
            setTiempo("");
            setFecha("");
        }
    };

    const handleDelete = async (id) => {
        if (!id) {
            console.error("Error: id no válido.", id);
            return;
        }

        console.log(`Eliminando registro con id: ${id}`);
        setLoadingId(id);

        await dispatch(eliminarRegistro({ token: user.apiKey, idUser: user.id, idRegistro: id }));

        //actualzo en tiempo real
        dispatch(obtenerRegistros({ token: user.apiKey, idUser: user.id }));

        setLoadingId(null);
    };

    const filtrarRegistros = () => {
        if (!registros || registros.length === 0) return [];

        const hoy = new Date();
        const mesActual = hoy.getMonth(); //aca agarro el mes actual (0 = enero, 11 = diciembre)
        const anioActual = hoy.getFullYear(); //obtengo el anio actual

        return registros.filter((reg) => {
            const fechaRegistro = new Date(reg.fecha);
            const mesRegistro = fechaRegistro.getMonth();
            const anioRegistro = fechaRegistro.getFullYear();

            if (filtro === "semana") {
                const semanaAtras = new Date();
                semanaAtras.setDate(hoy.getDate() - 7);
                return fechaRegistro >= semanaAtras;
            } else if (filtro === "mes") {
                // solo los registros del mismo mes y anioo actual
                return mesRegistro === mesActual && anioRegistro === anioActual;
            }
            return true;
        });
    };

    const obtenerActividad = (idActividad) => {
        return actividades.find((a) => Number(a.id) === Number(idActividad)) || {};
    };

    // muestro el nombre de la actividad en la grafica de sesiones por actividad
    const datosSesionesPorActividad = registros.reduce((acc, reg) => {
        const actividad = obtenerActividad(reg.idActividad);
        if (!actividad.nombre) return acc;

        const index = acc.findIndex((item) => item.actividad === actividad.nombre);
        if (index !== -1) {
            acc[index].sesiones += 1;
        } else {
            acc.push({ actividad: actividad.nombre, sesiones: 1 });
        }
        return acc;
    }, []);

    const obtenerUltimos7Dias = () => {
        const hoy = new Date();
        const dias = [];
        for (let i = 6; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() - i);
            const fechaFormateada = fecha.toISOString().split("T")[0]; //formato y-m-d
            dias.push(fechaFormateada);
        }
        return dias;
    };

    const calcularMinutosPorDia = () => {
        const diasUltimaSemana = obtenerUltimos7Dias();
        const sumaMinutos = {};

        diasUltimaSemana.forEach((dia) => {
            sumaMinutos[dia] = 0;
        });

        registros.forEach((reg) => {
            if (diasUltimaSemana.includes(reg.fecha)) {
                sumaMinutos[reg.fecha] += Number(reg.tiempo);
            }
        });

        return diasUltimaSemana.map((fecha) => ({
            fecha,
            minutos: sumaMinutos[fecha] || 0,
        }));
    };

    const datosMinutosUltimos7Dias = calcularMinutosPorDia();

    return (
        <Container className="my-4">
            <h1 className="text-center mb-4">📊 Dashboard</h1>

            <Card className="p-4 shadow">
                <h4 className="mb-3">Agregar Registro</h4>
                <Form onSubmit={onSubmit}>
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Seleccionar Actividad</Form.Label>
                                <Form.Select value={actividadSeleccionada} onChange={(e) => setActividadSeleccionada(e.target.value)} required>
                                    <option value="">Seleccionar Actividad</option>
                                    {actividades.map((actividad) => (
                                        <option key={actividad.id} value={actividad.id}>
                                            {actividad.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Tiempo (min)</Form.Label>
                                <Form.Control type="number" placeholder="Tiempo en minutos" value={tiempo} onChange={(e) => setTiempo(e.target.value)} required />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Fecha</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    required
                                    max={new Date().toISOString().split("T")[0]} //pongo la seleccion hasta hoy, no deja dias osteriores
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button type="submit" className="w-100" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : "Agregar Registro"}
                    </Button>
                </Form>
            </Card>
            <h4 className="mt-5">Filtrar Registros</h4>
            <Form.Select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="mb-3">
                <option value="todos">Todos</option>
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mes</option>
            </Form.Select>


            <h4 className="mt-5">Lista de Actividades Registradas</h4>
            {registros.length > 0 ? (
                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                        <tr>
                            <th>Ícono</th>
                            <th>Actividad</th>
                            <th>Tiempo</th>
                            <th>Fecha</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrarRegistros().map((reg) => {
                            const actividad = obtenerActividad(reg.idActividad);
                            return (
                                <tr key={reg.id}>
                                    <td>
                                        {actividad.imagen ? <img src={`${IMG_URL}${actividad.imagen}.png`} alt={actividad.nombre} width="40" /> : "Cargando..."}
                                    </td>
                                    <td>{actividad.nombre || "Desconocida"}</td>
                                    <td>{reg.tiempo} min</td>
                                    <td>{reg.fecha}</td>
                                    <td>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(reg.id)} disabled={loadingId === reg.id}>
                                            {loadingId === reg.id ? <Spinner animation="border" size="sm" /> : "Eliminar"}
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            ) : (
                <Alert variant="warning">No hay registros guardados.</Alert>
            )}

            <h1 className="text-center mb-4">📊 Dashboard</h1>


            <Row className="mb-4">
                <Col md={6}>
                    <InformeTiempo registros={registros} />
                </Col>
                <Col md={6}>
                    <EvolucionPersonal registros={registros} />
                </Col>
            </Row>



            <h4 className="mt-5 text-center">📊 Sesiones por Actividad</h4>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={datosSesionesPorActividad} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis dataKey="actividad" tick={{ fontSize: 14 }} />
                    <YAxis tick={{ fontSize: 14 }} />
                    <Tooltip />
                    <Bar dataKey="sesiones" fill="#007bff" barSize={50} animationDuration={1000} />
                </BarChart>
            </ResponsiveContainer>


            <h4 className="mt-5 text-center">📈 Minutos ejercitados en los últimos 7 días</h4>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={datosMinutosUltimos7Dias} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis dataKey="fecha" tick={{ fontSize: 14 }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 14 }} />
                    <Tooltip formatter={(value) => [`${value} minutos`, "Minutos"]} />
                    <Line
                        type="monotone"
                        dataKey="minutos"
                        stroke="#FF5733"
                        strokeWidth={3}
                        dot={{ fill: "#FF5733", stroke: "#FF5733", strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 8 }}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Container>
    );
};

export default Dashboard;
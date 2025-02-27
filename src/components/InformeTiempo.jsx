import React from "react";
import { Card } from "react-bootstrap";

const InformeTiempo = ({ registros }) => {
    const hoy = new Date().toISOString().split("T")[0]; //fecha de hoy en y-m-d

    // tiempo total que acumulo en todas las sesiones
    const tiempoTotal = registros.reduce((total, reg) => total + Number(reg.tiempo), 0);

    // tiempo registrado hoy
    const tiempoHoy = registros
        .filter((reg) => reg.fecha === hoy)
        .reduce((total, reg) => total + Number(reg.tiempo), 0);

    return (
        <Card className="p-3 shadow">
            <h4>📊 Informe de Tiempo</h4>
            <p><strong>⏳ Tiempo Total:</strong> {tiempoTotal} minutos</p>
            <p><strong>📅 Tiempo de Hoy:</strong> {tiempoHoy} minutos</p>
        </Card>
    );
};

export default InformeTiempo;
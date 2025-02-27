import React from "react";
import { Card } from "react-bootstrap";

const EvolucionPersonal = ({ registros }) => {
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    const fechaHoy = hoy.toISOString().split("T")[0];
    const fechaAyer = ayer.toISOString().split("T")[0];

    // tiempo que registro hoy
    const tiempoHoy = registros
        .filter((reg) => reg.fecha === fechaHoy)
        .reduce((total, reg) => total + Number(reg.tiempo), 0);

    // tiempo que registro ayer
    const tiempoAyer = registros
        .filter((reg) => reg.fecha === fechaAyer)
        .reduce((total, reg) => total + Number(reg.tiempo), 0);

    // tiro la frase motivadora
    const mensaje = tiempoHoy > tiempoAyer ? "¡Bien hecho! 👏" : "¡Que no decaiga! 💪";

    return (
        <Card className="p-3 shadow text-center">
            <h4>📈 Evolución Personal</h4>
            <p>{mensaje}</p>
        </Card>
    );
};

export default EvolucionPersonal;
import { useState } from "react";

export default function RuletaVisual({ premios = [] }) {
  const [girando, setGirando] = useState(false);
  const [rotacion, setRotacion] = useState(0);
  const [premioGanado, setPremioGanado] = useState(null);

  const premiosActivos = premios.filter((premio) => premio.activo);

  function girarRuleta() {
    if (girando || premiosActivos.length === 0) return;

    setGirando(true);
    setPremioGanado(null);

    const indiceGanador = Math.floor(Math.random() * premiosActivos.length);
    const gradosPorPremio = 360 / premiosActivos.length;
    const vueltas = 360 * 6;
    const nuevaRotacion =
      rotacion + vueltas + 360 - indiceGanador * gradosPorPremio;

    setRotacion(nuevaRotacion);

    setTimeout(() => {
      setPremioGanado(premiosActivos[indiceGanador]);
      setGirando(false);
    }, 4200);
  }

  if (premiosActivos.length === 0) {
    return (
      <div style={contenedor}>
        <p style={texto}>No hay premios activos para mostrar en la ruleta.</p>
      </div>
    );
  }

  return (
    <div style={contenedor}>
      <div style={puntero}>▼</div>

      <div
        style={{
          ...ruleta,
          transform: `rotate(${rotacion}deg)`,
          transition: girando
            ? "transform 4.2s cubic-bezier(0.12, 0.75, 0.18, 1)"
            : "none",
          background: crearConicGradient(premiosActivos),
        }}
      >
        {premiosActivos.map((premio, index) => (
          <div
            key={premio.id}
            style={{
              ...textoPremio,
              transform: `rotate(${
                (360 / premiosActivos.length) * index +
                360 / premiosActivos.length / 2
              }deg)`,
            }}
          >
            <span>{premio.nombre}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        style={boton}
        onClick={girarRuleta}
        disabled={girando}
      >
        {girando ? "Girando..." : "Girar ruleta"}
      </button>

      {premioGanado && (
        <div style={resultado}>
          🎉 Premio: <strong>{premioGanado.nombre}</strong>
        </div>
      )}
    </div>
  );
}

function crearConicGradient(premios) {
  const grados = 360 / premios.length;

  return `conic-gradient(${premios
    .map((premio, index) => {
      const inicio = index * grados;
      const fin = inicio + grados;
      return `${premio.color || "#f59e0b"} ${inicio}deg ${fin}deg`;
    })
    .join(", ")})`;
}

const contenedor = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "18px",
  padding: "24px",
};

const puntero = {
  fontSize: "34px",
  color: "#dc2626",
  zIndex: 2,
  marginBottom: "-18px",
};

const ruleta = {
  width: "320px",
  height: "320px",
  borderRadius: "50%",
  border: "8px solid #111827",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
};

const textoPremio = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "45%",
  transformOrigin: "0 0",
  fontSize: "12px",
  fontWeight: "800",
  color: "#111827",
};

const boton = {
  border: "none",
  background: "#dc2626",
  color: "#ffffff",
  borderRadius: "999px",
  padding: "12px 24px",
  fontSize: "16px",
  fontWeight: "800",
  cursor: "pointer",
};

const resultado = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "14px 18px",
  fontSize: "18px",
  color: "#111827",
};

const texto = {
  color: "#6b7280",
  fontSize: "15px",
};

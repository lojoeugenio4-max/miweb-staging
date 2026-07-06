import { useMemo } from "react";

export default function RuletaVisual({
  premios = [],
  onPremioGanado,
  girando = false,
}) {
  const premiosActivos = useMemo(
    () => premios.filter((p) => p.activo !== false),
    [premios]
  );

  function girar() {
    if (girando) return;
    if (!premiosActivos.length) return;

    const total = premiosActivos.reduce(
      (t, p) => t + Number(p.probabilidad || 0),
      0
    );

    let random = Math.random() * total;

    for (const premio of premiosActivos) {
      random -= Number(premio.probabilidad || 0);

      if (random <= 0) {
        onPremioGanado?.(premio);
        return;
      }
    }

    onPremioGanado?.(premiosActivos[0]);
  }

  return (
    <div style={contenedor}>
      <button style={boton} onClick={girar}>
        🎡 GIRAR RULETA
      </button>

      <div style={lista}>
        {premiosActivos.map((premio) => (
          <div
            key={premio.id}
            style={{
              ...premioItem,
              borderLeft: `10px solid ${premio.color}`,
            }}
          >
            <img
              src={premio.imagen_url}
              alt={premio.nombre}
              style={imagen}
            />

            <div style={{ flex: 1 }}>
              <strong>{premio.nombre}</strong>

              <div style={probabilidad}>
                {premio.probabilidad}% · Stock {premio.stock ?? "∞"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const contenedor = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const boton = {
  border: 0,
  borderRadius: 14,
  background: "#f59e0b",
  color: "#fff",
  fontSize: 22,
  fontWeight: 700,
  padding: "16px",
  cursor: "pointer",
};

const lista = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const premioItem = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
};

const imagen = {
  width: 60,
  height: 60,
  objectFit: "cover",
  borderRadius: 10,
};

const probabilidad = {
  marginTop: 4,
  color: "#64748b",
  fontSize: 13,
};

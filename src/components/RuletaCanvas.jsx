import { crearGradient } from "./RuletaHelpers";

export default function RuletaCanvas({
  premios = [],
  rotacion = 0,
  girando = false,
}) {
  if (!premios.length) return null;

  const gradosSector = 360 / premios.length;

  return (
    <div style={contenedor}>
      <div style={puntero}>▼</div>

      <div
        style={{
          ...ruleta,
          transform: `rotate(${rotacion}deg)`,
          transition: girando
            ? "transform 5.5s cubic-bezier(.17,.89,.32,1)"
            : "none",
          background: crearGradient(premios),
        }}
      >
        {premios.map((premio, index) => (
          <div
            key={premio.id}
            style={{
              ...sector,
              transform: `rotate(${
                index * gradosSector + gradosSector / 2
              }deg)`,
            }}
          >
            <div style={texto}>
              {premio.nombre}
            </div>
          </div>
        ))}

        <div style={centro}>
          <div style={botonCentro} />
        </div>
      </div>
    </div>
  );
}

const contenedor = {
  position: "relative",
  width: 360,
  maxWidth: "100%",
  margin: "0 auto",
};

const puntero = {
  position: "absolute",
  left: "50%",
  top: -18,
  transform: "translateX(-50%)",
  fontSize: 42,
  zIndex: 20,
  color: "#dc2626",
};

const ruleta = {
  position: "relative",
  width: 360,
  height: 360,
  maxWidth: "100%",
  aspectRatio: "1",
  borderRadius: "50%",
  border: "10px solid #111827",
  overflow: "hidden",
  boxShadow:
    "0 30px 60px rgba(0,0,0,.35)",
};

const sector = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "50%",
  height: 0,
  transformOrigin: "0 0",
};

const texto = {
  position: "absolute",
  left: 18,
  top: -10,
  width: "82%",
  textAlign: "right",
  fontSize: 13,
  fontWeight: 800,
  color: "#111827",
  textShadow: "0 1px 2px rgba(255,255,255,.8)",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

const centro = {
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%,-50%)",
};

const botonCentro = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: "#111827",
  border: "6px solid white",
  boxShadow: "0 0 12px rgba(0,0,0,.35)",
};

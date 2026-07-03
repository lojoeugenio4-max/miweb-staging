import RuletaVisual from "./RuletaVisual";

export default function RuletaModal({
  premios,
  resumenPromocion,
  mensajeCliente,
  onPremioGanado,
}) {
  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={cabecera}>
          <div style={icono}>🎡</div>

          <h2 style={titulo}>¡Tu pedido participa en la ruleta!</h2>

          <p style={texto}>
            {mensajeCliente || "Gira la ruleta y descubre tu premio."}
          </p>

          {resumenPromocion && (
            <div style={resumen}>
              Has acumulado{" "}
              <strong>{resumenPromocion.cajasValidas}</strong> cajas válidas.
            </div>
          )}
        </div>

        <RuletaVisual
          premios={premios}
          onPremioGanado={onPremioGanado}
        />
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 99999,
  background:
    "radial-gradient(circle at top, rgba(37,99,235,0.35), rgba(15,23,42,0.92))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px",
};

const panel = {
  width: "min(620px, 100%)",
  maxHeight: "94dvh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "24px",
  padding: "22px",
  textAlign: "center",
  boxShadow: "0 30px 90px rgba(0,0,0,0.4)",
};

const cabecera = {
  marginBottom: "10px",
};

const icono = {
  fontSize: "42px",
  marginBottom: "4px",
};

const titulo = {
  margin: "0 0 8px",
  fontSize: "25px",
  lineHeight: 1.15,
  color: "#111827",
};

const texto = {
  margin: "0 0 10px",
  color: "#475569",
  fontSize: "16px",
};

const resumen = {
  display: "inline-block",
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  color: "#166534",
  borderRadius: "999px",
  padding: "8px 12px",
  fontSize: "14px",
  fontWeight: "700",
};

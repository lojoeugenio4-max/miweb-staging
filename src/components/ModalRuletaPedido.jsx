import RuletaVisual from "./RuletaVisual";

export default function ModalRuletaPedido({
  premios,
  resumenPromocion,
  onPremioGanado,
  onCerrar,
}) {
  return (
    <div style={overlay}>
      <div style={panel}>
        <button type="button" style={cerrar} onClick={onCerrar}>
          ×
        </button>

        <h2 style={titulo}>🎡 ¡Tu pedido participa en la ruleta!</h2>

        <p style={texto}>
          Has comprado <strong>{resumenPromocion.cajasValidas}</strong> cajas
          válidas para esta promoción.
        </p>

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
  background: "rgba(15, 23, 42, 0.75)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};

const panel = {
  width: "min(560px, 100%)",
  maxHeight: "92dvh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "22px",
  padding: "22px",
  position: "relative",
  textAlign: "center",
  boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
};

const cerrar = {
  position: "absolute",
  right: "14px",
  top: "10px",
  border: "none",
  background: "transparent",
  fontSize: "30px",
  cursor: "pointer",
  color: "#64748b",
};

const titulo = {
  margin: "8px 0 10px",
  fontSize: "26px",
  color: "#111827",
};

const texto = {
  margin: "0 0 14px",
  color: "#475569",
  fontSize: "16px",
};

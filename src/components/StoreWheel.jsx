import { useMemo } from "react";

export default function StoreWheel({ premios, girando, premioFinal, onGirar }) {
  const segmentos = useMemo(() => {
    const lista = premios.length ? premios : [{ nombre: "Sin premios" }];
    const grados = 360 / lista.length;

    return lista.map((premio, index) => {
      const start = index * grados;
      const end = start + grados;

      return {
        premio,
        color: index % 2 === 0 ? "#facc15" : "#ef4444",
        start,
        end,
      };
    });
  }, [premios]);

  const conic = segmentos
    .map((seg) => `${seg.color} ${seg.start}deg ${seg.end}deg`)
    .join(", ");

  return (
    <div style={styles.wrap}>
      <div style={styles.pointer}>▼</div>

      <div
        style={{
          ...styles.wheel,
          background: `conic-gradient(${conic})`,
          transform: girando ? "rotate(2520deg)" : "rotate(0deg)",
          transition: girando
            ? "transform 3.8s cubic-bezier(.08,.72,.12,1)"
            : "none",
        }}
      >
        <div style={styles.center}>LOJO</div>
      </div>

      {!premioFinal && (
        <button
          type="button"
          onClick={onGirar}
          disabled={girando || premios.length === 0}
          style={styles.button}
        >
          GIRAR RULETA
        </button>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
  },
  pointer: {
    color: "#facc15",
    fontSize: 42,
    lineHeight: 1,
    textShadow: "0 4px 14px rgba(0,0,0,.6)",
    marginBottom: -18,
    zIndex: 2,
  },
  wheel: {
    width: "min(58vh, 560px)",
    height: "min(58vh, 560px)",
    borderRadius: "50%",
    border: "16px solid #ffffff",
    boxShadow:
      "0 30px 90px rgba(0,0,0,.5), inset 0 0 0 8px rgba(0,0,0,.15)",
    position: "relative",
  },
  center: {
    position: "absolute",
    inset: "34%",
    borderRadius: "50%",
    background: "#0b1185",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 1000,
    fontSize: 38,
    border: "8px solid white",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
  },
  button: {
    border: "none",
    borderRadius: 999,
    padding: "24px 46px",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#ffffff",
    fontSize: 28,
    fontWeight: 1000,
    cursor: "pointer",
    boxShadow: "0 18px 40px rgba(34,197,94,.35)",
  },
};

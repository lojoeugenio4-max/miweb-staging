import { useMemo } from "react";

export default function StoreWheel({ premios = [], girando, premioFinal, onGirar }) {
  const segmentos = useMemo(() => {
    const lista = premios.length ? premios : Array.from({ length: 12 }, (_, index) => ({ id: index }));
    const grados = 360 / lista.length;
    const colores = ["#facc15", "#ef4444", "#111827", "#f97316"];

    return lista.map((premio, index) => ({
      premio,
      color: colores[index % colores.length],
      start: index * grados,
      end: index * grados + grados,
      icono: ["?", "★", "🎁", "♦"][index % 4],
    }));
  }, [premios]);

  const conic = segmentos
    .map((seg) => `${seg.color} ${seg.start}deg ${seg.end}deg`)
    .join(", ");

  return (
    <div style={styles.wrap}>
      <div style={styles.machineTop}>🎰 CASH LOJO 🎰</div>
      <div style={styles.pointer}>▼</div>

      <div style={styles.wheelFrame}>
        <div
          style={{
            ...styles.wheel,
            background: `conic-gradient(${conic})`,
            transform: girando ? "rotate(2880deg)" : "rotate(0deg)",
            transition: girando
              ? "transform 4.2s cubic-bezier(.08,.72,.12,1)"
              : "none",
          }}
        >
          {segmentos.map((segmento, index) => (
            <div
              key={index}
              style={{
                ...styles.segmentIcon,
                transform: `rotate(${segmento.start + (segmento.end - segmento.start) / 2}deg) translateY(calc(var(--wheel-size) * -0.29))`,
              }}
            >
              <span
                style={{
                  transform: `rotate(-${segmento.start + (segmento.end - segmento.start) / 2}deg)`,
                }}
              >
                {segmento.icono}
              </span>
            </div>
          ))}

          <div style={styles.center}>LOJO</div>
        </div>
      </div>

      {!premioFinal && (
        <button
          type="button"
          onClick={onGirar}
          disabled={girando || premios.length === 0}
          style={{
            ...styles.button,
            opacity: girando || premios.length === 0 ? 0.55 : 1,
            cursor: girando || premios.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {girando ? "GIRANDO..." : "GIRAR RULETA"}
        </button>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    "--wheel-size": "min(50vh, 42vw, 430px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "clamp(8px, 1.5vh, 15px)",
  },
  machineTop: {
    color: "#facc15",
    fontSize: "clamp(20px, 3vw, 34px)",
    fontWeight: 1000,
    letterSpacing: "0.04em",
    textShadow: "0 6px 20px rgba(0,0,0,.75)",
    lineHeight: 1,
  },
  pointer: {
    color: "#ffffff",
    fontSize: "clamp(28px, 5vh, 42px)",
    lineHeight: 1,
    textShadow: "0 4px 14px rgba(0,0,0,.8)",
    marginBottom: "clamp(-18px, -2vh, -10px)",
    zIndex: 5,
  },
  wheelFrame: {
    position: "relative",
    width: "var(--wheel-size)",
    height: "var(--wheel-size)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle, #ffffff 0%, #facc15 46%, #92400e 72%, #111827 100%)",
    boxShadow:
      "0 24px 70px rgba(0,0,0,.55), 0 0 38px rgba(250,204,21,.45)",
    flexShrink: 0,
  },
  wheel: {
    width: "calc(100% - clamp(38px, 6vh, 56px))",
    height: "calc(100% - clamp(38px, 6vh, 56px))",
    borderRadius: "50%",
    border: "clamp(8px, 1.8vh, 14px) solid #ffffff",
    boxShadow:
      "inset 0 0 0 7px rgba(0,0,0,.24), 0 18px 50px rgba(0,0,0,.42)",
    position: "relative",
    overflow: "hidden",
  },
  segmentIcon: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 54,
    height: 54,
    marginLeft: -27,
    marginTop: -27,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    fontSize: "clamp(22px, 4vh, 34px)",
    fontWeight: 1000,
    color: "#ffffff",
    textShadow: "0 3px 10px rgba(0,0,0,.65)",
    transformOrigin: "27px 27px",
  },
  center: {
    position: "absolute",
    inset: "34%",
    borderRadius: "50%",
    background: "radial-gradient(circle, #172554 0%, #0b1185 70%, #020617 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 1000,
    fontSize: "clamp(20px, 3vw, 34px)",
    border: "clamp(5px, 1vh, 8px) solid white",
    boxShadow: "0 10px 30px rgba(0,0,0,.45)",
  },
  button: {
    border: "none",
    borderRadius: 999,
    padding: "clamp(14px, 2vh, 20px) clamp(28px, 5vw, 46px)",
    background:
      "linear-gradient(135deg, #22c55e 0%, #16a34a 45%, #15803d 100%)",
    color: "#ffffff",
    fontSize: "clamp(18px, 2.7vw, 30px)",
    fontWeight: 1000,
    boxShadow: "0 16px 34px rgba(34,197,94,.32)",
    flexShrink: 0,
  },
};

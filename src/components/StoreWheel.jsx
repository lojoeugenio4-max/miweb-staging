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
        <div style={styles.lights}>
          {Array.from({ length: 28 }, (_, index) => (
            <span
              key={index}
              style={{
                ...styles.light,
                animationDelay: `${index * 0.06}s`,
              }}
            />
          ))}
        </div>

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
                transform: `rotate(${segmento.start + (segmento.end - segmento.start) / 2}deg) translateY(-42%)`,
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
  },
  machineTop: {
    color: "#facc15",
    fontSize: "clamp(26px, 4vw, 48px)",
    fontWeight: 1000,
    letterSpacing: "0.04em",
    textShadow: "0 6px 20px rgba(0,0,0,.75)",
  },
  pointer: {
    color: "#ffffff",
    fontSize: 50,
    lineHeight: 1,
    textShadow: "0 4px 14px rgba(0,0,0,.8)",
    marginBottom: -22,
    zIndex: 5,
  },
  wheelFrame: {
    position: "relative",
    width: "min(62vh, 600px)",
    height: "min(62vh, 600px)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle, #ffffff 0%, #facc15 46%, #92400e 72%, #111827 100%)",
    boxShadow:
      "0 35px 110px rgba(0,0,0,.65), 0 0 50px rgba(250,204,21,.55)",
  },
  lights: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
  },
  light: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 14,
    height: 14,
    marginLeft: -7,
    marginTop: -7,
    borderRadius: "50%",
    background: "#fff7ed",
    boxShadow: "0 0 18px #facc15",
    transformOrigin: "7px 7px",
    animation: "lojoLightPulse 0.9s infinite alternate",
  },
  wheel: {
    width: "calc(100% - 58px)",
    height: "calc(100% - 58px)",
    borderRadius: "50%",
    border: "16px solid #ffffff",
    boxShadow:
      "inset 0 0 0 8px rgba(0,0,0,.24), 0 24px 70px rgba(0,0,0,.45)",
    position: "relative",
    overflow: "hidden",
  },
  segmentIcon: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 72,
    height: 72,
    marginLeft: -36,
    marginTop: -36,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    fontSize: 36,
    fontWeight: 1000,
    color: "#ffffff",
    textShadow: "0 3px 10px rgba(0,0,0,.65)",
    transformOrigin: "36px 36px",
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
    fontSize: "clamp(28px, 4vw, 42px)",
    border: "8px solid white",
    boxShadow: "0 10px 30px rgba(0,0,0,.45)",
  },
  button: {
    border: "none",
    borderRadius: 999,
    padding: "24px 50px",
    background:
      "linear-gradient(135deg, #22c55e 0%, #16a34a 45%, #15803d 100%)",
    color: "#ffffff",
    fontSize: "clamp(22px, 3vw, 34px)",
    fontWeight: 1000,
    cursor: "pointer",
    boxShadow: "0 18px 40px rgba(34,197,94,.35)",
  },
};

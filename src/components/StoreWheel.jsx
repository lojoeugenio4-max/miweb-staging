import { useEffect, useMemo, useRef, useState } from "react";
import logoLojo from "../assets/logo-lojo.jpg";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#facc15",
  "#65a30d",
  "#059669",
  "#0ea5e9",
  "#2563eb",
  "#7c3aed",
  "#c026d3",
  "#db2777",
];

const ICONS = ["?", "★", "🎁", "♦"];

function normalizarGrados(grados) {
  return ((grados % 360) + 360) % 360;
}

function mismoPremio(a, b) {
  if (!a || !b) return false;
  if (a.id !== undefined && b.id !== undefined) return String(a.id) === String(b.id);
  return a.nombre && b.nombre && String(a.nombre) === String(b.nombre);
}

export default function StoreWheel({
  premios = [],
  girando,
  premioFinal,
  premioObjetivo,
  onGirar,
  onGiroCompletado,
}) {
  const [rotacion, setRotacion] = useState(0);
  const [tick, setTick] = useState(0);
  const [fase, setFase] = useState("idle");
  const frameRef = useRef(null);
  const rotacionRef = useRef(0);
  const ultimoSectorRef = useRef(null);
  const giroActivoRef = useRef(false);

  const segmentos = useMemo(() => {
    if (!premios.length) return [];

    const totalVisual = Math.max(10, premios.length);
    const base = Array.from(
      { length: totalVisual },
      (_, index) => premios[index % premios.length]
    );
    const grados = 360 / base.length;

    return base.map((premio, index) => ({
      premio,
      color: premio?.color || COLORS[index % COLORS.length],
      start: index * grados,
      end: index * grados + grados,
      center: index * grados + grados / 2,
      icono: premio?.icono || ICONS[index % ICONS.length],
    }));
  }, [premios]);

  const conic = segmentos
    .map((seg) => `${seg.color} ${seg.start}deg ${seg.end}deg`)
    .join(", ");

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!girando || !premioObjetivo || !segmentos.length || giroActivoRef.current) return;

    giroActivoRef.current = true;
    setFase("acelerando");

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const indicesGanadores = segmentos
      .map((segmento, index) => (mismoPremio(segmento.premio, premioObjetivo) ? index : -1))
      .filter((index) => index >= 0);

    const indiceGanador =
      indicesGanadores.length > 0
        ? indicesGanadores[Math.floor(indicesGanadores.length / 2)]
        : 0;

    const centroGanador = segmentos[indiceGanador].center;
    const inicio = rotacionRef.current;
    const inicioNormalizado = normalizarGrados(inicio);
    const vueltasCasino = 24 + Math.floor(Math.random() * 5);
    const microSuspense = (Math.random() * 10 - 5);

    const destino =
      inicio -
      inicioNormalizado +
      vueltasCasino * 360 +
      (360 - centroGanador) +
      microSuspense;

    let actual = inicio;
    let velocidad = 0;
    let ultimaVez = performance.now();

    const velocidadMaxima = 48;
    const aceleracion = 1.22;
    const zonaFrenada = 1850;
    const zonaSuspense = 430;
    const velocidadMinima = 0.045;

    function animar(ahora) {
      const delta = Math.min((ahora - ultimaVez) / 16.67, 2.4);
      ultimaVez = ahora;

      const restante = destino - actual;

      if (restante <= 0.25 && velocidad <= velocidadMinima * 3) {
        actual = destino;
        rotacionRef.current = actual;
        setRotacion(actual);
        setFase("parada");
        giroActivoRef.current = false;
        frameRef.current = null;

        window.setTimeout(() => {
          onGiroCompletado?.(premioObjetivo);
        }, 850);
        return;
      }

      if (restante > zonaFrenada) {
        velocidad = Math.min(velocidad + aceleracion * delta, velocidadMaxima);
        setFase(velocidad > velocidadMaxima * 0.82 ? "velocidad" : "acelerando");
      } else if (restante > zonaSuspense) {
        const proporcion = restante / zonaFrenada;
        const limite = Math.max(7.5, velocidadMaxima * Math.pow(proporcion, 1.34));
        velocidad = Math.min(velocidad * 0.982, limite);
        velocidad = Math.max(velocidad, 2.2);
        setFase("frenando");
      } else {
        const proporcion = Math.max(restante / zonaSuspense, 0.012);
        const limite = 4.8 * Math.pow(proporcion, 1.85) + velocidadMinima;
        velocidad = Math.min(velocidad * 0.965, limite);
        velocidad = Math.max(velocidad, velocidadMinima);
        setFase("suspense");
      }

      actual += velocidad * delta;
      if (actual > destino) actual = destino;

      rotacionRef.current = actual;
      setRotacion(actual);

      const gradosSector = 360 / segmentos.length;
      const sectorActual = Math.floor(normalizarGrados(actual) / gradosSector);

      if (sectorActual !== ultimoSectorRef.current) {
        ultimoSectorRef.current = sectorActual;
        setTick((value) => value + 1);
      }

      frameRef.current = requestAnimationFrame(animar);
    }

    frameRef.current = requestAnimationFrame(animar);
  }, [girando, premioObjetivo, segmentos, onGiroCompletado]);

  useEffect(() => {
    if (!girando) {
      giroActivoRef.current = false;
      setFase("idle");
    }
  }, [girando]);

  return (
    <div style={styles.wrap}>
      <div
        style={{
          ...styles.pointer,
          transform: `rotate(${girando ? (tick % 2 === 0 ? -13 : 13) : 0}deg)`,
          transition: fase === "suspense" ? "transform 150ms ease-out" : "transform 65ms ease-out",
        }}
      >
        <div style={styles.pointerDot} />
      </div>

      <div
        style={{
          ...styles.wheelOuter,
          boxShadow:
            girando
              ? "0 34px 110px rgba(0,0,0,.8), 0 0 85px rgba(250,204,21,.92)"
              : styles.wheelOuter.boxShadow,
        }}
      >
        <div style={styles.bulbs}>
          {Array.from({ length: 32 }, (_, index) => {
            const angle = (360 / 32) * index;
            const activa = girando && (index + tick) % 4 === 0;

            return (
              <span
                key={index}
                style={{
                  ...styles.bulb,
                  opacity: activa ? 1 : 0.62,
                  filter: activa ? "brightness(1.65)" : "brightness(.78)",
                  transform: `rotate(${angle}deg) translateY(calc(var(--wheel-size) / -2 + 14px)) scale(${activa ? 1.22 : 1})`,
                  animationDelay: `${index * 0.035}s`,
                }}
              />
            );
          })}
        </div>

        <div
          style={{
            ...styles.wheel,
            background: `conic-gradient(${conic})`,
            transform: `rotate(${rotacion}deg)`,
            transition: "none",
          }}
        >
          <div style={styles.dividers}>
            {segmentos.map((segmento, index) => (
              <span
                key={index}
                style={{
                  ...styles.divider,
                  transform: `rotate(${segmento.start}deg)`,
                }}
              />
            ))}
          </div>

          {segmentos.map((segmento, index) => (
            <div
              key={index}
              style={{
                ...styles.segmentIcon,
                transform: `rotate(${segmento.center}deg) translateY(calc(var(--wheel-size) * -0.28))`,
              }}
            >
              <span
                style={{
                  transform: `rotate(-${segmento.center}deg)`,
                }}
              >
                {segmento.icono}
              </span>
            </div>
          ))}

          <div style={styles.innerShine} />

          <div style={styles.center}>
            <img src={logoLojo} alt="Lojo" style={styles.logo} />
          </div>
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
          {girando
            ? fase === "suspense"
              ? "CASI..."
              : fase === "frenando"
                ? "FRENANDO..."
                : "GIRANDO..."
            : "GIRAR RULETA"}
        </button>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    "--wheel-size": "min(61vh, 45vw, 650px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "clamp(10px, 1.6vh, 18px)",
  },
  pointer: {
    position: "relative",
    zIndex: 10,
    width: "clamp(54px, 8vh, 82px)",
    height: "clamp(78px, 11vh, 118px)",
    marginBottom: "clamp(-76px, -9vh, -54px)",
    background: "linear-gradient(180deg, #ef4444, #991b1b)",
    clipPath: "polygon(50% 100%, 10% 28%, 50% 0, 90% 28%)",
    filter: "drop-shadow(0 6px 10px rgba(0,0,0,.65))",
    border: "4px solid #facc15",
    transformOrigin: "50% 22%",
  },
  pointerDot: {
    position: "absolute",
    top: "18%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "clamp(18px, 3vh, 30px)",
    height: "clamp(18px, 3vh, 30px)",
    borderRadius: "50%",
    background: "radial-gradient(circle, #fff7ed, #facc15 70%)",
    boxShadow: "0 0 20px rgba(250,204,21,.9)",
  },
  wheelOuter: {
    position: "relative",
    width: "var(--wheel-size)",
    height: "var(--wheel-size)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle, #fff7ed 0%, #facc15 38%, #b45309 68%, #451a03 100%)",
    boxShadow:
      "0 30px 100px rgba(0,0,0,.75), 0 0 65px rgba(250,204,21,.6)",
    flexShrink: 0,
  },
  bulbs: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
  },
  bulb: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "clamp(13px, 2.1vh, 22px)",
    height: "clamp(13px, 2.1vh, 22px)",
    marginLeft: "-10px",
    marginTop: "-10px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #ffffff 0%, #fde68a 42%, #f59e0b 100%)",
    boxShadow: "0 0 18px rgba(250,204,21,.95), 0 0 34px rgba(250,204,21,.55)",
    animation: "lojoBulbPulse .78s infinite alternate",
    transition: "opacity 90ms linear, filter 90ms linear, transform 90ms linear",
  },
  wheel: {
    width: "calc(100% - clamp(58px, 8vh, 86px))",
    height: "calc(100% - clamp(58px, 8vh, 86px))",
    borderRadius: "50%",
    border: "clamp(6px, 1vh, 10px) solid rgba(255,255,255,.88)",
    boxShadow:
      "inset 0 0 0 3px rgba(0,0,0,.28), inset 0 0 40px rgba(0,0,0,.35), 0 18px 55px rgba(0,0,0,.52)",
    position: "relative",
    overflow: "hidden",
    willChange: "transform",
  },
  dividers: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    pointerEvents: "none",
  },
  divider: {
    position: "absolute",
    left: "50%",
    top: 0,
    width: "3px",
    height: "50%",
    marginLeft: "-1.5px",
    background: "linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,0))",
    transformOrigin: "50% 100%",
  },
  innerShine: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 35% 28%, rgba(255,255,255,.34), transparent 25%, rgba(0,0,0,.17) 78%)",
    pointerEvents: "none",
  },
  segmentIcon: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 68,
    height: 68,
    marginLeft: -34,
    marginTop: -34,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    fontSize: "clamp(24px, 4.5vh, 42px)",
    fontWeight: 1000,
    color: "#ffffff",
    textShadow: "0 4px 12px rgba(0,0,0,.75)",
    transformOrigin: "34px 34px",
  },
  center: {
    position: "absolute",
    inset: "33%",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "clamp(7px, 1.2vh, 12px) solid #facc15",
    boxShadow: "0 10px 30px rgba(0,0,0,.55)",
    overflow: "hidden",
  },
  logo: {
    width: "78%",
    height: "78%",
    objectFit: "contain",
  },
  button: {
    border: "none",
    borderRadius: 999,
    padding: "clamp(14px, 2vh, 22px) clamp(34px, 6vw, 60px)",
    background: "linear-gradient(180deg, #fb7185 0%, #ef4444 45%, #b91c1c 100%)",
    color: "#ffffff",
    fontSize: "clamp(20px, 3vw, 34px)",
    fontWeight: 1000,
    boxShadow:
      "0 18px 38px rgba(239,68,68,.42), inset 0 2px 0 rgba(255,255,255,.25)",
    flexShrink: 0,
    letterSpacing: ".02em",
  },
};

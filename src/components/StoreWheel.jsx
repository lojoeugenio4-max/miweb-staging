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

const ICONOS = ["?", "★", "🎁", "♦"];
const VUELTAS_EXTRA = 18;
const GIRO_MS = 11800;

function normalizarGrados(grados) {
  return ((grados % 360) + 360) % 360;
}

function casinoEase(t) {
  if (t < 0.12) {
    const p = t / 0.12;
    return 0.035 * p * p;
  }

  if (t < 0.5) {
    const p = (t - 0.12) / 0.38;
    return 0.035 + 0.39 * p;
  }

  const p = (t - 0.5) / 0.5;
  return 0.425 + 0.575 * (1 - Math.pow(1 - p, 4.9));
}

function crearSegmentos(premios) {
  const cantidad = Math.max(premios.length, 1);
  const base =
    premios.length >= 8
      ? premios
      : Array.from(
          { length: 10 },
          (_, index) => premios[index % cantidad] || { id: `placeholder-${index}` }
        );

  const grados = 360 / base.length;

  return base.map((premio, index) => ({
    premio,
    color: premio?.color || COLORS[index % COLORS.length],
    start: index * grados,
    end: index * grados + grados,
    center: index * grados + grados / 2,
    icono: premio?.icono || ICONOS[index % ICONOS.length],
  }));
}

export default function StoreWheel({
  premios = [],
  girando,
  premioFinal,
  premioObjetivo,
  onGirar,
  onGiroFinalizado,
}) {
  const [rotacion, setRotacion] = useState(0);
  const [tick, setTick] = useState(0);
  const [luces, setLuces] = useState(0);

  const rotacionRef = useRef(0);
  const frameRef = useRef(null);
  const animacionActivaRef = useRef(false);
  const ultimoSectorRef = useRef(null);
  const giroIdRef = useRef(0);

  const segmentos = useMemo(() => crearSegmentos(premios), [premios]);

  const conic = segmentos
    .map((seg) => `${seg.color} ${seg.start}deg ${seg.end}deg`)
    .join(", ");

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      animacionActivaRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!girando || !premioObjetivo || !segmentos.length) return;
    if (animacionActivaRef.current) return;

    animacionActivaRef.current = true;
    giroIdRef.current += 1;
    const giroId = giroIdRef.current;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const indiceObjetivo = Math.max(
      0,
      segmentos.findIndex((segmento) => segmento.premio?.id === premioObjetivo.id)
    );

    const segmentoObjetivo = segmentos[indiceObjetivo] || segmentos[0];
    const inicio = rotacionRef.current;
    const inicioNormalizado = normalizarGrados(inicio);

    // El puntero está arriba. Para que el centro del sector quede arriba,
    // rotamos hasta 360 - centroSector, sumando muchas vueltas completas.
    const destinoBase = 360 - segmentoObjetivo.center;
    let destino = inicio - inicioNormalizado + VUELTAS_EXTRA * 360 + destinoBase;

    while (destino <= inicio + 360 * 10) {
      destino += 360;
    }

    const distancia = destino - inicio;
    const inicioTiempo = performance.now();
    ultimoSectorRef.current = null;

    function animar(ahora) {
      if (giroId !== giroIdRef.current) return;

      const t = Math.min((ahora - inicioTiempo) / GIRO_MS, 1);
      const eased = casinoEase(t);
      const nuevaRotacion = inicio + distancia * eased;

      rotacionRef.current = nuevaRotacion;
      setRotacion(nuevaRotacion);

      const gradosSector = 360 / segmentos.length;
      const sectorActual = Math.floor(normalizarGrados(nuevaRotacion) / gradosSector);

      if (sectorActual !== ultimoSectorRef.current) {
        ultimoSectorRef.current = sectorActual;
        setTick((valor) => valor + 1);
      }

      setLuces(Math.floor(t * 120));

      if (t < 1) {
        frameRef.current = requestAnimationFrame(animar);
        return;
      }

      rotacionRef.current = destino;
      setRotacion(destino);
      animacionActivaRef.current = false;
      frameRef.current = null;

      if (giroId === giroIdRef.current) {
        onGiroFinalizado?.();
      }
    }

    frameRef.current = requestAnimationFrame(animar);
  }, [girando, premioObjetivo, segmentos, onGiroFinalizado]);

  return (
    <div style={styles.wrap}>
      <div
        style={{
          ...styles.pointer,
          transform: `rotate(${girando ? (tick % 2 === 0 ? -10 : 10) : 0}deg)`,
          transition: girando ? "transform 75ms ease-out" : "transform 220ms ease-out",
        }}
      >
        <div style={styles.pointerDot} />
      </div>

      <div style={styles.wheelOuter}>
        <div style={styles.bulbs}>
          {Array.from({ length: 32 }, (_, index) => {
            const angle = (360 / 32) * index;
            const encendida = girando ? (index + luces) % 4 === 0 : index % 2 === 0;

            return (
              <span
                key={index}
                style={{
                  ...styles.bulb,
                  opacity: encendida ? 1 : 0.42,
                  filter: encendida ? "brightness(1.45)" : "brightness(.72)",
                  transform: `rotate(${angle}deg) translateY(calc(var(--wheel-size) / -2 + 14px))`,
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
          {girando ? "GIRANDO..." : "GIRAR RULETA"}
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
    transformOrigin: "50% 50%",
    transition: "opacity 120ms linear, filter 120ms linear",
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
    boxShadow: "0 18px 38px rgba(239,68,68,.42), inset 0 2px 0 rgba(255,255,255,.25)",
    flexShrink: 0,
    letterSpacing: ".02em",
  },
};

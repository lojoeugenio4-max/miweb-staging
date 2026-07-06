import { useMemo, useRef, useState } from "react";
import RuletaCanvas from "./RuletaCanvas";
import {
  calcularIndicePremio,
  calcularRotacionDestino,
  elegirPremio,
} from "./RuletaHelpers";

const DURACION_GIRO = 12000;

export default function RuletaVisual({ premios = [], onPremioGanado }) {
  const premiosActivos = useMemo(
    () => premios.filter((p) => p.activo !== false),
    [premios]
  );

  const [rotacion, setRotacion] = useState(0);
  const [girando, setGirando] = useState(false);
  const rotacionRef = useRef(0);

  function easeOutCasino(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  function girar() {
    if (girando || !premiosActivos.length) return;

    const premio = elegirPremio(premiosActivos);
    const indiceGanador = calcularIndicePremio(premiosActivos, premio);

    const destino = calcularRotacionDestino({
      rotacionActual: rotacionRef.current,
      indiceGanador,
      totalPremios: premiosActivos.length,
    });

    const inicio = rotacionRef.current;
    const diferencia = destino - inicio;
    const tiempoInicio = performance.now();

    setGirando(true);

    function animar(tiempoActual) {
      const progreso = Math.min(
        (tiempoActual - tiempoInicio) / DURACION_GIRO,
        1
      );

      const suavizado = easeOutCasino(progreso);
      const nuevaRotacion = inicio + diferencia * suavizado;

      rotacionRef.current = nuevaRotacion;
      setRotacion(nuevaRotacion);

      if (progreso < 1) {
        requestAnimationFrame(animar);
      } else {
        rotacionRef.current = destino;
        setRotacion(destino);
        setGirando(false);
        onPremioGanado?.(premio);
      }
    }

    requestAnimationFrame(animar);
  }

  return (
    <div style={contenedor}>
      <RuletaCanvas
        premios={premiosActivos}
        rotacion={rotacion}
        girando={girando}
      />

      <button style={boton} onClick={girar} disabled={girando}>
        {girando ? "GIRANDO..." : "GIRAR RULETA"}
      </button>
    </div>
  );
}

const contenedor = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 20,
};

const boton = {
  border: 0,
  borderRadius: 14,
  background: "#f59e0b",
  color: "#fff",
  fontSize: 22,
  fontWeight: 700,
  padding: "16px 28px",
  cursor: "pointer",
};

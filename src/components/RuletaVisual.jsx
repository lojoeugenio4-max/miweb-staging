import { useMemo, useRef, useState } from "react";
import RuletaCanvas from "./RuletaCanvas";
import {
  calcularIndicePremio,
  calcularRotacionDestino,
  elegirPremio,
} from "./RuletaHelpers";

const DURACION_GIRO = 14000;

export default function RuletaVisual({
  premios = [],
  onPremioGanado,
  girando: girandoExterno = false,
}) {
  const [girando, setGirando] = useState(false);
  const [rotacion, setRotacion] = useState(0);
  const rotacionRef = useRef(0);

  const premiosActivos = useMemo(
    () => premios.filter((p) => p.activo !== false),
    [premios]
  );

  function easeOutCasino(t) {
    return 1 - Math.pow(1 - t, 6);
  }

  function girar() {
    if (girando || girandoExterno || !premiosActivos.length) return;

    const premio = elegirPremio(premiosActivos);
    if (!premio) return;

    const indiceGanador = calcularIndicePremio(premiosActivos, premio);

    const destino =
      calcularRotacionDestino({
        rotacionActual: rotacionRef.current,
        indiceGanador,
        totalPremios: premiosActivos.length,
      }) + 360 * 10;

    const inicio = rotacionRef.current;
    const distancia = destino - inicio;
    const inicioTiempo = performance.now();

    setGirando(true);

    function animar(ahora) {
      const progreso = Math.min((ahora - inicioTiempo) / DURACION_GIRO, 1);
      const suavizado = easeOutCasino(progreso);
      const nuevaRotacion = inicio + distancia * suavizado;

      rotacionRef.current = nuevaRotacion;
      setRotacion(nuevaRotacion);

      if (progreso < 1) {
        requestAnimationFrame(animar);
      } else {
        rotacionRef.current = destino;
        setRotacion(destino);
        setGirando(false);

        setTimeout(() => {
          onPremioGanado?.(premio);
        }, 700);
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
  padding: "16px",
  cursor: "pointer",
};

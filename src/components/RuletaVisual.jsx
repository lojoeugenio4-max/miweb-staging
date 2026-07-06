import { useMemo, useRef, useState } from "react";
import RuletaCanvas from "./RuletaCanvas";
import {
  calcularIndicePremio,
  calcularRotacionDestino,
  elegirPremio,
} from "./RuletaHelpers";

export default function RuletaVisual({ premios = [], onPremioGanado }) {
  const premiosActivos = useMemo(
    () => premios.filter((p) => p.activo !== false),
    [premios]
  );

  const [rotacion, setRotacion] = useState(0);
  const [girando, setGirando] = useState(false);
  const [tick, setTick] = useState(0);

  const rotacionRef = useRef(0);
  const ultimoSectorRef = useRef(null);

  function girar() {
    if (girando || !premiosActivos.length) return;

    const premio = elegirPremio(premiosActivos);
    const indiceGanador = calcularIndicePremio(premiosActivos, premio);

    const destino =
      calcularRotacionDestino({
        rotacionActual: rotacionRef.current,
        indiceGanador,
        totalPremios: premiosActivos.length,
      }) + 360 * 18;

    const inicio = rotacionRef.current;
    const distancia = destino - inicio;
    const duracion = 15000;
    const inicioTiempo = performance.now();

    setGirando(true);

    function animar(ahora) {
      const t = Math.min((ahora - inicioTiempo) / duracion, 1);

      // Frenada casino: rápido al inicio, lentísimo al final
      const ease = 1 - Math.pow(1 - t, 4.8);
      const nuevaRotacion = inicio + distancia * ease;

      rotacionRef.current = nuevaRotacion;
      setRotacion(nuevaRotacion);

      // Movimiento del freno / pestaña al pasar sectores
      const gradosSector = 360 / premiosActivos.length;
      const sectorActual = Math.floor((nuevaRotacion % 360) / gradosSector);

      if (sectorActual !== ultimoSectorRef.current) {
        ultimoSectorRef.current = sectorActual;
        setTick((v) => v + 1);
      }

      if (t < 1) {
        requestAnimationFrame(animar);
      } else {
        setGirando(false);

        setTimeout(() => {
          onPremioGanado?.(premio);
        }, 900);
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
        tick={tick}
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
  gap: 24,
};

const boton = {
  border: 0,
  borderRadius: 14,
  background: "#f59e0b",
  color: "#fff",
  fontSize: 22,
  fontWeight: 900,
  padding: "16px 28px",
  cursor: "pointer",
};

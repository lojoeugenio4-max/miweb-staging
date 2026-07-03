import { useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import RuletaCanvas from "./RuletaCanvas";
import {
  calcularIndicePremio,
  calcularRotacionDestino,
  descontarStock,
  elegirPremio,
  filtrarPremiosDisponibles,
} from "./RuletaHelpers";

export default function RuletaVisual({
  premios = [],
  onPremioGanado = () => {},
}) {
  const [girando, setGirando] = useState(false);
  const [rotacion, setRotacion] = useState(0);
  const [premioGanado, setPremioGanado] = useState(null);
  const [error, setError] = useState("");

  const premiosDisponibles = useMemo(
    () => filtrarPremiosDisponibles(premios),
    [premios]
  );

  async function girarRuleta() {
    if (girando) return;

    setError("");
    setPremioGanado(null);

    if (!premiosDisponibles.length) {
      setError("No hay premios disponibles para esta promoción.");
      return;
    }

    const premioElegido = elegirPremio(premiosDisponibles);

    if (!premioElegido) {
      setError("No se ha podido elegir un premio.");
      return;
    }

    const indiceGanador = calcularIndicePremio(
      premiosDisponibles,
      premioElegido
    );

    if (indiceGanador < 0) {
      setError("No se ha podido calcular el premio ganador.");
      return;
    }

    const nuevaRotacion = calcularRotacionDestino({
      rotacionActual: rotacion,
      indiceGanador,
      totalPremios: premiosDisponibles.length,
    });

    setGirando(true);
    setRotacion(nuevaRotacion);

    window.setTimeout(async () => {
      try {
        await descontarStock(supabase, premioElegido);

        setPremioGanado(premioElegido);
        setGirando(false);

        onPremioGanado(premioElegido);
      } catch (err) {
        console.error(err);
        setGirando(false);
        setError("El premio ha salido, pero no se ha podido actualizar el stock.");
      }
    }, 5600);
  }

  if (!premiosDisponibles.length) {
    return (
      <div style={contenedor}>
        <p style={texto}>
          No hay premios disponibles para esta promoción.
        </p>
      </div>
    );
  }

  return (
    <div style={contenedor}>
      <RuletaCanvas
        premios={premiosDisponibles}
        rotacion={rotacion}
        girando={girando}
      />

      <button
        type="button"
        style={{
          ...boton,
          ...(girando ? botonDesactivado : {}),
        }}
        onClick={girarRuleta}
        disabled={girando}
      >
        {girando ? "Girando..." : "Girar ruleta"}
      </button>

      {error && <div style={errorStyle}>{error}</div>}

      {premioGanado && (
        <div style={resultado}>
          <div style={resultadoIcono}>🎉</div>
          <div>
            Premio conseguido:
            <br />
            <strong>{premioGanado.nombre}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

const contenedor = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "18px",
  padding: "18px 0",
};

const boton = {
  border: "none",
  background: "#dc2626",
  color: "#ffffff",
  borderRadius: "999px",
  padding: "14px 28px",
  fontSize: "17px",
  fontWeight: "900",
  cursor: "pointer",
  boxShadow: "0 12px 28px rgba(220,38,38,.35)",
};

const botonDesactivado = {
  opacity: 0.65,
  cursor: "not-allowed",
};

const resultado = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  color: "#166534",
  borderRadius: "16px",
  padding: "14px 18px",
  fontSize: "17px",
  textAlign: "left",
};

const resultadoIcono = {
  fontSize: "34px",
};

const texto = {
  color: "#6b7280",
  fontSize: "15px",
};

const errorStyle = {
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  borderRadius: "12px",
  padding: "12px 14px",
  fontSize: "14px",
  fontWeight: "700",
};

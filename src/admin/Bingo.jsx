import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import BingoConfiguracion from "./BingoConfiguracion";
import BingoArticulos from "./BingoArticulos";

function BingoSorteoControl() {
  const [promotion, setPromotion] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");

    const { data, error: promotionError } = await supabase
      .from("promociones_bingo")
      .select("id,nombre,edition_id,activa,fecha_inicio,fecha_fin")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (promotionError) {
      setError("No se pudo cargar el Bingo.");
      return;
    }

    setPromotion(data || null);

    if (!data?.edition_id) {
      setNumbers([]);
      return;
    }

    const { data: draws, error: drawsError } = await supabase
      .from("bingo_draws")
      .select("number")
      .eq("edition_id", data.edition_id)
      .order("drawn_at");

    if (drawsError) {
      setError("No se pudieron cargar las bolas cantadas.");
      return;
    }

    setNumbers((draws || []).map((item) => Number(item.number)));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!promotion?.edition_id) return undefined;

    const channel = supabase
      .channel(`bingo-admin-${promotion.edition_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bingo_draws",
          filter: `edition_id=eq.${promotion.edition_id}`,
        },
        (payload) => {
          const number = Number(payload.new?.number);
          if (!number) return;
          setNumbers((current) =>
            current.includes(number) ? current : [...current, number]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [promotion?.edition_id]);

  const available = useMemo(
    () =>
      Array.from({ length: 90 }, (_, index) => index + 1).filter(
        (number) => !numbers.includes(number)
      ),
    [numbers]
  );

  async function drawNext() {
    if (!promotion?.id || !available.length || drawing) return;

    setDrawing(true);
    setMessage("");
    setError("");

    const number = available[Math.floor(Math.random() * available.length)];
    const { error: rpcError } = await supabase.rpc("cantar_bola_bingo", {
      p_promocion_id: promotion.id,
      p_numero: number,
    });

    if (rpcError) {
      setError(rpcError.message || "No se pudo cantar la bola.");
      setDrawing(false);
      return;
    }

    setMessage("El bombo está girando en todas las pantallas…");
    window.setTimeout(() => {
      setMessage(`Bola ${number} cantada.`);
      setDrawing(false);
    }, 5600);
  }

  function openDisplay(demo = false) {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("bingoDisplay", "1");
    if (demo) url.searchParams.set("demo", "1");

    const displayWindow = window.open(
      url.toString(),
      demo ? "cash-lojo-bingo-demo" : "cash-lojo-bingo-display"
    );

    if (!displayWindow) {
      setError("El navegador ha bloqueado la ventana. Permite las ventanas emergentes para abrir la pantalla grande.");
    }
  }

  return (
    <section style={panelSorteo}>
      <div style={cabeceraSorteo}>
        <div>
          <h4 style={tituloSorteo}>🎙️ Control del sorteo en directo</h4>
          <p style={textoSorteo}>
            Abre la pantalla del bombo en la TV o proyector y controla desde aquí cada extracción.
          </p>
        </div>

        <div style={accionesPantalla}>
          <button style={botonDemo} onClick={() => openDisplay(true)}>
            Ver demostración ↗
          </button>
          <button style={botonPantalla} onClick={() => openDisplay(false)}>
            Abrir pantalla real ↗
          </button>
        </div>
      </div>

      {!promotion && (
        <div style={avisoSorteo}>
          Todavía no existe una configuración de Bingo. La demostración sí se puede abrir.
        </div>
      )}

      {promotion && (
        <>
          <div style={estadisticas}>
            <span><b>{numbers.length}</b> cantadas</span>
            <span><b>{available.length}</b> disponibles</span>
            <span>Edición <b>{String(promotion.edition_id || "—").slice(0, 8)}</b></span>
          </div>

          <button
            style={{
              ...botonExtraer,
              opacity: drawing || !available.length ? 0.6 : 1,
            }}
            disabled={drawing || !available.length}
            onClick={drawNext}
          >
            {drawing
              ? "BOMBO GIRANDO…"
              : available.length
                ? "SACAR SIGUIENTE BOLA"
                : "SORTEO COMPLETADO"}
          </button>

          {message && <div style={mensajeCorrecto}>{message}</div>}
          {error && <div style={mensajeError}>{error}</div>}

          <div style={ultimasBolas}>
            {numbers.slice(-12).reverse().map((number, index) => (
              <b
                key={number}
                style={{
                  ...bola,
                  ...(index === 0 ? ultimaBola : {}),
                }}
              >
                {number}
              </b>
            ))}
          </div>
        </>
      )}

      {!promotion && error && <div style={mensajeError}>{error}</div>}
    </section>
  );
}

export default function Bingo() {
  return (
    <div>
      <h3 style={titulo}>🎱 Bingo promocional</h3>
      <p style={texto}>
        Configura las condiciones que debe cumplir un pedido y los artículos válidos para que un cliente identificado consiga su cartón personal.
      </p>
      <div style={aviso}>
        Guardar o activar el Bingo no crea cartones automáticamente. El cartón se entrega únicamente tras validar un pedido que cumpla las condiciones.
      </div>
      <BingoSorteoControl />
      <BingoConfiguracion />
      <BingoArticulos />
    </div>
  );
}

const titulo = { margin: "0 0 8px", fontSize: "22px", color: "#111827" };
const texto = { margin: "0 0 12px", color: "#6b7280", fontSize: "15px" };
const aviso = { margin: "0 0 16px", padding: "11px 13px", borderRadius: "11px", background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", fontSize: "13px", fontWeight: "700" };
const panelSorteo = { margin: "20px 0", padding: "20px", border: "2px solid #d7a72b", borderRadius: "18px", background: "linear-gradient(135deg,#071a43,#123a79)", color: "white", boxShadow: "0 12px 30px #06153233" };
const cabeceraSorteo = { display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", flexWrap: "wrap" };
const tituloSorteo = { margin: 0, fontSize: "20px", color: "#ffe697" };
const textoSorteo = { margin: "6px 0 0", color: "#dbe8ff" };
const accionesPantalla = { display: "flex", gap: "9px", flexWrap: "wrap" };
const botonPantalla = { padding: "11px 16px", border: "1px solid #ffe69a", borderRadius: "999px", background: "#fff3bd", color: "#092354", fontWeight: 900, cursor: "pointer" };
const botonDemo = { ...botonPantalla, background: "transparent", color: "#fff3bd" };
const estadisticas = { display: "flex", gap: "12px", flexWrap: "wrap", margin: "18px 0" };
const avisoSorteo = { marginTop: 15, padding: 12, background: "#ffffffdd", color: "#6b3d00", borderRadius: 10 };
const botonExtraer = { width: "100%", padding: "18px", border: "3px solid #fff1aa", borderRadius: "14px", background: "linear-gradient(#f7d25e,#b8730a)", color: "#291700", fontSize: "20px", fontWeight: 950, letterSpacing: ".06em", cursor: "pointer", boxShadow: "0 7px 0 #704004" };
const ultimasBolas = { display: "flex", gap: "7px", flexWrap: "wrap", marginTop: "16px" };
const bola = { width: 39, height: 39, display: "grid", placeItems: "center", borderRadius: "50%", background: "#fff1b5", color: "#102554" };
const ultimaBola = { background: "#d31f28", color: "white", transform: "scale(1.12)" };
const mensajeCorrecto = { marginTop: 14, padding: 10, borderRadius: 10, background: "#dcfce7", color: "#166534", fontWeight: 800 };
const mensajeError = { marginTop: 14, padding: 10, borderRadius: 10, background: "#fee2e2", color: "#991b1b", fontWeight: 800 };

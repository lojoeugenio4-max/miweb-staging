import { useEffect, useRef, useState } from "react";
import { CheckCircle, RotateCcw, Search, XCircle } from "lucide-react";
import { supabase } from "../supabaseClient";
import StoreWheel from "../components/StoreWheel";

function normalizarCodigo(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function getPrizeImageUrl(premio) {
  return (
    premio?.imagen_url ||
    premio?.foto_url ||
    premio?.image_url ||
    premio?.foto ||
    premio?.imagen ||
    ""
  );
}

export default function StorePage() {
  const inputRef = useRef(null);

  const [codigo, setCodigo] = useState("");
  const [entrada, setEntrada] = useState(null);
  const [premios, setPremios] = useState([]);
  const [estado, setEstado] = useState("idle");
  const [mensaje, setMensaje] = useState("");
  const [girando, setGirando] = useState(false);
  const [premioFinal, setPremioFinal] = useState(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [estado]);

  async function validarCodigo(codeFromScanner = codigo) {
    const code = normalizarCodigo(codeFromScanner);

    if (!code) {
      setMensaje("Introduce o escanea un código.");
      setEstado("error");
      return;
    }

    setEstado("loading");
    setMensaje("");
    setEntrada(null);
    setPremios([]);
    setPremioFinal(null);

    const { data, error } = await supabase
      .from("promotion_participations")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      console.error(error);
      setMensaje("Error consultando el código.");
      setEstado("error");
      return;
    }

    if (!data) {
      setMensaje("Código no encontrado.");
      setEstado("error");
      return;
    }

    if (data.status !== "pending") {
      setEntrada(data);
      setMensaje(
        data.status === "played"
          ? "Este código ya fue utilizado."
          : `Este código no está pendiente. Estado: ${data.status}`
      );
      setEstado("used");
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setEntrada(data);
      setMensaje("Este código está caducado.");
      setEstado("error");
      return;
    }

    const { data: premiosData, error: premiosError } = await supabase
      .from("promociones_ruleta_premios")
      .select("*")
      .eq("promocion_id", data.promotion_id)
      .eq("activo", true)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true });

    if (premiosError) {
      console.error(premiosError);
      setMensaje("Error cargando premios.");
      setEstado("error");
      return;
    }

    if (!premiosData || premiosData.length === 0) {
      setMensaje("Esta promoción no tiene premios activos.");
      setEstado("error");
      return;
    }

    setCodigo(code);
    setEntrada(data);
    setPremios(premiosData);
    setEstado("ready");
  }

  async function girar() {
    if (!entrada || girando) return;

    setGirando(true);
    setPremioFinal(null);
    setMensaje("");

    const { data, error } = await supabase.rpc("play_promotion_participation", {
      p_code: entrada.code,
      p_used_by: "tienda",
    });

    if (error) {
      console.error(error);
      setGirando(false);
      setMensaje(error.message || "No se pudo consumir el código.");
      setEstado("error");
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    const entry = result?.entry || result?.entrada || result?.participation;
    const prize = result?.prize || result?.premio;

    if (!entry || !prize) {
      setGirando(false);
      setMensaje("La respuesta del servidor no incluye premio.");
      setEstado("error");
      return;
    }

    window.setTimeout(() => {
      setEntrada(entry);
      setPremioFinal(prize);
      setGirando(false);
      setEstado("result");
    }, 4200);
  }

  function reset() {
    setCodigo("");
    setEntrada(null);
    setPremios([]);
    setEstado("idle");
    setMensaje("");
    setGirando(false);
    setPremioFinal(null);

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  function manejarSubmit(event) {
    event.preventDefault();
    validarCodigo();
  }

  const premioImagen = getPrizeImageUrl(premioFinal);

  return (
    <main style={styles.page}>
      <style>
        {`
          @keyframes lojoLightPulse {
            from { opacity: .35; transform: scale(.75); }
            to { opacity: 1; transform: scale(1.25); }
          }

          @keyframes lojoPrizePop {
            0% { transform: scale(.7); opacity: 0; }
            55% { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>

      <section style={styles.header}>
        <div>
          <div style={styles.brand}>CASH LOJO</div>
          <h1 style={styles.title}>Ruleta de tienda</h1>
        </div>

        <button type="button" onClick={reset} style={styles.resetButton}>
          <RotateCcw size={22} />
          Nuevo código
        </button>
      </section>

      {(estado === "idle" ||
        estado === "loading" ||
        estado === "error" ||
        estado === "used") && (
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Escanear o introducir código</h2>

          <form onSubmit={manejarSubmit} style={styles.form}>
            <input
              ref={inputRef}
              value={codigo}
              onChange={(event) => setCodigo(event.target.value.toUpperCase())}
              placeholder="LJ-XXXXXX"
              autoComplete="off"
              style={styles.input}
            />

            <button
              type="submit"
              disabled={estado === "loading"}
              style={styles.validateButton}
            >
              <Search size={26} />
              VALIDAR
            </button>
          </form>

          {estado === "loading" && <p style={styles.info}>Validando código...</p>}

          {(estado === "error" || estado === "used") && (
            <div style={estado === "used" ? styles.usedBox : styles.errorBox}>
              <XCircle size={44} />
              <strong>{mensaje}</strong>

              {entrada?.played_at && (
                <span>
                  Utilizado: {new Date(entrada.played_at).toLocaleString("es-ES")}
                </span>
              )}
            </div>
          )}
        </section>
      )}

      {(estado === "ready" || estado === "result") && entrada && (
        <section style={styles.gameLayout}>
          <div style={styles.sidePanel}>
            <CheckCircle size={54} color="#22c55e" />
            <h2>Código válido</h2>

            <div style={styles.code}>{entrada.code}</div>

            {entrada.customer_name && (
              <p>
                Cliente:
                <br />
                <strong>{entrada.customer_name}</strong>
              </p>
            )}

            {entrada.customer_phone && (
              <p>
                Teléfono:
                <br />
                <strong>{entrada.customer_phone}</strong>
              </p>
            )}

            <p>
              Estado:
              <br />
              <strong>{entrada.status}</strong>
            </p>
          </div>

          <div style={styles.wheelPanel}>
            <StoreWheel
              premios={premios}
              girando={girando}
              premioFinal={premioFinal}
              onGirar={girar}
            />

            {premioFinal && (
              <div
                style={{
                  ...styles.resultBox,
                  ...(premioFinal.tipo_sonido === "jackpot" ||
                  premioFinal.tipo_sonido === "sirena"
                    ? styles.resultBoxJackpot
                    : {}),
                }}
              >
                <div style={styles.resultIcon}>
                  {premioFinal.tipo_sonido === "jackpot" ||
                  premioFinal.tipo_sonido === "sirena"
                    ? "🚨🎉🚨"
                    : "🎉"}
                </div>

                <h2 style={styles.resultTitle}>
                  {premioFinal.tipo_sonido === "jackpot" ? "¡¡¡ JACKPOT !!!" : "HAS GANADO"}
                </h2>

                {premioImagen && (
                  <img src={premioImagen} alt="" style={styles.prizeImage} />
                )}

                <strong style={styles.prizeName}>{premioFinal.nombre}</strong>

                {premioFinal.codigo && <p>Código premio: {premioFinal.codigo}</p>}

                <button type="button" onClick={reset} style={styles.nextButton}>
                  SIGUIENTE CLIENTE
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(30,64,175,.72), #020617 58%, #000 100%)",
    color: "#ffffff",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: 28,
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    maxWidth: 1380,
    margin: "0 auto 28px",
  },
  brand: {
    color: "#ef4444",
    fontSize: 38,
    fontWeight: 1000,
    letterSpacing: "-1px",
  },
  title: {
    margin: 0,
    fontSize: 28,
  },
  resetButton: {
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(255,255,255,.08)",
    color: "#ffffff",
    borderRadius: 16,
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 900,
    cursor: "pointer",
  },
  card: {
    maxWidth: 820,
    margin: "8vh auto 0",
    background: "rgba(255,255,255,.96)",
    color: "#0f172a",
    borderRadius: 32,
    padding: 36,
    boxShadow: "0 34px 100px rgba(0,0,0,.45)",
    textAlign: "center",
  },
  cardTitle: {
    margin: "0 0 24px",
    fontSize: 34,
  },
  form: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 16,
  },
  input: {
    height: 72,
    border: "3px solid #cbd5e1",
    borderRadius: 18,
    padding: "0 24px",
    fontSize: 34,
    fontWeight: 1000,
    letterSpacing: 2,
    textTransform: "uppercase",
    outline: "none",
  },
  validateButton: {
    border: "none",
    borderRadius: 18,
    background: "#22c55e",
    color: "#ffffff",
    padding: "0 28px",
    fontSize: 22,
    fontWeight: 1000,
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  info: {
    fontSize: 22,
    fontWeight: 800,
    color: "#475569",
  },
  errorBox: {
    marginTop: 24,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 22,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
    fontSize: 22,
  },
  usedBox: {
    marginTop: 24,
    background: "#ffedd5",
    color: "#9a3412",
    borderRadius: 22,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
    fontSize: 22,
  },
  gameLayout: {
    maxWidth: 1380,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: 28,
    alignItems: "start",
  },
  sidePanel: {
    background: "rgba(255,255,255,.96)",
    color: "#0f172a",
    borderRadius: 28,
    padding: 26,
    boxShadow: "0 24px 70px rgba(0,0,0,.35)",
  },
  code: {
    background: "#020617",
    color: "#facc15",
    borderRadius: 18,
    padding: "18px 16px",
    fontSize: 34,
    fontWeight: 1000,
    textAlign: "center",
    letterSpacing: 2,
    margin: "18px 0",
  },
  wheelPanel: {
    minHeight: 700,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  resultBox: {
    background: "rgba(255,255,255,.98)",
    color: "#0f172a",
    borderRadius: 30,
    padding: "30px 46px",
    textAlign: "center",
    boxShadow: "0 24px 80px rgba(0,0,0,.42)",
    minWidth: 520,
    animation: "lojoPrizePop .55s ease-out",
  },
  resultBoxJackpot: {
    background:
      "radial-gradient(circle at top, #fef3c7 0%, #facc15 40%, #dc2626 100%)",
    color: "#111827",
    boxShadow:
      "0 0 80px rgba(250,204,21,.75), 0 24px 100px rgba(220,38,38,.55)",
  },
  resultIcon: {
    fontSize: 70,
  },
  resultTitle: {
    margin: "8px 0 18px",
    fontSize: 42,
    fontWeight: 1000,
  },
  prizeImage: {
    width: "min(420px, 70vw)",
    maxHeight: 320,
    objectFit: "contain",
    borderRadius: 24,
    background: "#ffffff",
    padding: 12,
    boxShadow: "0 20px 60px rgba(0,0,0,.25)",
    marginBottom: 18,
  },
  prizeName: {
    display: "block",
    fontSize: 38,
    fontWeight: 1000,
  },
  nextButton: {
    marginTop: 24,
    border: "none",
    borderRadius: 999,
    padding: "18px 28px",
    background: "#0b1185",
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 1000,
    cursor: "pointer",
  },
};

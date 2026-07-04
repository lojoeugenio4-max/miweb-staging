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

  async function girar(premio) {
    if (!entrada || !premio || girando) return;

    setGirando(true);
    setPremioFinal(null);

    window.setTimeout(async () => {
      const { data, error } = await supabase.rpc("use_promotion_participation", {
        p_code: entrada.code,
        p_prize_id: premio.id,
        p_used_by: "tienda",
      });

      setGirando(false);

      if (error) {
        console.error(error);
        setMensaje(error.message || "No se pudo consumir el código.");
        setEstado("error");
        return;
      }

      setEntrada(data);
      setPremioFinal(premio);
      setEstado("result");
    }, 3900);
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

  return (
    <main style={styles.page}>
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
              <div style={styles.resultBox}>
                <div style={styles.resultIcon}>🎉</div>
                <h2>HAS GANADO</h2>
                <strong>{premioFinal.nombre}</strong>
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
    background: "rgba(255,255,255,.97)",
    color: "#0f172a",
    borderRadius: 30,
    padding: "30px 46px",
    textAlign: "center",
    boxShadow: "0 24px 80px rgba(0,0,0,.42)",
    minWidth: 520,
  },
  resultIcon: {
    fontSize: 70,
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

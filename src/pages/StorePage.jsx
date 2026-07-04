import { useEffect, useRef, useState } from "react";
import { CheckCircle, RotateCcw, Search, XCircle } from "lucide-react";
import { supabase } from "../supabaseClient";
import StoreWheel from "../components/StoreWheel";

let audioContext = null;
let giroInterval = null;

function getAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function beep({ frequency = 440, duration = 120, type = "sine", volume = 0.08 } = {}) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch {}
}

function startSpinSound() {
  stopSpinSound();
  let step = 0;
  giroInterval = window.setInterval(() => {
    beep({ frequency: 220 + (step % 8) * 28, duration: 55, type: "square", volume: 0.035 });
    step += 1;
  }, 70);
}

function stopSpinSound() {
  if (giroInterval) {
    window.clearInterval(giroInterval);
    giroInterval = null;
  }
}

function playCampana() {
  [0, 160, 320, 520, 760].forEach((delay, index) => {
    window.setTimeout(() => {
      beep({ frequency: [784, 988, 1175, 988, 1319][index], duration: 180, type: "sine", volume: 0.11 });
    }, delay);
  });
}

function playSirena() {
  for (let i = 0; i < 12; i += 1) {
    window.setTimeout(() => {
      beep({ frequency: i % 2 === 0 ? 880 : 440, duration: 180, type: "sawtooth", volume: 0.1 });
    }, i * 190);
  }
}

function normalizarCodigo(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function getPrizeImageUrl(premio) {
  return premio?.imagen_url || premio?.foto_url || premio?.image_url || premio?.foto || premio?.imagen || "";
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

  useEffect(() => { inputRef.current?.focus(); }, [estado]);
  useEffect(() => () => stopSpinSound(), []);

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

    const { data, error } = await supabase.from("promotion_participations").select("*").eq("code", code).maybeSingle();

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
      setMensaje(data.status === "played" ? "Este código ya fue utilizado." : `Este código no está pendiente. Estado: ${data.status}`);
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
    try { getAudioContext().resume?.(); } catch {}
    setGirando(true);
    setPremioFinal(null);
    setMensaje("");
    startSpinSound();

    const { data, error } = await supabase.rpc("play_promotion_participation", { p_code: entrada.code, p_used_by: "tienda" });

    if (error) {
      stopSpinSound();
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
      stopSpinSound();
      setGirando(false);
      setMensaje("La respuesta del servidor no incluye premio.");
      setEstado("error");
      return;
    }

    window.setTimeout(() => {
      stopSpinSound();
      setEntrada(entry);
      setPremioFinal(prize);
      setGirando(false);
      setEstado("result");
      if (prize.tipo_sonido === "sirena" || prize.tipo_sonido === "jackpot") playSirena();
      else playCampana();
    }, 4200);
  }

  function reset() {
    stopSpinSound();
    setCodigo("");
    setEntrada(null);
    setPremios([]);
    setEstado("idle");
    setMensaje("");
    setGirando(false);
    setPremioFinal(null);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }

  function manejarSubmit(event) {
    event.preventDefault();
    validarCodigo();
  }

  const premioImagen = getPrizeImageUrl(premioFinal);

  return (
    <main style={styles.page}>
      <style>{`@keyframes lojoPrizePop{0%{transform:scale(.7);opacity:0}55%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1}}@media(max-width:900px){.store-game-layout{grid-template-columns:1fr!important}}`}</style>

      <section style={styles.header}>
        <div>
          <div style={styles.brand}>CASH LOJO</div>
          <h1 style={styles.title}>Ruleta de tienda</h1>
        </div>
        <button type="button" onClick={reset} style={styles.resetButton}><RotateCcw size={20} />Nuevo</button>
      </section>

      {(estado === "idle" || estado === "loading" || estado === "error" || estado === "used") && (
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Escanear o introducir código</h2>
          <form onSubmit={manejarSubmit} style={styles.form}>
            <input ref={inputRef} value={codigo} onChange={(event) => setCodigo(event.target.value.toUpperCase())} placeholder="LJ-XXXXXX" autoComplete="off" style={styles.input} />
            <button type="submit" disabled={estado === "loading"} style={styles.validateButton}><Search size={24} />VALIDAR</button>
          </form>
          {estado === "loading" && <p style={styles.info}>Validando código...</p>}
          {(estado === "error" || estado === "used") && (
            <div style={estado === "used" ? styles.usedBox : styles.errorBox}>
              <XCircle size={40} />
              <strong>{mensaje}</strong>
              {entrada?.played_at && <span>Utilizado: {new Date(entrada.played_at).toLocaleString("es-ES")}</span>}
            </div>
          )}
        </section>
      )}

      {(estado === "ready" || estado === "result") && entrada && (
        <section className="store-game-layout" style={styles.gameLayout}>
          <div style={styles.sidePanel}>
            <CheckCircle size={42} color="#22c55e" />
            <h2 style={styles.sideTitle}>Código válido</h2>
            <div style={styles.code}>{entrada.code}</div>
            {entrada.customer_name && <p style={styles.sideText}>Cliente:<br /><strong>{entrada.customer_name}</strong></p>}
            <p style={styles.sideText}>Estado:<br /><strong>{entrada.status}</strong></p>
          </div>

          <div style={styles.wheelPanel}>
            <StoreWheel premios={premios} girando={girando} premioFinal={premioFinal} onGirar={girar} />
            {premioFinal && (
              <div style={{...styles.resultBox,...(premioFinal.tipo_sonido === "jackpot" || premioFinal.tipo_sonido === "sirena" ? styles.resultBoxJackpot : {})}}>
                <div style={styles.resultIcon}>{premioFinal.tipo_sonido === "jackpot" || premioFinal.tipo_sonido === "sirena" ? "🚨🎉🚨" : "🎉"}</div>
                <h2 style={styles.resultTitle}>{premioFinal.tipo_sonido === "jackpot" ? "¡¡¡ JACKPOT !!!" : "HAS GANADO"}</h2>
                {premioImagen && <img src={premioImagen} alt="" style={styles.prizeImage} />}
                <strong style={styles.prizeName}>{premioFinal.nombre}</strong>
                {premioFinal.codigo && <p>Código premio: {premioFinal.codigo}</p>}
                <button type="button" onClick={reset} style={styles.nextButton}>SIGUIENTE CLIENTE</button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

const styles = {
  page: { minHeight: "100dvh", height: "100dvh", maxHeight: "100dvh", background: "radial-gradient(circle at top, rgba(30,64,175,.72), #020617 58%, #000 100%)", color: "#ffffff", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: "clamp(10px, 2vh, 22px)", boxSizing: "border-box", overflow: "hidden", display: "flex", flexDirection: "column" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, maxWidth: 1380, width: "100%", margin: "0 auto clamp(8px, 1.6vh, 18px)", flexShrink: 0 },
  brand: { color: "#ef4444", fontSize: "clamp(24px, 4vh, 38px)", fontWeight: 1000, letterSpacing: "-1px", lineHeight: 1 },
  title: { margin: "4px 0 0", fontSize: "clamp(16px, 2.4vh, 24px)", lineHeight: 1 },
  resetButton: { border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.08)", color: "#ffffff", borderRadius: 14, padding: "clamp(9px, 1.5vh, 13px) clamp(12px, 2vw, 17px)", display: "flex", alignItems: "center", gap: 8, fontWeight: 900, cursor: "pointer" },
  card: { maxWidth: 820, width: "min(820px, 100%)", margin: "auto", background: "rgba(255,255,255,.96)", color: "#0f172a", borderRadius: 28, padding: "clamp(18px, 4vh, 34px)", boxShadow: "0 30px 90px rgba(0,0,0,.45)", textAlign: "center", boxSizing: "border-box" },
  cardTitle: { margin: "0 0 20px", fontSize: "clamp(24px, 4vh, 34px)" },
  form: { display: "grid", gridTemplateColumns: "1fr auto", gap: 12 },
  input: { height: "clamp(58px, 8vh, 72px)", border: "3px solid #cbd5e1", borderRadius: 18, padding: "0 20px", fontSize: "clamp(24px, 5vh, 34px)", fontWeight: 1000, letterSpacing: 2, textTransform: "uppercase", outline: "none", minWidth: 0 },
  validateButton: { border: "none", borderRadius: 18, background: "#22c55e", color: "#ffffff", padding: "0 clamp(18px, 3vw, 28px)", fontSize: "clamp(17px, 2.5vh, 22px)", fontWeight: 1000, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  info: { fontSize: 22, fontWeight: 800, color: "#475569" },
  errorBox: { marginTop: 20, background: "#fee2e2", color: "#991b1b", borderRadius: 22, padding: 20, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", fontSize: 20 },
  usedBox: { marginTop: 20, background: "#ffedd5", color: "#9a3412", borderRadius: 22, padding: 20, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", fontSize: 20 },
  gameLayout: { maxWidth: 1380, width: "100%", minHeight: 0, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(220px, 300px) minmax(0, 1fr)", gap: "clamp(10px, 2vw, 22px)", alignItems: "stretch", flex: 1, overflow: "hidden" },
  sidePanel: { background: "rgba(255,255,255,.96)", color: "#0f172a", borderRadius: 24, padding: "clamp(14px, 2vh, 22px)", boxShadow: "0 20px 55px rgba(0,0,0,.32)", alignSelf: "start" },
  sideTitle: { margin: "8px 0", fontSize: "clamp(18px, 2.5vh, 24px)" },
  sideText: { fontSize: "clamp(14px, 2vh, 18px)", margin: "10px 0" },
  code: { background: "#020617", color: "#facc15", borderRadius: 16, padding: "clamp(12px, 2vh, 16px)", fontSize: "clamp(24px, 4vh, 34px)", fontWeight: 1000, textAlign: "center", letterSpacing: 2, margin: "12px 0" },
  wheelPanel: { minHeight: 0, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "clamp(8px, 1.6vh, 18px)", overflow: "hidden" },
  resultBox: { background: "rgba(255,255,255,.98)", color: "#0f172a", borderRadius: 26, padding: "clamp(16px, 2.5vh, 24px) clamp(20px, 4vw, 38px)", textAlign: "center", boxShadow: "0 20px 65px rgba(0,0,0,.38)", minWidth: "min(460px, 90vw)", maxWidth: "min(560px, 100%)", animation: "lojoPrizePop .55s ease-out", boxSizing: "border-box" },
  resultBoxJackpot: { background: "radial-gradient(circle at top, #fef3c7 0%, #facc15 40%, #dc2626 100%)", color: "#111827", boxShadow: "0 0 70px rgba(250,204,21,.72), 0 22px 85px rgba(220,38,38,.5)" },
  resultIcon: { fontSize: "clamp(42px, 7vh, 64px)", lineHeight: 1 },
  resultTitle: { margin: "6px 0 12px", fontSize: "clamp(26px, 5vh, 40px)", fontWeight: 1000, lineHeight: 1 },
  prizeImage: { width: "min(320px, 42vw)", maxHeight: "22vh", objectFit: "contain", borderRadius: 20, background: "#ffffff", padding: 10, boxShadow: "0 16px 45px rgba(0,0,0,.22)", marginBottom: 12 },
  prizeName: { display: "block", fontSize: "clamp(24px, 4.5vh, 38px)", fontWeight: 1000, lineHeight: 1.05 },
  nextButton: { marginTop: 16, border: "none", borderRadius: 999, padding: "14px 24px", background: "#0b1185", color: "#ffffff", fontSize: 18, fontWeight: 1000, cursor: "pointer" },
};

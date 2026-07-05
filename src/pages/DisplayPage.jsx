import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import StoreWheel from "../components/StoreWheel";

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

export default function DisplayPage() {
  const [premios, setPremios] = useState([]);
  const [premioFinal, setPremioFinal] = useState(null);
  const [girando, setGirando] = useState(false);

  useEffect(() => {
    cargarPremios();
  }, []);

  async function cargarPremios() {
    const hoy = new Date().toISOString().slice(0, 10);

    const { data: promociones, error: promocionError } = await supabase
      .from("promociones_ruleta")
      .select("*")
      .eq("activa", true)
      .order("created_at", { ascending: true });

    if (promocionError) {
      console.error(promocionError);
      setPremios([]);
      return;
    }

    const promocion = (promociones || []).find((item) => {
      const inicioOk = !item.fecha_inicio || item.fecha_inicio <= hoy;
      const finOk = !item.fecha_fin || item.fecha_fin >= hoy;
      return inicioOk && finOk;
    });

    if (!promocion?.id) {
      setPremios([]);
      return;
    }

    const { data, error } = await supabase
      .from("promociones_ruleta_premios")
      .select("*")
      .eq("promocion_id", promocion.id)
      .eq("activo", true)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setPremios([]);
      return;
    }

    setPremios(data || []);
  }

  const premioImagen = getPrizeImageUrl(premioFinal);
  const esJackpot =
    premioFinal?.tipo_sonido === "jackpot" || premioFinal?.tipo_sonido === "sirena";

  return (
    <main style={styles.page}>
      <style>
        {`
          @keyframes lojoDisplayFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }

          @keyframes lojoDisplayGlow {
            0%, 100% { opacity: .55; transform: scale(.98); }
            50% { opacity: 1; transform: scale(1.04); }
          }

          @keyframes lojoPrizePop {
            0% { transform: scale(.72); opacity: 0; }
            55% { transform: scale(1.07); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>

      <div style={styles.confettiLayer}>
        {Array.from({ length: 48 }, (_, index) => (
          <span
            key={index}
            style={{
              ...styles.confetti,
              left: `${(index * 29) % 100}%`,
              top: `${(index * 17) % 92}%`,
              background: ["#ef4444", "#facc15", "#22c55e", "#06b6d4", "#a855f7"][index % 5],
              animationDelay: `${index * 0.07}s`,
            }}
          />
        ))}
      </div>

      <section style={styles.header}>
        <div style={styles.kicker}>CASH LOJO</div>
        <h1 style={styles.title}>¡GIRA Y GANA!</h1>
        <p style={styles.subtitle}>La ruleta promocional se juega en tienda</p>
      </section>

      <section style={styles.stage}>
        <div style={styles.wheelWrap}>
          <StoreWheel
            premios={premios}
            girando={girando}
            premioFinal={premioFinal}
            onGirar={() => {}}
          />

          {!premioFinal && (
            <div style={styles.waitingBadge}>
              <span style={styles.pulseDot} />
              Esperando siguiente participante
            </div>
          )}
        </div>

        <div style={styles.side}>
          {!premioFinal ? (
            <div style={styles.waitPanel}>
              <div style={styles.bigIcon}>🎁</div>
              <h2 style={styles.waitTitle}>Premio sorpresa</h2>
              <p style={styles.waitText}>
                Escanea tu QR en caja y gira la ruleta delante de todos.
              </p>
            </div>
          ) : (
            <div
              style={{
                ...styles.resultBox,
                ...(esJackpot ? styles.resultBoxJackpot : {}),
              }}
            >
              <div style={styles.resultIcon}>{esJackpot ? "🚨🎉🚨" : "★ ¡ENHORABUENA! ★"}</div>

              {premioImagen ? (
                <div style={styles.imageGlow}>
                  <img src={premioImagen} alt="" style={styles.prizeImage} />
                </div>
              ) : (
                <div style={styles.giftPlaceholder}>🎁</div>
              )}

              <div style={styles.hasGanado}>HAS GANADO</div>
              <strong style={styles.prizeName}>{premioFinal.nombre}</strong>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100dvh",
    height: "100dvh",
    maxHeight: "100dvh",
    background:
      "radial-gradient(circle at 50% 0%, rgba(30,64,175,.58), transparent 36%), radial-gradient(circle at 0% 100%, rgba(250,204,21,.14), transparent 38%), #030712",
    color: "#ffffff",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: "clamp(14px, 2vh, 28px)",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  confettiLayer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.7,
    overflow: "hidden",
  },
  confetti: {
    position: "absolute",
    width: "clamp(9px, 1.1vw, 18px)",
    height: "clamp(9px, 1.1vw, 18px)",
    borderRadius: "4px",
    transform: "rotate(45deg)",
    boxShadow: "0 0 18px rgba(255,255,255,.22)",
    animation: "lojoDisplayFloat 3.2s ease-in-out infinite",
  },
  header: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    flexShrink: 0,
    marginBottom: "clamp(8px, 1.4vh, 18px)",
  },
  kicker: {
    color: "#ef4444",
    fontSize: "clamp(22px, 3.5vh, 42px)",
    fontWeight: 1000,
    lineHeight: 1,
    textShadow: "0 4px 18px rgba(0,0,0,.65)",
  },
  title: {
    margin: "4px 0",
    fontSize: "clamp(46px, 8.5vh, 112px)",
    lineHeight: 0.9,
    fontWeight: 1000,
    letterSpacing: "-0.055em",
    textShadow: "0 6px 28px rgba(0,0,0,.72)",
  },
  subtitle: {
    margin: 0,
    fontSize: "clamp(18px, 2.8vh, 34px)",
    color: "#e5e7eb",
    fontWeight: 800,
  },
  stage: {
    position: "relative",
    zIndex: 2,
    flex: 1,
    minHeight: 0,
    maxWidth: 1600,
    width: "100%",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.12fr) minmax(360px, .88fr)",
    gap: "clamp(18px, 2.8vw, 46px)",
    alignItems: "center",
    overflow: "hidden",
  },
  wheelWrap: {
    minHeight: 0,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "clamp(12px, 2vh, 24px)",
    overflow: "hidden",
  },
  waitingBadge: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: 999,
    padding: "clamp(12px, 1.8vh, 18px) clamp(22px, 4vw, 42px)",
    background: "rgba(15,23,42,.78)",
    border: "1px solid rgba(255,255,255,.16)",
    color: "#ffffff",
    fontSize: "clamp(18px, 2.6vh, 30px)",
    fontWeight: 1000,
    boxShadow: "0 18px 48px rgba(0,0,0,.36)",
  },
  pulseDot: {
    width: "clamp(14px, 2.2vh, 24px)",
    height: "clamp(14px, 2.2vh, 24px)",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 26px rgba(34,197,94,.95)",
    animation: "lojoDisplayGlow 1s infinite",
  },
  side: {
    minHeight: 0,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  waitPanel: {
    width: "100%",
    minHeight: "min(54vh, 620px)",
    borderRadius: 36,
    border: "1px solid rgba(255,255,255,.16)",
    background: "linear-gradient(180deg, rgba(15,23,42,.82), rgba(2,6,23,.92))",
    boxShadow: "0 28px 90px rgba(0,0,0,.45)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "clamp(26px, 4vh, 54px)",
    boxSizing: "border-box",
  },
  bigIcon: {
    width: "clamp(150px, 22vh, 260px)",
    height: "clamp(150px, 22vh, 260px)",
    borderRadius: "50%",
    background: "radial-gradient(circle, #fff7ed 0%, #facc15 60%, #b45309 100%)",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "clamp(76px, 13vh, 150px)",
    boxShadow: "0 0 80px rgba(250,204,21,.55)",
    marginBottom: "clamp(18px, 3vh, 32px)",
    animation: "lojoDisplayGlow 2.4s ease-in-out infinite",
  },
  waitTitle: {
    margin: 0,
    fontSize: "clamp(34px, 5.6vh, 68px)",
    lineHeight: 1,
    fontWeight: 1000,
    color: "#facc15",
    textShadow: "0 5px 18px rgba(0,0,0,.65)",
  },
  waitText: {
    margin: "clamp(14px, 2vh, 24px) 0 0",
    maxWidth: 560,
    fontSize: "clamp(20px, 3vh, 36px)",
    lineHeight: 1.18,
    color: "#ffffff",
    fontWeight: 800,
  },
  resultBox: {
    width: "100%",
    height: "100%",
    minHeight: "min(64vh, 680px)",
    borderRadius: 36,
    border: "1px solid rgba(255,255,255,.16)",
    background: "linear-gradient(180deg, rgba(15,23,42,.9), rgba(2,6,23,.96))",
    color: "#ffffff",
    padding: "clamp(24px, 4vh, 48px)",
    textAlign: "center",
    boxShadow: "0 28px 90px rgba(0,0,0,.52)",
    animation: "lojoPrizePop .55s ease-out",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  resultBoxJackpot: {
    background:
      "radial-gradient(circle at top, rgba(250,204,21,.28), rgba(127,29,29,.42) 42%, rgba(2,6,23,.97) 100%)",
    boxShadow:
      "0 0 90px rgba(250,204,21,.6), 0 28px 100px rgba(220,38,38,.42)",
  },
  resultIcon: {
    color: "#facc15",
    fontSize: "clamp(30px, 5vh, 58px)",
    fontWeight: 1000,
    lineHeight: 1,
    marginBottom: "clamp(16px, 2.6vh, 30px)",
    textShadow: "0 4px 24px rgba(250,204,21,.6)",
  },
  imageGlow: {
    width: "min(620px, 94%)",
    maxHeight: "43vh",
    borderRadius: 28,
    padding: 14,
    background: "#ffffff",
    boxShadow: "0 0 40px rgba(250,204,21,.82), 0 0 90px rgba(250,204,21,.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "clamp(18px, 3vh, 34px)",
  },
  prizeImage: {
    maxWidth: "100%",
    maxHeight: "40vh",
    objectFit: "contain",
    borderRadius: 20,
    background: "#ffffff",
  },
  giftPlaceholder: {
    width: "min(420px, 70%)",
    aspectRatio: "1",
    borderRadius: "50%",
    background: "radial-gradient(circle, #fff7ed, #facc15)",
    color: "#b45309",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "clamp(100px, 16vh, 180px)",
    boxShadow: "0 0 70px rgba(250,204,21,.68)",
    marginBottom: 28,
  },
  hasGanado: {
    fontSize: "clamp(28px, 4.8vh, 54px)",
    fontWeight: 1000,
    color: "#ffffff",
    marginBottom: 8,
    textShadow: "0 4px 18px rgba(0,0,0,.65)",
  },
  prizeName: {
    display: "block",
    color: "#facc15",
    fontSize: "clamp(40px, 7.2vh, 84px)",
    fontWeight: 1000,
    lineHeight: 1.02,
    textShadow: "0 5px 22px rgba(0,0,0,.72)",
  },
};

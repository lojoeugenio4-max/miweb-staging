import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";

const DRAW_SECONDS = 5;

function playRevealSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const now = context.currentTime;
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.13, now + index * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.45);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + index * 0.12);
      oscillator.stop(now + index * 0.12 + 0.5);
    });
    window.setTimeout(() => context.close(), 1200);
  } catch (error) {
    console.warn("No se pudo reproducir el sonido del Bingo", error);
  }
}

export default function BingoShow() {
  const [promotion, setPromotion] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [pendingNumber, setPendingNumber] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const revealTimer = useRef(null);

  const loadPromotion = useCallback(async () => {
    setLoading(true);
    setError("");
    const today = new Date().toISOString().slice(0, 10);
    const { data, error: promotionError } = await supabase
      .from("promociones_bingo")
      .select("id,nombre,edition_id,fecha_inicio,fecha_fin,activa")
      .eq("activa", true)
      .or(`fecha_inicio.is.null,fecha_inicio.lte.${today}`)
      .or(`fecha_fin.is.null,fecha_fin.gte.${today}`)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (promotionError) {
      setError("No se ha podido cargar el Bingo activo.");
      setLoading(false);
      return;
    }
    setPromotion(data || null);
    if (!data?.edition_id) {
      setNumbers([]);
      setLoading(false);
      return;
    }
    const { data: draws, error: drawsError } = await supabase
      .from("bingo_draws")
      .select("number,drawn_at")
      .eq("edition_id", data.edition_id)
      .order("drawn_at", { ascending: true });
    if (drawsError) setError("No se han podido cargar las bolas cantadas.");
    setNumbers((draws || []).map((draw) => Number(draw.number)));
    setLoading(false);
  }, []);

  useEffect(() => { loadPromotion(); }, [loadPromotion]);

  const revealNumber = useCallback((number) => {
    window.clearTimeout(revealTimer.current);
    setPendingNumber(number);
    setPhase("spinning");
    revealTimer.current = window.setTimeout(() => {
      setNumbers((current) => current.includes(number) ? current : [...current, number]);
      setPhase("reveal");
      playRevealSound();
      window.setTimeout(() => setPhase("idle"), 2600);
    }, DRAW_SECONDS * 1000);
  }, []);

  useEffect(() => {
    if (!promotion?.edition_id) return undefined;
    const channel = supabase
      .channel(`bingo-show-${promotion.edition_id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "bingo_draws",
        filter: `edition_id=eq.${promotion.edition_id}`,
      }, (payload) => {
        const number = Number(payload.new?.number);
        if (number) revealNumber(number);
      })
      .subscribe();
    return () => {
      window.clearTimeout(revealTimer.current);
      supabase.removeChannel(channel);
    };
  }, [promotion?.edition_id, revealNumber]);

  const lastNumber = numbers.at(-1) || null;
  const displayNumber = phase === "reveal" ? pendingNumber : lastNumber;
  const recent = useMemo(() => numbers.slice(-12).reverse(), [numbers]);

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (fullscreenError) {
      console.warn(fullscreenError);
    }
  }

  if (loading) return <main className="bingo-stage bingo-stage--center"><style>{styles}</style><div className="bingo-stage__loading">Preparando el bombo…</div></main>;

  if (!promotion) return <main className="bingo-stage bingo-stage--center"><style>{styles}</style><div className="bingo-stage__empty"><strong>No hay un Bingo activo</strong><span>La pantalla se activará cuando la promoción esté dentro de fecha.</span></div></main>;

  return (
    <main className={`bingo-stage bingo-stage--${phase}`}>
      <style>{styles}</style>
      <div className="bingo-stage__lights" aria-hidden="true" />
      <header className="bingo-stage__header">
        <div><span className="bingo-stage__eyebrow">Cash Lojo presenta</span><h1>{promotion.nombre || "Gran Bingo Cash Lojo"}</h1></div>
        <button type="button" onClick={toggleFullscreen}>⛶ Pantalla completa</button>
      </header>

      <section className="bingo-stage__main">
        <div className="bingo-machine" aria-label={phase === "spinning" ? "El bombo está girando" : "Bombo de Bingo"}>
          <div className="bingo-machine__crown"><i/><i/><i/><i/><i/></div>
          <div className="bingo-machine__axle bingo-machine__axle--left" />
          <div className="bingo-machine__axle bingo-machine__axle--right" />
          <div className={`bingo-machine__drum ${phase === "spinning" ? "is-spinning" : ""}`}>
            <div className="bingo-machine__mesh" />
            <div className="bingo-machine__balls">
              {Array.from({ length: 22 }, (_, index) => <i key={index} style={{ "--i": index }} />)}
            </div>
            <div className="bingo-machine__hub">CL</div>
          </div>
          <div className="bingo-machine__chute"><span /></div>
          <div className="bingo-machine__base"><span>CASH LOJO</span></div>
        </div>

        <div className="bingo-stage__result">
          <span className="bingo-stage__status">
            {phase === "spinning" ? "MEZCLANDO LAS 90 BOLAS" : phase === "reveal" ? "¡NUEVA BOLA!" : displayNumber ? "ÚLTIMA BOLA CANTADA" : "EL SORTEO VA A COMENZAR"}
          </span>
          <div className={`bingo-stage__hero-ball ${phase === "spinning" ? "is-hidden" : ""}`}>
            <small>Nº</small>{displayNumber || "–"}
          </div>
          <div className="bingo-stage__counter"><strong>{numbers.length}</strong><span>bolas de 90</span></div>
          {error && <p className="bingo-stage__error">{error}</p>}
        </div>
      </section>

      <footer className="bingo-stage__footer">
        <span>Últimas bolas</span>
        <div className="bingo-stage__recent">
          {recent.length ? recent.map((number, index) => <b className={index === 0 ? "is-last" : ""} key={number}>{number}</b>) : <em>Esperando la primera extracción…</em>}
        </div>
      </footer>
    </main>
  );
}

const styles = `
*{box-sizing:border-box}.bingo-stage{position:relative;min-height:100vh;overflow:hidden;padding:2.2vh 3vw 3vh;color:#fff;background:radial-gradient(circle at 50% 25%,#17356d 0,#071637 43%,#020817 100%);font-family:Inter,system-ui,sans-serif}.bingo-stage:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 49.8%,#e8bd4b18 50%,transparent 50.2%),repeating-linear-gradient(0deg,transparent 0 80px,#ffffff05 81px 82px);pointer-events:none}.bingo-stage__lights{position:absolute;inset:-20%;background:conic-gradient(from 0deg,transparent,#eac65316,transparent 13%,transparent 38%,#fff2a51c,transparent 50%);animation:stage-lights 18s linear infinite}.bingo-stage__header{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f9d87355;padding-bottom:1.4vh}.bingo-stage__eyebrow{color:#f9dc7f;font-size:clamp(12px,1.2vw,20px);font-weight:900;letter-spacing:.3em;text-transform:uppercase}.bingo-stage h1{margin:.3vh 0 0;font-family:Georgia,serif;font-size:clamp(30px,3.5vw,68px);line-height:1;color:#fff4c5;text-shadow:0 3px 0 #754900,0 0 26px #f6d36755}.bingo-stage__header button{padding:12px 18px;border:1px solid #f9d87377;border-radius:999px;color:#fff4c5;background:#07142daa;font-weight:900;cursor:pointer}.bingo-stage__main{position:relative;z-index:2;display:grid;grid-template-columns:minmax(480px,1.15fr) minmax(380px,.85fr);align-items:center;gap:4vw;min-height:70vh}.bingo-machine{position:relative;width:min(44vw,690px);height:min(65vh,700px);margin:auto;filter:drop-shadow(0 28px 24px #0009)}.bingo-machine__drum{position:absolute;left:12%;top:9%;width:76%;aspect-ratio:1;border:clamp(12px,1.5vw,24px) solid #bb7b12;border-radius:50%;background:radial-gradient(circle,#17366c 0 34%,#0b1c3c 66%,#020814 100%);box-shadow:inset 0 0 0 5px #ffe699,inset 0 0 35px #000,0 0 0 5px #6b3c04,0 0 45px #f4c84d55;overflow:hidden}.bingo-machine__drum:before,.bingo-machine__drum:after{content:"";position:absolute;inset:-10%;border:8px solid #e6b441;border-radius:50%;transform:rotate(58deg) scaleX(.33)}.bingo-machine__drum:after{transform:rotate(-58deg) scaleX(.33)}.bingo-machine__mesh{position:absolute;inset:0;border-radius:50%;background:repeating-linear-gradient(74deg,transparent 0 17px,#f8d46c88 18px 21px,transparent 22px 35px),repeating-linear-gradient(-74deg,transparent 0 18px,#8f5c0988 19px 22px,transparent 23px 36px);opacity:.78}.bingo-machine__balls i{position:absolute;width:8%;aspect-ratio:1;border-radius:50%;left:calc(12% + (var(--i) * 29)% / 21);top:calc(24% + (var(--i) * 47)% / 21);background:radial-gradient(circle at 32% 25%,#fff,#fff0a4 35%,#d89a19 80%);box-shadow:0 3px 6px #0008}.bingo-machine__balls i:nth-child(3n){top:63%}.bingo-machine__balls i:nth-child(4n){top:42%}.bingo-machine__balls i:nth-child(5n){left:45%}.bingo-machine__hub{position:absolute;inset:38%;display:grid;place-items:center;border:7px double #fff0a0;border-radius:50%;color:#fff4c3;background:radial-gradient(circle,#c68a19,#704300);font-family:Georgia,serif;font-size:clamp(25px,3vw,54px);font-weight:900;text-shadow:0 2px #542d00}.bingo-machine__drum.is-spinning{animation:drum-spin .42s linear infinite}.bingo-machine__drum.is-spinning .bingo-machine__balls{animation:balls-jump .24s ease-in-out infinite alternate}.bingo-machine__axle{position:absolute;top:43%;width:17%;height:7%;border:5px solid #6f4207;background:linear-gradient(#ffdf73,#a5640c,#ffe68c);z-index:-1}.bingo-machine__axle--left{left:0}.bingo-machine__axle--right{right:0}.bingo-machine__base{position:absolute;left:9%;right:9%;bottom:1%;height:15%;display:grid;place-items:center;border:8px ridge #bd8014;border-radius:40% 40% 12px 12px;background:linear-gradient(#f4c855,#a76408 48%,#5b3304);box-shadow:inset 0 3px #fff0a0}.bingo-machine__base span{padding:.6em 1.5em;border:3px solid #f9dc7e;border-radius:8px;color:#fff2b7;background:#07183d;font-family:Georgia,serif;font-size:clamp(16px,1.6vw,30px);font-weight:900;letter-spacing:.17em}.bingo-machine__chute{position:absolute;right:4%;top:55%;width:23%;height:26%;transform:rotate(-16deg);border:8px solid #9b5f0b;border-radius:12px;background:linear-gradient(90deg,#a7670b,#ffe179,#9f610a);z-index:3}.bingo-machine__chute span{position:absolute;right:-24%;bottom:-15%;width:70%;aspect-ratio:1;border:8px solid #a66a0d;border-radius:50%;background:#fff0af}.bingo-machine__crown{position:absolute;left:38%;top:0;width:24%;height:12%;display:flex;justify-content:center;align-items:flex-start;gap:4%;z-index:4}.bingo-machine__crown i{width:13%;height:75%;border-radius:50% 50% 5px 5px;background:linear-gradient(90deg,#a7650a,#ffe68b,#a7650a);transform-origin:bottom}.bingo-machine__crown i:nth-child(1){transform:rotate(-36deg)}.bingo-machine__crown i:nth-child(2){transform:rotate(-18deg)}.bingo-machine__crown i:nth-child(4){transform:rotate(18deg)}.bingo-machine__crown i:nth-child(5){transform:rotate(36deg)}.bingo-stage__result{display:flex;flex-direction:column;align-items:center;gap:1.8vh;text-align:center}.bingo-stage__status{min-height:1.5em;color:#f8dd86;font-size:clamp(18px,2vw,34px);font-weight:950;letter-spacing:.12em}.bingo-stage__hero-ball{width:min(25vw,360px);aspect-ratio:1;display:flex;align-items:center;justify-content:center;border:clamp(10px,1vw,18px) solid #fff7ce;border-radius:50%;color:#9d1014;background:radial-gradient(circle at 34% 27%,#fff 0 18%,#fff4c3 45%,#dfa52a 76%,#7b4302 100%);box-shadow:inset -22px -25px 30px #7a3d1644,0 18px 45px #000b,0 0 80px #f4ca4c77;font-family:Georgia,serif;font-size:clamp(100px,14vw,230px);font-weight:950;line-height:1;text-shadow:0 4px #fff}.bingo-stage__hero-ball small{position:absolute;margin-top:-.1em;margin-left:-2.7em;font:900 .1em Inter;color:#7e4a0b}.bingo-stage__hero-ball.is-hidden{color:transparent;animation:hero-pulse .55s ease-in-out infinite alternate}.bingo-stage__counter{display:flex;align-items:baseline;gap:10px;color:#d9e6ff}.bingo-stage__counter strong{font-size:clamp(34px,4vw,66px);color:#fff}.bingo-stage__counter span{font-size:clamp(17px,1.6vw,27px);font-weight:800}.bingo-stage__footer{position:relative;z-index:2;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:20px;padding-top:1.5vh;border-top:1px solid #f9d87355}.bingo-stage__footer>span{color:#f9dc7f;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.bingo-stage__recent{display:flex;gap:clamp(5px,.8vw,14px);align-items:center}.bingo-stage__recent b{width:clamp(42px,4.3vw,72px);aspect-ratio:1;display:grid;place-items:center;border:3px solid #e2b84c;border-radius:50%;color:#102552;background:#fff2b8;font-size:clamp(20px,2vw,34px);box-shadow:0 5px 12px #0007}.bingo-stage__recent b.is-last{color:#fff;background:#c91c24;transform:scale(1.13);box-shadow:0 0 24px #ffda5d}.bingo-stage__recent em{color:#abc0e8}.bingo-stage--reveal .bingo-stage__hero-ball{animation:ball-reveal .7s cubic-bezier(.18,.89,.32,1.28)}.bingo-stage--reveal{animation:stage-flash .6s ease}.bingo-stage--center{display:grid;place-items:center}.bingo-stage__loading,.bingo-stage__empty{position:relative;z-index:2;padding:40px;border:2px solid #e7c35c;border-radius:24px;background:#071638;text-align:center;font-size:28px}.bingo-stage__empty{display:flex;flex-direction:column;gap:10px}.bingo-stage__empty span{font-size:17px;color:#c9d6ef}.bingo-stage__error{color:#ffb4b4;font-weight:800}@keyframes drum-spin{to{transform:rotate(360deg)}}@keyframes balls-jump{to{transform:translateY(-8%) rotate(8deg)}}@keyframes stage-lights{to{transform:rotate(360deg)}}@keyframes hero-pulse{to{transform:scale(.9);filter:brightness(.6)}}@keyframes ball-reveal{0%{transform:translate(-65vw,-20vh) rotate(-720deg) scale(.2)}100%{transform:none}}@keyframes stage-flash{0%,100%{filter:none}35%{filter:brightness(1.45)}}
@media(max-width:900px){.bingo-stage{padding:18px}.bingo-stage__main{grid-template-columns:1fr;gap:0}.bingo-machine{width:min(82vw,520px);height:min(52vh,540px)}.bingo-stage__result{position:absolute;right:4%;top:27%;z-index:6}.bingo-stage__hero-ball{width:min(31vw,220px);font-size:clamp(70px,17vw,145px)}.bingo-stage__status{max-width:35vw;font-size:15px}.bingo-stage__counter{display:none}.bingo-stage__footer{grid-template-columns:1fr}.bingo-stage__recent{overflow:hidden}.bingo-stage__recent b:nth-child(n+8){display:none}}
`;

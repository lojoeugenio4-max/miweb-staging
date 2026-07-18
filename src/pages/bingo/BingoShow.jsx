import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";

const MIX_SECONDS = 4.7;
const DEMO_SEQUENCE = [72, 11, 38, 86, 24, 51, 3, 68, 33, 79, 15, 47];

function playMechanicalSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const now = context.currentTime;
    const motor = context.createOscillator();
    const motorGain = context.createGain();
    motor.type = "sawtooth";
    motor.frequency.setValueAtTime(42, now);
    motor.frequency.exponentialRampToValueAtTime(88, now + 1.1);
    motor.frequency.exponentialRampToValueAtTime(56, now + 4.1);
    motorGain.gain.setValueAtTime(0.0001, now);
    motorGain.gain.exponentialRampToValueAtTime(0.035, now + 0.15);
    motorGain.gain.setValueAtTime(0.035, now + 3.7);
    motorGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.55);
    motor.connect(motorGain).connect(context.destination);
    motor.start(now);
    motor.stop(now + 4.6);

    [0.45, 1.05, 1.7, 2.35, 3.05, 3.65].forEach((offset, index) => {
      const click = context.createOscillator();
      const gain = context.createGain();
      click.type = index % 2 ? "triangle" : "square";
      click.frequency.value = 190 + index * 18;
      gain.gain.setValueAtTime(0.025, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.065);
      click.connect(gain).connect(context.destination);
      click.start(now + offset);
      click.stop(now + offset + 0.07);
    });
    window.setTimeout(() => context.close(), 5200);
  } catch (error) {
    console.warn("No se pudo reproducir el sonido mecánico", error);
  }
}

function playRevealSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const now = context.currentTime;
    [392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.15, now + index * 0.1 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.7);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + index * 0.1);
      oscillator.stop(now + index * 0.1 + 0.72);
    });
    window.setTimeout(() => context.close(), 1500);
  } catch (error) {
    console.warn("No se pudo reproducir el sonido del Bingo", error);
  }
}

function DrumBalls({ spinning }) {
  return (
    <div className={`tv-drum__balls ${spinning ? "is-spinning" : ""}`} aria-hidden="true">
      {Array.from({ length: 54 }, (_, index) => {
        const angle = (index * 137.508) % 360;
        const radius = 10 + ((index * 31) % 36);
        const left = 50 + Math.cos((angle * Math.PI) / 180) * radius;
        const top = 51 + Math.sin((angle * Math.PI) / 180) * radius * 0.82;
        const delay = -((index * 0.071) % 2.8);
        return <i key={index} style={{ "--x": `${left}%`, "--y": `${top}%`, "--d": `${delay}s`, "--n": index + 1 }} />;
      })}
    </div>
  );
}

function Sparkles({ active }) {
  return (
    <div className={`tv-sparkles ${active ? "is-active" : ""}`} aria-hidden="true">
      {Array.from({ length: 34 }, (_, index) => <i key={index} style={{ "--i": index }} />)}
    </div>
  );
}

export default function BingoShow() {
  const demoMode = new URLSearchParams(window.location.search).get("demo") === "1";
  const [promotion, setPromotion] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [pendingNumber, setPendingNumber] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const revealTimer = useRef(null);
  const idleTimer = useRef(null);

  const loadPromotion = useCallback(async () => {
    setLoading(true);
    if (demoMode) {
      setPromotion({ id: "demo", edition_id: "demo-edition", nombre: "Gran Bingo Cash Lojo · Demostración" });
      setNumbers([5, 17, 29, 44, 63]);
      setLoading(false);
      return;
    }
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
  }, [demoMode]);

  useEffect(() => { loadPromotion(); }, [loadPromotion]);

  const revealNumber = useCallback((number) => {
    window.clearTimeout(revealTimer.current);
    window.clearTimeout(idleTimer.current);
    setPendingNumber(number);
    setPhase("starting");
    playMechanicalSound();
    window.setTimeout(() => setPhase("spinning"), 420);
    window.setTimeout(() => setPhase("extracting"), (MIX_SECONDS - 1.05) * 1000);
    revealTimer.current = window.setTimeout(() => {
      setNumbers((current) => current.includes(number) ? current : [...current, number]);
      setPhase("reveal");
      playRevealSound();
      idleTimer.current = window.setTimeout(() => setPhase("idle"), 3300);
    }, MIX_SECONDS * 1000);
  }, []);

  useEffect(() => {
    if (!demoMode || !promotion) return undefined;
    let index = 0;
    const startTimer = window.setTimeout(() => revealNumber(DEMO_SEQUENCE[index++]), 1500);
    const interval = window.setInterval(() => {
      revealNumber(DEMO_SEQUENCE[index % DEMO_SEQUENCE.length]);
      index += 1;
    }, 9800);
    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(interval);
    };
  }, [demoMode, promotion, revealNumber]);

  useEffect(() => {
    if (demoMode || !promotion?.edition_id) return undefined;
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
    return () => supabase.removeChannel(channel);
  }, [demoMode, promotion?.edition_id, revealNumber]);

  useEffect(() => () => {
    window.clearTimeout(revealTimer.current);
    window.clearTimeout(idleTimer.current);
  }, []);

  const lastNumber = numbers.at(-1) || null;
  const displayNumber = phase === "reveal" ? pendingNumber : lastNumber;
  const recent = useMemo(() => numbers.slice(-14).reverse(), [numbers]);
  const isMoving = ["starting", "spinning", "extracting"].includes(phase);

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (fullscreenError) {
      console.warn(fullscreenError);
    }
  }

  if (loading) return <main className="tv-stage tv-stage--center"><style>{styles}</style><div className="tv-loading"><span />Preparando el gran bombo…</div></main>;
  if (!promotion) return <main className="tv-stage tv-stage--center"><style>{styles}</style><div className="tv-empty"><strong>No hay un Bingo activo</strong><span>La pantalla se activará cuando la promoción esté dentro de fecha.</span></div></main>;

  return (
    <main className={`tv-stage tv-stage--${phase}`}>
      <style>{styles}</style>
      <div className="tv-stage__aurora" aria-hidden="true" />
      <div className="tv-stage__beams" aria-hidden="true"><i/><i/><i/><i/></div>
      <Sparkles active={phase === "reveal"} />

      <header className="tv-header">
        <div className="tv-brand">
          <span className="tv-brand__seal">CL</span>
          <div>
            <span className="tv-kicker">{demoMode ? "MODO DEMOSTRACIÓN" : "CASH LOJO PRESENTA"}</span>
            <h1>{promotion.nombre || "Gran Bingo Cash Lojo"}</h1>
          </div>
        </div>
        <button type="button" onClick={toggleFullscreen} aria-label="Alternar pantalla completa">⛶ <span>Pantalla completa</span></button>
      </header>

      <section className="tv-main">
        <div className={`tv-machine ${isMoving ? "is-moving" : ""}`}>
          <div className="tv-machine__halo" />
          <div className="tv-machine__top"><i/><i/><i/><i/><i/></div>
          <div className="tv-machine__pillar tv-machine__pillar--left"><span/></div>
          <div className="tv-machine__pillar tv-machine__pillar--right"><span/></div>
          <div className="tv-machine__axle" />

          <div className="tv-drum-wrap">
            <div className={`tv-drum ${isMoving ? "is-spinning" : ""}`}>
              <div className="tv-drum__glass" />
              <div className="tv-drum__ribs tv-drum__ribs--a" />
              <div className="tv-drum__ribs tv-drum__ribs--b" />
              <div className="tv-drum__ring tv-drum__ring--outer" />
              <div className="tv-drum__ring tv-drum__ring--inner" />
              <DrumBalls spinning={isMoving} />
              <div className="tv-drum__hub"><small>GRAN</small><b>CL</b><small>BINGO</small></div>
              <div className="tv-drum__shine" />
            </div>
          </div>

          <div className={`tv-extractor ${phase === "extracting" || phase === "reveal" ? "is-active" : ""}`}>
            <div className="tv-extractor__neck" />
            <div className="tv-extractor__track"><i /></div>
            <div className="tv-extractor__cup">
              <span>{phase === "extracting" ? pendingNumber : ""}</span>
            </div>
          </div>

          <div className="tv-machine__base">
            <div className="tv-machine__plaque"><span>CASH LOJO</span><small>GRAN BINGO</small></div>
            <i/><i/><i/>
          </div>
        </div>

        <div className="tv-result">
          <span className="tv-result__label">
            {phase === "starting" ? "ARRANCANDO EL BOMBO" : phase === "spinning" ? "MEZCLANDO LAS 90 BOLAS" : phase === "extracting" ? "EXTRAYENDO BOLA" : phase === "reveal" ? "¡NUEVA BOLA!" : displayNumber ? "ÚLTIMA BOLA CANTADA" : "EL SORTEO VA A COMENZAR"}
          </span>
          <div className={`tv-hero ${isMoving ? "is-waiting" : ""}`}>
            <div className="tv-hero__rim" />
            <div className="tv-hero__number">{isMoving ? "?" : displayNumber || "–"}</div>
            <span>NÚMERO</span>
          </div>
          <div className="tv-progress">
            <div><strong>{numbers.length}</strong><span>cantadas</span></div>
            <i><b style={{ width: `${(numbers.length / 90) * 100}%` }} /></i>
            <div><strong>{90 - numbers.length}</strong><span>restantes</span></div>
          </div>
          {error && <p className="tv-error">{error}</p>}
        </div>
      </section>

      <footer className="tv-footer">
        <div className="tv-footer__title"><span>Historial</span><strong>Últimas bolas cantadas</strong></div>
        <div className="tv-recent">
          {recent.length ? recent.map((number, index) => <b className={index === 0 ? "is-last" : ""} key={`${number}-${index}`}>{number}</b>) : <em>Esperando la primera extracción…</em>}
        </div>
        <div className="tv-live"><i/> EN DIRECTO</div>
      </footer>
    </main>
  );
}

const styles = `
*{box-sizing:border-box}html,body,#root{min-height:100%;margin:0}.tv-stage{--gold:#f7d56a;--deep:#030917;position:relative;min-height:100vh;overflow:hidden;padding:2vh 2.4vw 2.4vh;color:#fff;background:radial-gradient(ellipse at 50% 20%,#244b8a 0,#0a2351 30%,#04122d 61%,#020611 100%);font-family:Inter,system-ui,sans-serif}.tv-stage:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#0006,transparent 14%,transparent 86%,#0006),repeating-linear-gradient(0deg,transparent 0 79px,#ffffff05 80px 81px);pointer-events:none}.tv-stage__aurora{position:absolute;inset:-35%;background:conic-gradient(from 20deg,transparent 0 10%,#42b9ff14 16%,transparent 22% 42%,#ffd76c18 49%,transparent 56% 76%,#8a5cff16 83%,transparent 90%);animation:aurora 24s linear infinite}.tv-stage__beams{position:absolute;inset:0;overflow:hidden;pointer-events:none}.tv-stage__beams i{position:absolute;top:-20%;width:12%;height:90%;background:linear-gradient(to bottom,#fff7c522,transparent);filter:blur(8px);transform-origin:top}.tv-stage__beams i:nth-child(1){left:8%;transform:rotate(-20deg)}.tv-stage__beams i:nth-child(2){left:30%;transform:rotate(-8deg)}.tv-stage__beams i:nth-child(3){right:25%;transform:rotate(11deg)}.tv-stage__beams i:nth-child(4){right:5%;transform:rotate(22deg)}.tv-header{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding-bottom:1.4vh;border-bottom:1px solid #f8d86f55}.tv-brand{display:flex;align-items:center;gap:1vw}.tv-brand__seal{width:clamp(52px,4.5vw,82px);aspect-ratio:1;display:grid;place-items:center;border:4px double #ffe994;border-radius:50%;color:#fff2bd;background:radial-gradient(circle,#c99025,#6e3b05);box-shadow:0 0 25px #eec55866;font:900 clamp(22px,2.2vw,40px) Georgia}.tv-kicker{display:block;color:#f8dc82;font-size:clamp(10px,.9vw,16px);font-weight:900;letter-spacing:.32em}.tv-header h1{margin:.2vh 0 0;color:#fff7d0;font:900 clamp(28px,3vw,58px)/1 Georgia;text-shadow:0 3px 0 #654000,0 0 28px #f3cf6566}.tv-header button{display:flex;gap:8px;align-items:center;padding:11px 17px;border:1px solid #f8db7a77;border-radius:999px;color:#fff4c3;background:#071733b8;backdrop-filter:blur(10px);font-weight:900;cursor:pointer}.tv-main{position:relative;z-index:5;display:grid;grid-template-columns:minmax(520px,1.18fr) minmax(350px,.82fr);align-items:center;gap:3vw;min-height:70vh}.tv-machine{position:relative;width:min(47vw,760px);height:min(68vh,720px);margin:auto;filter:drop-shadow(0 32px 25px #000b);perspective:1000px}.tv-machine.is-moving{animation:machine-vibration .18s linear infinite}.tv-machine__halo{position:absolute;left:9%;top:4%;width:82%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#ffe37a22 0 42%,transparent 70%);filter:blur(16px);animation:halo 2.4s ease-in-out infinite alternate}.tv-machine__top{position:absolute;z-index:9;left:37%;top:0;width:26%;height:11%;display:flex;justify-content:center;gap:4%}.tv-machine__top i{width:14%;height:82%;border:2px solid #5c3407;border-radius:60% 60% 8px 8px;background:linear-gradient(90deg,#86500a,#ffe98f 45%,#a9660c);box-shadow:inset 2px 0 #fff4b1}.tv-machine__top i:nth-child(1){transform:rotate(-38deg);transform-origin:bottom}.tv-machine__top i:nth-child(2){transform:rotate(-19deg);transform-origin:bottom}.tv-machine__top i:nth-child(4){transform:rotate(19deg);transform-origin:bottom}.tv-machine__top i:nth-child(5){transform:rotate(38deg);transform-origin:bottom}.tv-machine__pillar{position:absolute;z-index:1;top:28%;width:13%;height:55%;border:5px ridge #c99020;border-radius:18px 18px 8px 8px;background:linear-gradient(90deg,#603505,#f8d86e 32%,#a4670e 69%,#4d2903);box-shadow:inset 0 0 15px #fff5a944}.tv-machine__pillar:before{content:"";position:absolute;inset:7% 25%;border-radius:10px;background:linear-gradient(#261600,#f8d66c,#342000);opacity:.55}.tv-machine__pillar--left{left:2%}.tv-machine__pillar--right{right:2%}.tv-machine__pillar span{position:absolute;left:-18%;right:-18%;bottom:-7%;height:13%;border:5px ridge #b87b18;border-radius:40% 40% 8px 8px;background:linear-gradient(#f4d26a,#875009)}.tv-machine__axle{position:absolute;z-index:2;left:7%;right:7%;top:42%;height:8%;border:5px ridge #bd821a;background:linear-gradient(#ffec9c,#9d6010 47%,#ffe37c);box-shadow:0 4px 10px #0009}.tv-drum-wrap{position:absolute;z-index:4;left:15%;top:7%;width:70%;aspect-ratio:1}.tv-drum{position:absolute;inset:0;border-radius:50%;transform-style:preserve-3d}.tv-drum.is-spinning{animation:drum-spin .72s linear infinite}.tv-drum__glass{position:absolute;inset:5%;border:clamp(11px,1.15vw,20px) solid #bb7a12;border-radius:50%;background:radial-gradient(circle at 42% 34%,#3476b755 0,#123d7655 37%,#061a3b99 68%,#010611dd 100%);box-shadow:inset 0 0 0 4px #ffe99d,inset 0 0 45px #000,0 0 0 6px #663705,0 0 45px #f4ca5355;overflow:hidden}.tv-drum__glass:after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse at 35% 24%,#ffffff48 0 5%,transparent 22%),linear-gradient(120deg,#ffffff18,transparent 28% 74%,#0007)}.tv-drum__ring{position:absolute;z-index:6;inset:4%;border:5px solid #e8b944;border-radius:50%;box-shadow:inset 0 0 0 3px #734307}.tv-drum__ring--inner{inset:13%;border-width:3px;opacity:.75}.tv-drum__ribs{position:absolute;z-index:5;inset:4%;border:8px solid #e2ad34;border-radius:50%;transform:rotate(58deg) scaleX(.31);box-shadow:0 0 0 3px #6a3b03}.tv-drum__ribs--b{transform:rotate(-58deg) scaleX(.31)}.tv-drum__balls{position:absolute;z-index:3;inset:11%;border-radius:50%;overflow:hidden}.tv-drum__balls i{position:absolute;left:var(--x);top:var(--y);width:7.4%;aspect-ratio:1;transform:translate(-50%,-50%);border:1px solid #8d5c10;border-radius:50%;background:radial-gradient(circle at 30% 24%,#fff 0 15%,#fff4bb 35%,#d99b22 73%,#734004 100%);box-shadow:inset -3px -4px 5px #5e2c1a55,0 3px 6px #000b}.tv-drum__balls i:after{content:var(--n);position:absolute;inset:24%;display:grid;place-items:center;border-radius:50%;color:#8b1717;background:#fff9d5;font-size:clamp(5px,.47vw,9px);font-weight:950}.tv-drum__balls.is-spinning i{animation:ball-chaos .46s ease-in-out infinite alternate;animation-delay:var(--d)}.tv-drum__hub{position:absolute;z-index:9;inset:36%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:8px double #fff0a4;border-radius:50%;color:#fff5c7;background:radial-gradient(circle at 35% 25%,#f3c753,#9c6110 58%,#4b2801);box-shadow:0 8px 18px #0009,0 0 25px #f7d66055;text-align:center}.tv-drum__hub b{font:900 clamp(29px,3.4vw,59px)/.85 Georgia}.tv-drum__hub small{font-size:clamp(7px,.7vw,12px);font-weight:900;letter-spacing:.16em}.tv-drum__shine{position:absolute;z-index:10;inset:7%;border-radius:50%;background:linear-gradient(116deg,transparent 19%,#fff6c42a 31%,transparent 43%);pointer-events:none}.tv-extractor{position:absolute;z-index:12;right:4%;top:46%;width:28%;height:31%;transform:rotate(-13deg)}.tv-extractor__neck{position:absolute;left:0;top:0;width:39%;height:50%;border:7px ridge #b77a17;border-radius:10px;background:linear-gradient(90deg,#754306,#ffe589,#975b0b)}.tv-extractor__track{position:absolute;left:23%;top:34%;width:65%;height:26%;border:7px ridge #b77a17;border-radius:5px 22px 22px 5px;background:linear-gradient(#fff0a5,#a66b12,#ffe58c);overflow:hidden}.tv-extractor__track i{position:absolute;left:-24%;top:14%;width:26%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 30% 25%,#fff,#ffe87e 52%,#9c5707);opacity:0}.tv-extractor.is-active .tv-extractor__track i{opacity:1;animation:track-ball 1.05s cubic-bezier(.2,.8,.2,1) forwards}.tv-extractor__cup{position:absolute;right:-2%;bottom:0;width:47%;aspect-ratio:1;border:8px ridge #b67a18;border-radius:50%;background:radial-gradient(circle,#fff8cd,#d5a02a 62%,#714007);box-shadow:0 10px 18px #0008}.tv-extractor__cup span{position:absolute;inset:20%;display:grid;place-items:center;border-radius:50%;color:#a31518;background:#fff8dc;font:900 clamp(22px,2.5vw,46px) Georgia;opacity:0}.tv-extractor.is-active .tv-extractor__cup span{animation:cup-number .8s .72s forwards}.tv-machine__base{position:absolute;z-index:8;left:8%;right:8%;bottom:0;height:17%;border:8px ridge #ba7c15;border-radius:46% 46% 12px 12px;background:linear-gradient(#f6d56a,#a5640b 48%,#553003);box-shadow:inset 0 4px #fff2a0,0 14px 18px #0009}.tv-machine__base>i{position:absolute;bottom:-10%;width:12%;height:22%;border-radius:5px;background:linear-gradient(90deg,#754306,#e6b946,#6a3904)}.tv-machine__base>i:nth-of-type(1){left:10%}.tv-machine__base>i:nth-of-type(2){left:44%}.tv-machine__base>i:nth-of-type(3){right:10%}.tv-machine__plaque{position:absolute;left:25%;right:25%;top:18%;bottom:18%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:4px double #fbe38f;border-radius:9px;color:#fff4c7;background:linear-gradient(#0c2a5a,#05142f);box-shadow:inset 0 0 14px #4b83c655}.tv-machine__plaque span{font:900 clamp(15px,1.6vw,29px) Georgia;letter-spacing:.16em}.tv-machine__plaque small{color:#f4d87f;font-size:clamp(7px,.65vw,12px);font-weight:900;letter-spacing:.28em}.tv-result{position:relative;display:flex;flex-direction:column;align-items:center;gap:1.7vh;text-align:center}.tv-result__label{min-height:1.5em;color:#f9de83;font-size:clamp(16px,1.8vw,31px);font-weight:950;letter-spacing:.14em;text-shadow:0 0 20px #f7ce5d55}.tv-hero{position:relative;width:min(25vw,355px);aspect-ratio:1;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle at 34% 26%,#fff 0 15%,#fff8d5 33%,#e8b640 65%,#8a4d05 100%);box-shadow:inset -25px -29px 34px #6b321f44,0 25px 50px #000c,0 0 85px #f6d45f66;transition:.35s}.tv-hero:before{content:"";position:absolute;inset:5%;border:3px solid #fff8d1;border-radius:50%;box-shadow:inset 0 0 20px #7a450755}.tv-hero__rim{position:absolute;inset:-4%;border:clamp(8px,.8vw,14px) double #fff1a0;border-radius:50%;box-shadow:0 0 0 5px #8d5408}.tv-hero__number{position:relative;z-index:2;color:#a4171c;font:950 clamp(100px,13vw,220px)/1 Georgia;text-shadow:0 4px #fff,0 8px 8px #7a240322}.tv-hero>span{position:absolute;z-index:3;bottom:17%;color:#75420a;font-size:clamp(8px,.75vw,14px);font-weight:950;letter-spacing:.28em}.tv-hero.is-waiting{transform:scale(.92);filter:saturate(.65) brightness(.72);animation:waiting-pulse .6s ease-in-out infinite alternate}.tv-hero.is-waiting .tv-hero__number{color:#6e4c20}.tv-progress{width:min(31vw,470px);display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:15px}.tv-progress div{display:flex;flex-direction:column}.tv-progress strong{font-size:clamp(25px,2.8vw,47px);line-height:1}.tv-progress span{color:#bed0ef;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.tv-progress>i{height:8px;border:1px solid #f6d66c66;border-radius:999px;background:#0007;overflow:hidden}.tv-progress>i b{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#c18316,#ffe887);box-shadow:0 0 12px #ffe37a}.tv-error{color:#ffc3c3;font-weight:800}.tv-footer{position:relative;z-index:20;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:1.5vw;padding-top:1.5vh;border-top:1px solid #f8d86f55}.tv-footer__title{display:flex;flex-direction:column}.tv-footer__title span{color:#f7d979;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.26em}.tv-footer__title strong{font-size:clamp(13px,1vw,18px)}.tv-recent{display:flex;align-items:center;justify-content:flex-start;gap:clamp(5px,.65vw,11px);overflow:hidden}.tv-recent b{flex:0 0 auto;width:clamp(39px,3.8vw,66px);aspect-ratio:1;display:grid;place-items:center;border:3px solid #d5a533;border-radius:50%;color:#102654;background:radial-gradient(circle at 34% 25%,#fff,#ffe99d 68%,#bd7c13);box-shadow:0 5px 12px #0008;font:900 clamp(18px,1.8vw,31px) Georgia}.tv-recent b.is-last{color:#fff;background:radial-gradient(circle at 34% 25%,#ef6367,#bd1018 65%,#650008);transform:scale(1.12);box-shadow:0 0 25px #ffd45b}.tv-recent em{color:#aec2e7}.tv-live{display:flex;align-items:center;gap:7px;color:#ffd3d3;font-size:12px;font-weight:950;letter-spacing:.1em}.tv-live i{width:10px;aspect-ratio:1;border-radius:50%;background:#ff2636;box-shadow:0 0 12px #ff2636;animation:live 1s infinite}.tv-sparkles{position:absolute;z-index:30;inset:0;pointer-events:none}.tv-sparkles i{position:absolute;left:50%;top:47%;width:8px;aspect-ratio:1;border-radius:50%;background:#ffe684;opacity:0}.tv-sparkles.is-active i{animation:spark 1.3s ease-out forwards;animation-delay:calc(var(--i) * .018s)}.tv-stage--reveal .tv-hero{animation:hero-reveal .8s cubic-bezier(.18,.89,.32,1.25)}.tv-stage--reveal{animation:stage-flash .75s ease}.tv-stage--center{display:grid;place-items:center}.tv-loading,.tv-empty{position:relative;z-index:2;padding:38px 48px;border:2px solid #e7c35c;border-radius:24px;background:#071638dd;box-shadow:0 20px 60px #0008;text-align:center;font-size:28px}.tv-loading{display:flex;align-items:center;gap:18px}.tv-loading span{width:34px;aspect-ratio:1;border:4px solid #f2d36b44;border-top-color:#f2d36b;border-radius:50%;animation:spin 1s linear infinite}.tv-empty{display:flex;flex-direction:column;gap:10px}.tv-empty span{font-size:17px;color:#c9d6ef}
@keyframes aurora{to{transform:rotate(360deg)}}@keyframes halo{to{transform:scale(1.08);opacity:.55}}@keyframes drum-spin{to{transform:rotate(360deg)}}@keyframes machine-vibration{25%{transform:translateX(1px) rotate(.08deg)}75%{transform:translateX(-1px) rotate(-.08deg)}}@keyframes ball-chaos{0%{translate:-8px 10px;rotate:-25deg}100%{translate:12px -14px;rotate:32deg}}@keyframes track-ball{0%{left:-24%;transform:rotate(0)}100%{left:76%;transform:rotate(620deg)}}@keyframes cup-number{to{opacity:1;transform:rotate(13deg)}}@keyframes waiting-pulse{to{transform:scale(.87);filter:saturate(.55) brightness(.58)}}@keyframes hero-reveal{0%{transform:translate(-62vw,-18vh) rotate(-780deg) scale(.15)}100%{transform:none}}@keyframes stage-flash{35%{filter:brightness(1.45)}}@keyframes live{50%{opacity:.25}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes spark{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(calc((var(--i) - 17) * 4vw),calc(-18vh + (var(--i) % 7) * 6vh)) scale(0)}}
@media(max-width:950px){.tv-stage{padding:15px}.tv-header button span{display:none}.tv-main{grid-template-columns:1fr;min-height:76vh}.tv-machine{width:min(86vw,600px);height:min(57vh,590px);transform:translateX(-8%)}.tv-result{position:absolute;right:2%;top:25%;z-index:20}.tv-hero{width:min(32vw,235px)}.tv-hero__number{font-size:clamp(72px,17vw,145px)}.tv-progress{display:none}.tv-result__label{max-width:35vw;font-size:13px}.tv-footer{grid-template-columns:auto 1fr}.tv-live{display:none}.tv-recent b:nth-child(n+9){display:none}}`;

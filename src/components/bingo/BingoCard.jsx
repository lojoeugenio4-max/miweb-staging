import React, { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Gift, UserRound, Volume2, VolumeX } from "lucide-react";
import logoBingo from "../../assets/logo-bingo.png";

function normalizarNumeros(numbers) {
  return new Set(Array.isArray(numbers) ? numbers.map(Number).filter(Number.isFinite) : []);
}

function normalizarFilas(card) {
  if (!Array.isArray(card)) return [];
  return card.slice(0, 3).map((row) => {
    const fila = Array.isArray(row) ? row.slice(0, 9) : [];
    return [...fila, ...Array(Math.max(0, 9 - fila.length)).fill(null)].slice(0, 9);
  });
}

function tieneLinea(rows, markedNumbers) {
  return rows.some((row) => {
    const nums = row.map(Number).filter(Number.isFinite);
    return nums.length > 0 && nums.every((number) => markedNumbers.has(number));
  });
}

function tieneBingo(rows, markedNumbers) {
  const nums = rows.flat().map(Number).filter(Number.isFinite);
  return nums.length > 0 && nums.every((number) => markedNumbers.has(number));
}

function PrizePanel({ title, prize, won, special = false }) {
  const active = Boolean(prize?.active);
  const name = active ? prize?.name?.trim() || "Premio configurado" : "Sin premio activo";
  const message = active
    ? prize?.message?.trim() || "Consulta las condiciones del sorteo."
    : "El establecimiento todavía no ha activado este premio.";

  return (
    <section className={`cl-prize ${special ? "cl-prize--special" : ""} ${won ? "cl-prize--won" : ""}`}>
      {special && <div className="cl-prize__badge">★ PREMIO ESPECIAL ★</div>}
      <div className="cl-prize__title">{title}</div>
      <div className="cl-prize__body">
        <div className="cl-prize__media">
          {active && prize?.image ? (
            <img src={prize.image} alt={name} />
          ) : (
            <div className="cl-prize__placeholder"><Gift size={52} /><span>PREMIO</span></div>
          )}
        </div>
        <div className="cl-prize__copy">
          <strong>{name}</strong>
          <p>{message}</p>
          {won && <div className="cl-prize__won"><CheckCircle2 size={18} /> CONSEGUIDO</div>}
        </div>
      </div>
    </section>
  );
}

export default function BingoCard({
  card = [],
  drawnNumbers = [],
  customerName = "",
  linePrize = null,
  bingoPrize = null,
  specialPrize = null,
  endDate = "",
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const rows = useMemo(() => normalizarFilas(card), [card]);
  const markedNumbers = useMemo(() => normalizarNumeros(drawnNumbers), [drawnNumbers]);
  const lineCompleted = useMemo(() => tieneLinea(rows, markedNumbers), [rows, markedNumbers]);
  const bingoCompleted = useMemo(() => tieneBingo(rows, markedNumbers), [rows, markedNumbers]);
  const markedCount = rows.flat().filter((value) => Number.isFinite(Number(value)) && markedNumbers.has(Number(value))).length;
  const drawnCount = Array.isArray(drawnNumbers) ? new Set(drawnNumbers.map(Number).filter(Number.isFinite)).size : 0;
  const specialWon = Boolean(bingoCompleted && specialPrize?.active && specialPrize?.maxBalls > 0 && drawnCount <= specialPrize.maxBalls);
  const formattedEndDate = endDate ? new Date(`${endDate}T12:00:00`).toLocaleDateString("es-ES") : "Sin fecha límite";

  return (
    <section className="cl-bingo" aria-label="Cartón de Bingo Cash Lojo">
      <style>{styles}</style>

      <header className="cl-bingo__header">
        <div className="cl-brand">
          <div className="cl-brand__logo"><img src={logoBingo} alt="Cash Lojo" /></div>
          <div className="cl-brand__words">
            <div className="cl-brand__name"><span>CASH</span><b>LOJO</b></div>
            <div className="cl-brand__ribbon">BINGO</div>
          </div>
        </div>
        <div className="cl-slogan"><i></i><span><b>Gana</b></span><i></i></div>
      </header>

      <main className="cl-bingo__main">
        <section className="cl-card-area">
          <div className="cl-card-grid">
            {rows.length ? rows.map((row, rowIndex) => (
              <div className="cl-card-row" key={rowIndex}>
                {row.map((value, columnIndex) => {
                  const number = Number(value);
                  const filled = value !== null && value !== undefined && value !== "" && Number.isFinite(number);
                  const marked = filled && markedNumbers.has(number);
                  return (
                    <div className={`cl-card-cell ${marked ? "cl-card-cell--marked" : ""}`} key={`${rowIndex}-${columnIndex}`}>
                      {filled ? number : ""}
                    </div>
                  );
                })}
              </div>
            )) : <div className="cl-card-empty">No hay ningún cartón disponible.</div>}
          </div>

          <div className="cl-card-actions">
            <div className="cl-card-status"><CheckCircle2 size={23} /> CARTÓN ÚNICO</div>
            <div className={`cl-check ${bingoCompleted ? "cl-check--won" : ""}`}>
              {bingoCompleted ? "¡BINGO!" : lineCompleted ? "¡LÍNEA!" : `${markedCount} NÚMEROS MARCADOS`}
            </div>
            <button type="button" className="cl-sound" onClick={() => setSoundEnabled((value) => !value)} aria-label={soundEnabled ? "Desactivar sonido" : "Activar sonido"}>
              {soundEnabled ? <Volume2 size={27} /> : <VolumeX size={27} />}
            </button>
          </div>
        </section>

        <aside className="cl-prizes" aria-label="Premios del Bingo">
          <PrizePanel title="PREMIO POR LÍNEA" prize={linePrize} won={lineCompleted} />
          <PrizePanel title="PREMIO POR BINGO" prize={bingoPrize} won={bingoCompleted} />
          {specialPrize?.active && <PrizePanel special title={`BINGO EN ${specialPrize.maxBalls} BOLAS O MENOS`} prize={specialPrize} won={specialWon} />}
        </aside>
      </main>

      <footer className="cl-bingo__footer">
        <div><UserRound /><span><small>JUGADOR:</small><strong>{customerName || "Cliente Cash Lojo"}</strong></span></div>
        <div><Clock3 /><span><small>FECHA LÍMITE:</small><strong>{formattedEndDate}</strong></span></div>
        <div><CheckCircle2 /><span><small>BOLAS CANTADAS:</small><strong>{drawnCount}</strong></span></div>
        <div><Gift /><span><small>PREMIOS:</small><strong>{[linePrize?.active, bingoPrize?.active, specialPrize?.active].filter(Boolean).length} activos</strong></span></div>
      </footer>
    </section>
  );
}

const styles = `
.cl-bingo, .cl-bingo * { box-sizing: border-box; }
.cl-bingo { width:100%; min-width:0; overflow:hidden; border:4px solid #f02620; border-radius:30px; padding:14px; color:#fff; background:radial-gradient(circle at 45% 20%,#0b428d 0,#082d68 30%,#061d4c 72%,#051637 100%); box-shadow:0 20px 55px rgba(0,20,65,.35); font-family:Arial,Helvetica,sans-serif; }
.cl-bingo__header { min-height:154px; display:flex; align-items:center; justify-content:space-between; gap:24px; padding:4px 18px 12px; }
.cl-brand { display:flex; align-items:center; gap:24px; min-width:0; }
.cl-brand__logo { width:126px; height:134px; padding:5px; flex:none; overflow:hidden; border:4px solid #fff; border-radius:7px; background:#09235a; }
.cl-brand__logo img { width:100%; height:100%; display:block; object-fit:cover; object-position:center; }
.cl-brand__words { width:min(500px,40vw); min-width:300px; }
.cl-brand__name { white-space:nowrap; font-size:clamp(42px,5.6vw,78px); font-weight:950; font-style:italic; letter-spacing:-4px; line-height:.9; text-shadow:0 2px 1px rgba(0,0,0,.16); }
.cl-brand__name span { color:#fffdf4; } .cl-brand__name b { color:#e91817; margin-left:16px; }
.cl-brand__ribbon { width:100%; margin-top:17px; padding:5px 50px 6px; color:#fff; background:linear-gradient(100deg,#e71919,#ec281b 68%,transparent 69%); clip-path:polygon(9% 0,100% 0,88% 100%,0 100%); text-align:center; font-size:clamp(28px,3vw,43px); font-weight:950; font-style:italic; letter-spacing:10px; line-height:1; }
.cl-slogan { flex:1; display:flex; align-items:center; justify-content:center; gap:16px; min-width:300px; font-family:Georgia,serif; font-size:clamp(24px,3vw,45px); font-weight:700; font-style:italic; white-space:nowrap; }
.cl-slogan i { width:min(100px,7vw); height:3px; display:block; background:#e71b1b; } .cl-slogan b { color:#ef211d; }
.cl-bingo__main { display:grid; grid-template-columns:minmax(0,1.42fr) minmax(390px,1fr); gap:12px; padding:10px 0 12px; border-top:1px solid rgba(31,150,232,.55); border-bottom:1px solid rgba(31,150,232,.35); }
.cl-card-area { min-width:0; display:flex; flex-direction:column; gap:16px; padding:0 2px 0 0; }
.cl-card-grid { overflow:hidden; border:5px solid #fff1cd; border-radius:27px; background:#fff9e9; box-shadow:inset 0 0 0 2px #0b3677; }
.cl-card-row { display:grid; grid-template-columns:repeat(9,minmax(0,1fr)); }
.cl-card-cell { min-height:clamp(84px,10.7vw,154px); display:flex; align-items:center; justify-content:center; border-right:2px solid #123b78; border-bottom:2px solid #123b78; color:#050505; background:linear-gradient(120deg,#fffdf6,#fff8e7); font-size:clamp(31px,4.7vw,67px); font-weight:950; line-height:1; transition:.2s ease; }
.cl-card-row:last-child .cl-card-cell { border-bottom:0; } .cl-card-cell:last-child { border-right:0; }
.cl-card-cell--marked { color:#fff; background:radial-gradient(circle,#f24135,#d90f10); box-shadow:inset 0 0 0 6px rgba(255,255,255,.72); text-shadow:0 2px 2px rgba(0,0,0,.25); }
.cl-card-empty { min-height:360px; display:grid; place-items:center; color:#173b75; font-size:20px; font-weight:900; }
.cl-card-actions { display:grid; grid-template-columns:minmax(170px,240px) minmax(220px,1fr) 88px; gap:38px; align-items:center; padding:0 12px 4px; }
.cl-card-status,.cl-check,.cl-sound { height:76px; display:flex; align-items:center; justify-content:center; border:2px solid #f5deb0; border-radius:18px; font-weight:900; }
.cl-card-status { gap:10px; color:#fff; background:linear-gradient(#ef2d25,#d70e12); font-size:18px; }
.cl-check { color:#fff; background:linear-gradient(#708095,#526274); font-size:22px; text-align:center; }
.cl-check--won { background:linear-gradient(#f2261f,#c9070b); }
.cl-sound { width:88px; padding:0; color:#fff; background:#082d6a; cursor:pointer; }
.cl-prizes { min-width:0; display:grid; grid-template-rows:1fr 1fr; gap:13px; }
.cl-prize { min-height:250px; display:flex; flex-direction:column; overflow:hidden; border:3px solid #f5dca8; border-radius:25px; padding:10px; background:linear-gradient(#103f83,#092c68); }
.cl-prize__title { padding:2px 8px 12px; text-align:center; font-size:clamp(19px,2.1vw,31px); font-weight:950; }
.cl-prize__body { flex:1; min-height:0; display:grid; grid-template-columns:minmax(170px,40%) 1fr; align-items:center; gap:18px; overflow:hidden; padding:14px 18px; border-radius:20px; color:#090909; background:linear-gradient(120deg,#fffdf5,#fff7e5); }
.cl-prize__media { height:100%; min-height:168px; display:grid; place-items:center; }
.cl-prize__media img { width:100%; height:100%; max-height:205px; display:block; object-fit:contain; }
.cl-prize__placeholder { width:100%; height:100%; min-height:160px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; border-radius:15px; color:#758096; background:#eee8dc; font-weight:900; }
.cl-prize__copy { min-width:0; } .cl-prize__copy strong { display:block; font-size:clamp(20px,2.25vw,34px); line-height:1.1; text-transform:uppercase; overflow-wrap:anywhere; }
.cl-prize__copy p { margin:24px 0 0; font-size:clamp(15px,1.65vw,23px); line-height:1.4; }
.cl-prize__won { width:max-content; max-width:100%; margin-top:15px; display:flex; align-items:center; gap:7px; padding:7px 10px; border-radius:999px; color:#fff; background:#d41016; font-size:13px; font-weight:950; }
.cl-prize--won { box-shadow:0 0 0 4px rgba(255,226,111,.38),0 0 28px rgba(255,221,85,.4); }
.cl-prize--special { position:relative; border:4px solid #ffd34e; background:linear-gradient(145deg,#6a168f 0%,#a82572 42%,#d76a19 100%); box-shadow:0 0 0 3px rgba(255,211,78,.2),0 12px 30px rgba(0,0,0,.3),inset 0 0 24px rgba(255,255,255,.12); }
.cl-prize--special::before { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 10% 15%,rgba(255,255,255,.34) 0 2px,transparent 3px),radial-gradient(circle at 87% 28%,rgba(255,226,113,.5) 0 3px,transparent 4px),radial-gradient(circle at 72% 82%,rgba(255,255,255,.28) 0 2px,transparent 3px); background-size:48px 48px,66px 66px,58px 58px; }
.cl-prize--special .cl-prize__title { position:relative; color:#fff8c5; text-shadow:0 2px 4px rgba(0,0,0,.45); font-size:clamp(21px,2.25vw,33px); letter-spacing:.4px; }
.cl-prize--special .cl-prize__body { position:relative; border:3px solid #ffd34e; background:linear-gradient(130deg,#fffdf0,#fff0b8); box-shadow:inset 0 0 22px rgba(255,190,30,.18); }
.cl-prize--special .cl-prize__copy strong { color:#75136f; }
.cl-prize__badge { position:relative; z-index:1; width:max-content; max-width:calc(100% - 20px); margin:-2px auto 5px; padding:6px 16px; border:2px solid #fff0a4; border-radius:999px; color:#4f164f; background:linear-gradient(#ffe987,#ffc62d); box-shadow:0 4px 12px rgba(0,0,0,.3); font-size:13px; font-weight:950; letter-spacing:1.6px; text-align:center; }

.cl-bingo__footer { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:8px; padding:16px 18px 2px; border:1px solid rgba(255,244,217,.7); border-radius:18px; background:rgba(2,23,63,.45); }
.cl-bingo__footer > div { min-width:0; display:flex; align-items:center; justify-content:center; gap:15px; } .cl-bingo__footer svg { width:41px; height:41px; flex:none; }
.cl-bingo__footer span { min-width:0; display:flex; flex-direction:column; } .cl-bingo__footer small { font-size:13px; font-weight:900; } .cl-bingo__footer strong { margin-top:4px; overflow:hidden; font-size:18px; font-weight:500; text-overflow:ellipsis; white-space:nowrap; }
@media(max-width:1100px){ .cl-bingo__header{min-height:120px}.cl-brand__logo{width:92px;height:98px}.cl-brand__words{min-width:250px}.cl-slogan{min-width:240px}.cl-bingo__main{grid-template-columns:minmax(0,1.2fr) minmax(330px,1fr)}.cl-prize__body{grid-template-columns:130px 1fr}.cl-card-actions{gap:14px}.cl-bingo__footer strong{font-size:15px} }
@media(max-width:820px){ .cl-bingo{padding:9px;border-radius:20px}.cl-bingo__header{justify-content:center;padding:4px 5px 12px}.cl-slogan{width:100%;min-width:0}.cl-bingo__main{grid-template-columns:1fr}.cl-card-cell{min-height:64px}.cl-card-actions{grid-template-columns:1fr 1fr 62px;padding:0;gap:8px}.cl-card-status,.cl-check,.cl-sound{height:58px;border-radius:13px}.cl-sound{width:62px}.cl-prizes{grid-template-columns:1fr 1fr;grid-template-rows:auto}.cl-prize{min-height:260px}.cl-prize__body{grid-template-columns:110px 1fr;padding:10px}.cl-bingo__footer{grid-template-columns:1fr 1fr}.cl-brand__name{letter-spacing:-2px}.cl-brand__ribbon{letter-spacing:6px} }
@media(max-width:560px){ .cl-brand{gap:10px}.cl-brand__logo{width:66px;height:72px;border-width:2px}.cl-brand__words{width:auto;min-width:205px}.cl-brand__name{font-size:34px}.cl-brand__name b{margin-left:7px}.cl-brand__ribbon{margin-top:9px;padding:4px 24px;font-size:22px;letter-spacing:4px}.cl-slogan{font-size:20px}.cl-slogan i{width:28px}.cl-card-cell{min-height:44px;font-size:22px;border-width:1px}.cl-card-grid{border-width:3px;border-radius:17px}.cl-card-actions{grid-template-columns:1fr 58px}.cl-card-status{display:none}.cl-check{font-size:14px}.cl-prizes{grid-template-columns:1fr}.cl-prize{min-height:230px}.cl-prize__title{font-size:20px}.cl-prize__body{grid-template-columns:105px 1fr}.cl-prize__copy strong{font-size:18px}.cl-prize__copy p{margin-top:10px;font-size:14px}.cl-bingo__footer{grid-template-columns:1fr;padding:12px}.cl-bingo__footer>div{justify-content:flex-start}.cl-bingo__footer svg{width:28px;height:28px} }
`;

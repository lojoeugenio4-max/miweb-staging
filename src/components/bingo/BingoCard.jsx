import React, { useMemo, useState } from "react";
import { CalendarDays, Clock3, Euro, Users, Volume2, VolumeX } from "lucide-react";
import logoBingo from "../../assets/logo-bingo.png";

function normalizeNumbers(numbers) {
  return new Set(Array.isArray(numbers) ? numbers.map(Number).filter(Number.isFinite) : []);
}

function PrizePanel({ title, prize }) {
  if (!prize?.active) return null;

  return (
    <section className="cl-prize-panel">
      <div className="cl-prize-heading">{title}</div>
      <div className="cl-prize-content">
        <div className="cl-prize-media">
          {prize.image ? (
            <img src={prize.image} alt={prize.name || title} />
          ) : (
            <div className="cl-prize-placeholder">PREMIO</div>
          )}
        </div>
        <div className="cl-prize-copy">
          <strong>{prize.name}</strong>
          {prize.message ? <p>{prize.message}</p> : null}
        </div>
      </div>
    </section>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="cl-info-item">
      <span className="cl-info-icon">{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

export default function BingoCard({
  card = [],
  drawnNumbers = [],
  customerName = "",
  linePrize = null,
  bingoPrize = null,
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const markedNumbers = useMemo(() => normalizeNumbers(drawnNumbers), [drawnNumbers]);
  const rows = Array.isArray(card) ? card : [];
  const hasPrizes = linePrize?.active || bingoPrize?.active;
  const participantText = customerName ? "1 cartón activo" : "Cartón activo";

  return (
    <section className="cl-bingo" aria-label="Cartón de Bingo Cash Lojo">
      <style>{css}</style>

      <header className="cl-bingo-header">
        <div className="cl-brand">
          <div className="cl-logo-frame">
            <img src={logoBingo} alt="Cash Lojo" />
          </div>
          <div className="cl-brand-copy">
            <div className="cl-cash-lojo">
              <span>CASH</span> <b>LOJO</b>
            </div>
            <div className="cl-bingo-ribbon">BINGO</div>
          </div>
        </div>

        <div className="cl-slogan">
          <i /> Juega, <b>Disfruta</b> y <b>Gana</b> <i />
        </div>
      </header>

      <div className={`cl-bingo-main ${hasPrizes ? "with-prizes" : "without-prizes"}`}>
        <div className="cl-card-side">
          <div className="cl-card-frame">
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <div className="cl-card-row" key={rowIndex}>
                  {Array.from({ length: 9 }).map((_, columnIndex) => {
                    const value = row?.[columnIndex];
                    const number = Number(value);
                    const hasNumber =
                      value !== null && value !== undefined && value !== "" && Number.isFinite(number);
                    const marked = hasNumber && markedNumbers.has(number);

                    return (
                      <div
                        className={`cl-card-cell ${marked ? "is-marked" : ""}`}
                        key={columnIndex}
                        aria-label={hasNumber ? `Número ${number}${marked ? ", marcado" : ""}` : "Casilla vacía"}
                      >
                        {hasNumber ? number : ""}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="cl-card-empty">No hay ningún cartón disponible.</div>
            )}
          </div>

          <div className="cl-actions">
            <div className="cl-card-state">TU CARTÓN PERSONAL</div>
            <div className="cl-check-state">
              {markedNumbers.size ? `${markedNumbers.size} NÚMEROS MARCADOS` : "ESPERANDO NÚMEROS"}
            </div>
            <button
              type="button"
              className="cl-sound-button"
              onClick={() => setSoundEnabled((value) => !value)}
              aria-label={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
              title={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
            >
              {soundEnabled ? <Volume2 size={30} /> : <VolumeX size={30} />}
            </button>
          </div>
        </div>

        {hasPrizes ? (
          <aside className="cl-prizes">
            <PrizePanel title="PREMIO POR LÍNEA" prize={linePrize} />
            <PrizePanel title="PREMIO POR BINGO" prize={bingoPrize} />
          </aside>
        ) : null}
      </div>

      <footer className="cl-info-bar">
        <InfoItem icon={<CalendarDays />} label="SORTEO:" value="Próximo sorteo" />
        <InfoItem icon={<Clock3 />} label="ESTADO:" value="En juego" />
        <InfoItem icon={<Users />} label="PARTICIPACIÓN:" value={participantText} />
        <InfoItem icon={<Euro />} label="PREMIOS:" value={hasPrizes ? "Línea y Bingo" : "Por confirmar"} />
      </footer>
    </section>
  );
}

const css = `
.cl-bingo,
.cl-bingo * { box-sizing: border-box; }

.cl-bingo {
  width: 100%;
  overflow: hidden;
  border: 4px solid #ef211b;
  border-radius: 30px;
  padding: 16px;
  color: #fff;
  background:
    radial-gradient(circle at 42% 24%, rgba(13, 78, 158, .5), transparent 34%),
    linear-gradient(145deg, #061b4d 0%, #062d6f 54%, #03163f 100%);
  box-shadow: 0 24px 55px rgba(0, 20, 65, .36), inset 0 0 0 1px rgba(255,255,255,.08);
}

.cl-bingo-header {
  min-height: 155px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 6px 18px 12px;
}

.cl-brand { display: flex; align-items: center; gap: 22px; min-width: 0; }
.cl-logo-frame {
  width: 128px;
  height: 132px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 5px;
  border: 4px solid #fff;
  border-radius: 7px;
  background: #06245e;
  box-shadow: 0 0 0 1px rgba(0,0,0,.25);
}
.cl-logo-frame img { width: 100%; height: 100%; object-fit: contain; display: block; }
.cl-brand-copy { min-width: 0; }
.cl-cash-lojo {
  font-family: Arial Black, Impact, sans-serif;
  font-size: clamp(38px, 5vw, 72px);
  font-style: italic;
  font-weight: 950;
  line-height: .95;
  letter-spacing: -3px;
  white-space: nowrap;
  text-shadow: 0 3px 2px rgba(0,0,0,.2);
}
.cl-cash-lojo span { color: #fffdf2; }
.cl-cash-lojo b { color: #ef1717; }
.cl-bingo-ribbon {
  width: min(490px, 100%);
  margin-top: 12px;
  padding: 5px 48px 7px;
  color: #fff;
  font-family: Arial Black, Impact, sans-serif;
  font-size: clamp(25px, 3vw, 42px);
  font-style: italic;
  font-weight: 950;
  line-height: 1;
  letter-spacing: 10px;
  text-align: center;
  background: linear-gradient(90deg, #de151b, #f1271c 58%, #c80f18);
  clip-path: polygon(11% 0, 100% 0, 88% 100%, 0 100%);
}

.cl-slogan {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  font-family: Georgia, serif;
  font-size: clamp(23px, 3vw, 43px);
  font-weight: 700;
  font-style: italic;
  white-space: nowrap;
}
.cl-slogan b { color: #ef1b1b; font-weight: 700; }
.cl-slogan i { width: clamp(50px, 8vw, 125px); height: 3px; background: #ef1b1b; }

.cl-bingo-main { display: grid; gap: 12px; align-items: stretch; }
.cl-bingo-main.with-prizes { grid-template-columns: minmax(0, 1.4fr) minmax(360px, 1fr); }
.cl-bingo-main.without-prizes { grid-template-columns: 1fr; }
.cl-card-side {
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 10px;
  border: 1px solid #1470b5;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(2,49,111,.85), rgba(1,36,87,.88));
}
.cl-card-frame {
  overflow: hidden;
  border: 5px solid #f8e6bd;
  border-radius: 27px;
  background: #fffaf0;
  box-shadow: inset 0 0 24px rgba(87,54,0,.08);
}
.cl-card-row { display: grid; grid-template-columns: repeat(9, minmax(0,1fr)); }
.cl-card-cell {
  min-height: clamp(76px, 8vw, 150px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 2px solid #123a78;
  border-bottom: 2px solid #123a78;
  color: #050505;
  background: linear-gradient(135deg, #fffdf7, #fbf5e6);
  font-family: Arial Black, Impact, sans-serif;
  font-size: clamp(28px, 4.6vw, 70px);
  font-weight: 950;
  line-height: 1;
  transition: transform .18s ease, background .18s ease;
}
.cl-card-row:last-child .cl-card-cell { border-bottom: 0; }
.cl-card-cell:last-child { border-right: 0; }
.cl-card-cell.is-marked {
  color: #fff;
  background: radial-gradient(circle, #f43a31 0 43%, #d90f16 45% 100%);
  box-shadow: inset 0 0 0 6px rgba(255,255,255,.86), inset 0 0 0 9px rgba(8,45,105,.4);
  text-shadow: 0 2px 2px rgba(0,0,0,.25);
}
.cl-card-empty { padding: 80px 20px; color: #17315f; text-align: center; font-weight: 900; }

.cl-actions {
  display: grid;
  grid-template-columns: minmax(180px,.8fr) minmax(220px,1fr) 80px;
  align-items: center;
  gap: 36px;
  min-height: 112px;
  padding: 18px 14px 8px;
}
.cl-card-state,
.cl-check-state {
  min-height: 72px;
  display: grid;
  place-items: center;
  border: 2px solid #f3d8a5;
  border-radius: 18px;
  font-size: clamp(15px,1.7vw,24px);
  font-weight: 950;
  text-align: center;
}
.cl-card-state { background: linear-gradient(#ed291f,#d90d16); }
.cl-check-state { background: linear-gradient(#8797a9,#617186); }
.cl-sound-button {
  width: 76px;
  height: 72px;
  display: grid;
  place-items: center;
  border: 2px solid #f3d8a5;
  border-radius: 18px;
  color: #fff;
  background: #06245e;
  cursor: pointer;
}

.cl-prizes {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  border: 1px solid #1470b5;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(2,49,111,.85), rgba(1,36,87,.88));
}
.cl-prize-panel {
  flex: 1;
  min-height: 245px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  border: 3px solid #f4d89e;
  border-radius: 24px;
  background: linear-gradient(#0a357b,#082d69);
}
.cl-prize-heading {
  padding: 1px 8px 12px;
  text-align: center;
  font-size: clamp(19px,2vw,30px);
  font-weight: 950;
}
.cl-prize-content {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(145px,42%) 1fr;
  gap: 16px;
  align-items: center;
  padding: 15px;
  border-radius: 19px;
  color: #090909;
  background: linear-gradient(135deg,#fffdf7,#f6edda);
}
.cl-prize-media { height: 100%; min-height: 150px; display: grid; place-items: center; }
.cl-prize-media img { width: 100%; height: 100%; max-height: 200px; object-fit: contain; display: block; }
.cl-prize-placeholder { width:100%; height:100%; display:grid; place-items:center; border-radius:14px; background:#eee6d6; color:#756c5b; font-weight:900; }
.cl-prize-copy { min-width: 0; }
.cl-prize-copy strong {
  display: block;
  font-family: Arial Black, Impact, sans-serif;
  font-size: clamp(19px,2.1vw,31px);
  line-height: 1.12;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}
.cl-prize-copy p { margin: 22px 0 0; font-size: clamp(15px,1.45vw,22px); line-height: 1.45; }

.cl-info-bar {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
  gap: 22px;
  margin-top: 16px;
  padding: 18px 28px;
  border: 1px solid rgba(255,239,205,.72);
  border-radius: 18px;
  background: linear-gradient(90deg,rgba(4,30,78,.97),rgba(7,43,100,.97));
}
.cl-info-item { display: flex; align-items: center; gap: 16px; min-width:0; }
.cl-info-icon { flex:0 0 auto; display:grid; place-items:center; }
.cl-info-icon svg { width:38px; height:38px; stroke-width:2.2; }
.cl-info-item small { display:block; font-size:13px; font-weight:900; }
.cl-info-item strong { display:block; margin-top:3px; font-size:clamp(15px,1.45vw,22px); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

@media (max-width: 1100px) {
  .cl-bingo-header { min-height: 125px; }
  .cl-logo-frame { width: 94px; height: 98px; }
  .cl-bingo-main.with-prizes { grid-template-columns: minmax(0,1.25fr) minmax(310px,.9fr); }
  .cl-actions { gap: 14px; }
  .cl-info-bar { gap: 12px; padding: 15px; }
}

@media (max-width: 860px) {
  .cl-bingo { padding: 10px; border-radius: 22px; }
  .cl-bingo-header { justify-content:center; text-align:center; }
  .cl-slogan { width:100%; justify-content:center; white-space:normal; }
  .cl-slogan i { display:none; }
  .cl-bingo-main.with-prizes { grid-template-columns: 1fr; }
  .cl-prizes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .cl-prize-panel { min-height:215px; }
  .cl-info-bar { grid-template-columns:repeat(2,minmax(0,1fr)); }
}

@media (max-width: 560px) {
  .cl-bingo-header { padding:4px 4px 12px; gap:12px; }
  .cl-brand { gap:10px; }
  .cl-logo-frame { width:66px; height:70px; border-width:2px; }
  .cl-cash-lojo { font-size:30px; letter-spacing:-1px; }
  .cl-bingo-ribbon { margin-top:7px; padding:4px 20px; font-size:20px; letter-spacing:5px; }
  .cl-slogan { font-size:20px; }
  .cl-card-side,.cl-prizes { padding:5px; border-radius:17px; }
  .cl-card-frame { border-width:3px; border-radius:18px; }
  .cl-card-cell { min-height:45px; font-size:21px; border-width:1px; }
  .cl-card-cell.is-marked { box-shadow:inset 0 0 0 3px rgba(255,255,255,.85), inset 0 0 0 5px rgba(8,45,105,.35); }
  .cl-actions { grid-template-columns:1fr 60px; gap:8px; min-height:auto; padding:10px 4px 4px; }
  .cl-card-state { display:none; }
  .cl-check-state { min-height:54px; font-size:13px; }
  .cl-sound-button { width:56px; height:54px; border-radius:13px; }
  .cl-prizes { grid-template-columns:1fr; }
  .cl-prize-panel { min-height:180px; padding:7px; }
  .cl-prize-heading { font-size:17px; padding-bottom:7px; }
  .cl-prize-content { grid-template-columns:95px 1fr; gap:10px; padding:10px; }
  .cl-prize-media { min-height:105px; }
  .cl-prize-media img { max-height:120px; }
  .cl-prize-copy strong { font-size:17px; }
  .cl-prize-copy p { margin-top:8px; font-size:13px; }
  .cl-info-bar { grid-template-columns:1fr 1fr; gap:13px; margin-top:9px; padding:12px; }
  .cl-info-icon svg { width:27px; height:27px; }
  .cl-info-item { gap:9px; }
  .cl-info-item small { font-size:10px; }
  .cl-info-item strong { font-size:12px; }
}
`;

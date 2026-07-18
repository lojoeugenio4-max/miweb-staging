import React from "react";
import logoLojo from "../../assets/logo-lojo.jpg";

function normalizeNumbers(numbers) {
  return new Set(Array.isArray(numbers) ? numbers.map(Number).filter(Number.isFinite) : []);
}

function PrizePanel({ title, prize }) {
  if (!prize?.active) return null;
  return (
    <section style={prizePanel}>
      <div style={prizeTitle}>{title}</div>
      <div className="cashlojo-bingo-prize-body" style={prizeBody}>
        {prize.image ? <img src={prize.image} alt={prize.name || title} className="cashlojo-bingo-prize-image" style={prizeImage} /> : <div style={prizePlaceholder}>PREMIO</div>}
        <div style={prizeText}>
          <strong style={prizeName}>{prize.name}</strong>
          {prize.message && <p style={prizeMessage}>{prize.message}</p>}
        </div>
      </div>
    </section>
  );
}

export default function BingoCard({ card = [], drawnNumbers = [], customerName = "", linePrize = null, bingoPrize = null }) {
  const markedNumbers = normalizeNumbers(drawnNumbers);
  const rows = Array.isArray(card) ? card : [];
  const hasPrizes = linePrize?.active || bingoPrize?.active;

  return (
    <>
    <style>{`
      @media (max-width: 850px) {
        .cashlojo-bingo-main { grid-template-columns: 1fr !important; }
        .cashlojo-bingo-header { justify-content: center !important; text-align: center; }
        .cashlojo-bingo-slogan { width: 100%; white-space: normal !important; }
        .cashlojo-bingo-customer { position: static !important; width: 100%; text-align: center !important; }
        .cashlojo-bingo-logo-frame { width: 78px !important; height: 78px !important; }
        .cashlojo-bingo-cell { min-height: 58px !important; }
      }
      @media (max-width: 520px) {
        .cashlojo-bingo-prize-body { grid-template-columns: 105px 1fr !important; padding: 10px !important; }
        .cashlojo-bingo-prize-image { height: 110px !important; }
        .cashlojo-bingo-cell { min-height: 44px !important; font-size: 20px !important; }
      }
    `}</style>
    <section style={shell} aria-label="Cartón de Bingo Cash Lojo">
      <header className="cashlojo-bingo-header" style={header}>
        <div style={brandArea}>
          <div className="cashlojo-bingo-logo-frame" style={logoFrame}><img src={logoLojo} alt="Cash Lojo" style={logo} /></div>
          <div style={brandText}>
            <div style={cashLojo}><span style={{color:"#fff"}}>CASH</span> <span style={{color:"#ef1717"}}>LOJO</span></div>
            <div style={bingoRibbon}>BINGO</div>
          </div>
        </div>
        <div className="cashlojo-bingo-slogan" style={slogan}>Juega, <span>Disfruta</span> y <span>Gana</span></div>
        {customerName && <div className="cashlojo-bingo-customer" style={customer}>{customerName}</div>}
      </header>

      <div className="cashlojo-bingo-main" style={{...mainGrid, gridTemplateColumns: hasPrizes ? "minmax(0,1.45fr) minmax(300px,1fr)" : "1fr"}}>
        <div style={cardColumn}>
          <div style={cardGrid}>
            {rows.length > 0 ? rows.map((row, rowIndex) => (
              <div key={rowIndex} style={rowStyle}>
                {Array.from({length:9}).map((_, columnIndex) => {
                  const value = row?.[columnIndex];
                  const number = Number(value);
                  const hasNumber = value !== null && value !== undefined && value !== "" && Number.isFinite(number);
                  const marked = hasNumber && markedNumbers.has(number);
                  return <div className="cashlojo-bingo-cell" key={columnIndex} style={{...cell, background: marked ? "#e51b1b" : "#fffdf5", color: marked ? "#fff" : "#080808", boxShadow: marked ? "inset 0 0 0 4px rgba(255,255,255,.7)" : "none"}}>{hasNumber ? number : ""}</div>;
                })}
              </div>
            )) : <div style={empty}>No hay ningún cartón disponible.</div>}
          </div>
          <div style={cardFooter}>— <span>Juega,</span> Disfruta y <span>Gana</span> —</div>
        </div>

        {hasPrizes && <aside style={prizesColumn}>
          <PrizePanel title="PREMIO POR LÍNEA" prize={linePrize} />
          <PrizePanel title="PREMIO POR BINGO" prize={bingoPrize} />
        </aside>}
      </div>
    </section>
    </>
  );
}

const shell={width:"100%",boxSizing:"border-box",border:"4px solid #ed1c24",borderRadius:28,overflow:"hidden",background:"linear-gradient(145deg,#061d52,#073a82)",boxShadow:"0 18px 50px rgba(2,20,60,.3)",padding:14,color:"#fff"};
const header={position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,padding:"8px 16px 12px",minHeight:120,flexWrap:"wrap"};
const brandArea={display:"flex",alignItems:"center",gap:16,minWidth:0};
const logoFrame={width:108,height:108,border:"4px solid #fff",borderRadius:8,overflow:"hidden",background:"#061d52",flexShrink:0};
const logo={width:"100%",height:"135%",objectFit:"cover",objectPosition:"center top",display:"block"};
const brandText={minWidth:0};
const cashLojo={fontSize:"clamp(30px,5vw,58px)",fontStyle:"italic",fontWeight:950,lineHeight:1,whiteSpace:"nowrap",letterSpacing:-2};
const bingoRibbon={marginTop:10,padding:"5px 34px",fontSize:"clamp(22px,3vw,34px)",fontWeight:950,fontStyle:"italic",letterSpacing:8,textAlign:"center",background:"linear-gradient(90deg,#d9161d,#ef2419,#d9161d)",clipPath:"polygon(8% 0,100% 0,92% 100%,0 100%)"};
const slogan={fontFamily:"Georgia,serif",fontSize:"clamp(20px,3vw,36px)",fontWeight:700,fontStyle:"italic",whiteSpace:"nowrap"};
const customer={position:"absolute",right:18,bottom:4,fontSize:12,fontWeight:700,opacity:.85,maxWidth:250,textAlign:"right"};
const mainGrid={display:"grid",gap:12,alignItems:"stretch"};
const cardColumn={minWidth:0,display:"flex",flexDirection:"column",border:"2px solid rgba(255,255,255,.18)",borderRadius:22,overflow:"hidden"};
const cardGrid={background:"#fff7df",border:"4px solid #fff1cf",borderRadius:20,overflow:"hidden"};
const rowStyle={display:"grid",gridTemplateColumns:"repeat(9,minmax(0,1fr))"};
const cell={minHeight:"clamp(58px,8vw,115px)",display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid #0d3577",fontSize:"clamp(20px,4.4vw,52px)",fontWeight:950,lineHeight:1};
const empty={padding:40,textAlign:"center",color:"#17315f",fontWeight:800};
const cardFooter={padding:"10px 12px",textAlign:"center",fontFamily:"Georgia,serif",fontSize:"clamp(18px,2.6vw,30px)",fontStyle:"italic",fontWeight:700};
const prizesColumn={display:"flex",flexDirection:"column",gap:12,minWidth:0};
const prizePanel={flex:1,border:"3px solid #f5ddad",borderRadius:22,padding:10,background:"linear-gradient(#0b3478,#0a2d69)",minHeight:190,display:"flex",flexDirection:"column"};
const prizeTitle={textAlign:"center",fontSize:"clamp(17px,2vw,25px)",fontWeight:950,letterSpacing:.5,padding:"2px 6px 10px"};
const prizeBody={flex:1,display:"grid",gridTemplateColumns:"minmax(110px,42%) 1fr",gap:14,alignItems:"center",background:"#fffdf5",borderRadius:18,padding:14,color:"#090909"};
const prizeImage={width:"100%",height:150,objectFit:"contain"};
const prizePlaceholder={height:140,display:"grid",placeItems:"center",background:"#eee8d9",borderRadius:14,color:"#776",fontWeight:900};
const prizeText={minWidth:0};
const prizeName={fontSize:"clamp(18px,2vw,28px)",lineHeight:1.12,textTransform:"uppercase",overflowWrap:"anywhere"};
const prizeMessage={margin:"12px 0 0",fontSize:"clamp(14px,1.5vw,20px)",lineHeight:1.35};

const mobileCss = `@media(max-width:850px){}`;
void mobileCss;

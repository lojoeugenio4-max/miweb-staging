import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function BingoDrum({ editionId, initialNumbers = [], onNumbersChange }) {
  const [numbers, setNumbers] = useState(() => [...new Set(initialNumbers.map(Number))]);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const normalized = [...new Set((initialNumbers || []).map(Number).filter(Boolean))];
    setNumbers(normalized);
  }, [initialNumbers]);

  useEffect(() => {
    if (!editionId) return undefined;

    const channel = supabase
      .channel(`bingo-edition-${editionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bingo_draws", filter: `edition_id=eq.${editionId}` },
        (payload) => {
          const number = Number(payload.new?.number);
          if (!number) return;

          // La bola se incorpora inmediatamente al estado compartido para que
          // el cartón y el indicador de «última bola» no vayan una extracción
          // por detrás. La animación del bombo puede continuar sin retrasar los datos.
          setNumbers((current) => {
            const next = current.includes(number) ? current : [...current, number];
            onNumbersChange?.(next);
            return next;
          });

          setSpinning(true);
          window.setTimeout(() => setSpinning(false), 5000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [editionId, onNumbersChange]);

  const lastNumber = numbers.at(-1) || null;
  const recent = useMemo(() => numbers.slice(-8).reverse(), [numbers]);

  return (
    <section className="cl-drum" aria-live="polite">
      <style>{styles}</style>
      <div className="cl-drum__machine">
        <div className={`cl-drum__cage ${spinning ? "cl-drum__cage--spinning" : ""}`}>
          <div className="cl-drum__bars" />
          <div className="cl-drum__mini-balls" />
          <div className="cl-drum__hub">CL</div>
        </div>
        <div className="cl-drum__stand" />
      </div>
      <div className="cl-drum__copy">
        <strong>{spinning ? "El bombo está girando…" : lastNumber ? `Última bola: ${lastNumber}` : "Esperando la primera bola"}</strong>
        <div className={`cl-drum__extracted ${spinning ? "is-spinning" : ""}`}>{spinning ? "?" : (lastNumber || "–")}</div>
        <span>{numbers.length} de 90 bolas cantadas · Tu cartón se marca automáticamente</span>
        <div className="cl-drum__recent">
          {recent.map((number) => <b key={number}>{number}</b>)}
        </div>
      </div>
    </section>
  );
}

const styles = `
.cl-drum{display:grid;grid-template-columns:190px 1fr;gap:20px;align-items:center;margin:0 0 16px;padding:18px 22px;border:3px solid #f4cf62;border-radius:22px;color:#fff;background:radial-gradient(circle at 15% 15%,#16498e,#071b48 58%,#04102b);box-shadow:0 12px 28px #00123b44;overflow:hidden}
.cl-drum__machine{position:relative;width:168px;height:170px;margin:auto}.cl-drum__cage{position:absolute;left:9px;top:0;width:150px;height:150px;border:9px solid #c98a16;border-radius:50%;background:radial-gradient(circle,#163d75 0 58%,#07152f 60%);box-shadow:inset 0 0 0 4px #ffec9b,0 8px 18px #0006;overflow:hidden}.cl-drum__cage:before,.cl-drum__cage:after{content:"";position:absolute;inset:-12px;border:5px solid #eac04f;border-radius:50%;transform:rotate(55deg) scaleX(.32)}.cl-drum__cage:after{transform:rotate(-55deg) scaleX(.32)}.cl-drum__cage--spinning{animation:cl-spin .32s linear infinite}.cl-drum__bars{position:absolute;inset:-12px;background:repeating-linear-gradient(75deg,transparent 0 13px,#f8dc7d99 14px 18px,transparent 19px 30px)}.cl-drum__mini-balls{position:absolute;inset:35px;border-radius:50%;background:radial-gradient(circle at 20% 25%,#fff5b3 0 8px,transparent 9px),radial-gradient(circle at 75% 30%,#fff5b3 0 7px,transparent 8px),radial-gradient(circle at 35% 75%,#fff5b3 0 8px,transparent 9px),radial-gradient(circle at 70% 70%,#fff5b3 0 7px,transparent 8px)}.cl-drum__hub{position:absolute;inset:52px;display:grid;place-items:center;border:4px double #fff0a0;border-radius:50%;background:#a96b0c;color:#fff4c2;font-weight:950}.cl-drum__stand{position:absolute;left:28px;right:28px;bottom:0;height:27px;border:5px solid #8a5208;border-radius:50% 50% 5px 5px;background:linear-gradient(#f1c64e,#8d5205)}.cl-drum__copy{position:relative;display:flex;flex-direction:column;gap:7px;padding-right:92px}.cl-drum__copy strong{font-size:24px}.cl-drum__copy span{color:#dbe9ff;font-weight:700}.cl-drum__extracted{position:absolute;right:0;top:50%;transform:translateY(-50%);width:76px;height:76px;display:grid;place-items:center;border:6px solid #fff3bd;border-radius:50%;color:#a50f18;background:radial-gradient(circle at 32% 25%,#fff,#fff2b5 60%,#d49a1d);font:950 38px Georgia;box-shadow:0 8px 18px #0008}.cl-drum__extracted.is-spinning{animation:cl-pulse .45s ease-in-out infinite alternate}.cl-drum__recent{display:flex;flex-wrap:wrap;gap:7px;margin-top:6px}.cl-drum__recent b{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;color:#071b48;background:#fff3bd}.cl-drum__recent b:first-child{color:#fff;background:#e51b22}@keyframes cl-spin{to{transform:rotate(360deg)}}@keyframes cl-pulse{to{transform:translateY(-50%) scale(.88);filter:brightness(.7)}}@media(max-width:560px){.cl-drum{grid-template-columns:105px 1fr;padding:12px;gap:10px}.cl-drum__machine{width:100px;height:110px}.cl-drum__cage{width:96px;height:96px;border-width:6px;left:0}.cl-drum__hub{inset:32px;font-size:11px}.cl-drum__stand{left:15px;right:15px;height:20px}.cl-drum__copy{padding-right:58px}.cl-drum__copy strong{font-size:17px}.cl-drum__copy span{font-size:12px}.cl-drum__extracted{width:52px;height:52px;border-width:4px;font-size:26px}}
`;

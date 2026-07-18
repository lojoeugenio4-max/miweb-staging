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
          setSpinning(true);
          window.setTimeout(() => {
            setNumbers((current) => {
              const next = current.includes(number) ? current : [...current, number];
              onNumbersChange?.(next);
              return next;
            });
            setSpinning(false);
          }, 1150);
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
      <div className={`cl-drum__cage ${spinning ? "cl-drum__cage--spinning" : ""}`}>
        <div className="cl-drum__bars" />
        <div className="cl-drum__ball">{lastNumber || "–"}</div>
      </div>
      <div className="cl-drum__copy">
        <strong>{spinning ? "El bombo está girando…" : lastNumber ? `Última bola: ${lastNumber}` : "Esperando la primera bola"}</strong>
        <span>{numbers.length} de 90 bolas cantadas</span>
        <div className="cl-drum__recent">
          {recent.map((number) => <b key={number}>{number}</b>)}
        </div>
      </div>
    </section>
  );
}

const styles = `
.cl-drum{display:grid;grid-template-columns:170px 1fr;gap:20px;align-items:center;margin:0 0 16px;padding:16px 20px;border:3px solid #f4cf62;border-radius:22px;color:#fff;background:linear-gradient(135deg,#071b48,#103d85)}
.cl-drum__cage{position:relative;width:150px;height:150px;margin:auto;border:9px solid #d5a838;border-radius:50%;background:radial-gradient(circle,#163d75 0 58%,#07152f 60%);box-shadow:inset 0 0 0 4px #ffec9b,0 8px 18px #0006;overflow:hidden}
.cl-drum__cage--spinning{animation:cl-spin .28s linear infinite}.cl-drum__bars{position:absolute;inset:-12px;background:repeating-linear-gradient(75deg,transparent 0 13px,#f8dc7d 14px 18px,transparent 19px 30px);opacity:.85}.cl-drum__ball{position:absolute;inset:38px;display:grid;place-items:center;border:4px solid #fff;border-radius:50%;color:#101010;background:#fff6d0;font-size:36px;font-weight:950;box-shadow:0 5px 15px #0008}.cl-drum__copy{display:flex;flex-direction:column;gap:7px}.cl-drum__copy strong{font-size:24px}.cl-drum__copy span{color:#dbe9ff;font-weight:700}.cl-drum__recent{display:flex;flex-wrap:wrap;gap:7px;margin-top:6px}.cl-drum__recent b{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;color:#071b48;background:#fff3bd}.cl-drum__recent b:first-child{color:#fff;background:#e51b22}@keyframes cl-spin{to{transform:rotate(360deg)}}@media(max-width:560px){.cl-drum{grid-template-columns:105px 1fr;padding:12px}.cl-drum__cage{width:96px;height:96px;border-width:6px}.cl-drum__ball{inset:24px;font-size:24px}.cl-drum__copy strong{font-size:18px}}
`;

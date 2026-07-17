import React, { useMemo } from "react";
import BingoCard from "../../components/bingo/BingoCard";

function createDemoCard() {
  return [
    [4, null, 23, null, 41, 52, null, 74, null],
    [null, 15, null, 34, 46, null, 63, null, 86],
    [8, null, 29, 37, null, 58, null, 78, null],
  ];
}

export default function BingoDemo() {
  const card = useMemo(() => createDemoCard(), []);

  return (
    <main
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        background: "#eef2f8",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 920,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#111a8f",
              fontSize: "clamp(28px, 5vw, 46px)",
            }}
          >
            Bingo Cash Lojo
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#4b5563",
              fontSize: 16,
            }}
          >
            Pantalla de prueba del cartón de Bingo
          </p>
        </header>

        <BingoCard
          card={card}
          drawnNumbers={[4, 23, 46, 63]}
          customerName="Cliente de prueba"
        />
      </div>
    </main>
  );
}

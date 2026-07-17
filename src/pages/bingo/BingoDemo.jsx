import React from "react";
import BingoCard from "../../components/bingo/BingoCard";

export default function BingoDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f6fb",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#163c96",
            marginBottom: 10,
          }}
        >
          Bingo Cash Lojo
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: 30,
          }}
        >
          Pantalla de pruebas del Bingo
        </p>

        <BingoCard />
      </div>
    </div>
  );
}

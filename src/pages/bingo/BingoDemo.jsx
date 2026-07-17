import React, { useEffect, useState } from "react";
import BingoCard from "../../components/bingo/BingoCard";
import { supabase } from "../../supabaseClient";

const DEFAULT_GAME_ID = "469849c4-105b-47fe-b4a7-aa37ba1f3fc2";

export default function BingoDemo() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadBingoGame() {
      setLoading(true);
      setErrorMessage("");

      const searchParams = new URLSearchParams(window.location.search);
      const gameId = searchParams.get("game") || DEFAULT_GAME_ID;

      const { data, error } = await supabase
        .from("bingo_games")
        .select(
          "id, customer_phone, status, card, drawn_numbers, line_completed, bingo_completed"
        )
        .eq("id", gameId)
        .maybeSingle();

      if (error) {
        console.error("Error cargando el Bingo:", error);
        setErrorMessage("No se ha podido cargar el Bingo.");
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("No existe ningún Bingo con ese identificador.");
        setLoading(false);
        return;
      }

      setGame(data);
      setLoading(false);
    }

    loadBingoGame();
  }, []);

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
            Cartón cargado desde Supabase
          </p>
        </header>

        {loading && (
          <div
            style={{
              padding: 30,
              borderRadius: 18,
              background: "#ffffff",
              textAlign: "center",
              fontWeight: 700,
              color: "#111a8f",
            }}
          >
            Cargando Bingo...
          </div>
        )}

        {!loading && errorMessage && (
          <div
            style={{
              padding: 30,
              border: "2px solid #ff2020",
              borderRadius: 18,
              background: "#ffffff",
              textAlign: "center",
              fontWeight: 700,
              color: "#b00020",
            }}
          >
            {errorMessage}
          </div>
        )}

        {!loading && game && (
          <>
            <BingoCard
              card={game.card}
              drawnNumbers={game.drawn_numbers}
              customerName={game.customer_phone || "Cliente"}
            />

            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 14,
                background: "#ffffff",
                textAlign: "center",
                color: "#374151",
                fontWeight: 700,
              }}
            >
              Estado: {game.status}
              {game.line_completed ? " · Línea completada" : ""}
              {game.bingo_completed ? " · Bingo completado" : ""}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

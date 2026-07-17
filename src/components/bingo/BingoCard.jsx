import React from "react";
import logoLojo from "../../assets/logo-lojo.jpg";

function normalizeNumbers(numbers) {
  return new Set(
    Array.isArray(numbers)
      ? numbers.map((number) => Number(number)).filter(Number.isFinite)
      : []
  );
}

export default function BingoCard({
  card = [],
  drawnNumbers = [],
  customerName = "",
}) {
  const markedNumbers = normalizeNumbers(drawnNumbers);
  const rows = Array.isArray(card) ? card : [];

  return (
    <section
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "5px solid #111a8f",
        borderRadius: 24,
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 18px 45px rgba(17, 26, 143, 0.18)",
      }}
      aria-label="Cartón de Bingo Cash Lojo"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "18px 22px",
          background: "#111a8f",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            minWidth: 0,
          }}
        >
          <img
            src={logoLojo}
            alt="Cash Lojo"
            style={{
              width: 64,
              height: 64,
              flexShrink: 0,
              borderRadius: 14,
              objectFit: "cover",
              background: "#ffffff",
            }}
          />

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: "#ff2020",
                fontSize: "clamp(24px, 5vw, 38px)",
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              CASH LOJO
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: "clamp(16px, 3vw, 22px)",
                fontWeight: 800,
              }}
            >
              BINGO
            </div>
          </div>
        </div>

        {customerName && (
          <div
            style={{
              maxWidth: 240,
              textAlign: "right",
              fontSize: 14,
              fontWeight: 700,
              overflowWrap: "anywhere",
            }}
          >
            {customerName}
          </div>
        )}
      </div>

      <div
        style={{
          padding: "clamp(10px, 2vw, 18px)",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateRows: `repeat(${Math.max(rows.length, 1)}, minmax(64px, 1fr))`,
            gap: 6,
          }}
        >
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
                  gap: 6,
                }}
              >
                {Array.from({ length: 9 }).map((_, columnIndex) => {
                  const value = row?.[columnIndex];
                  const number = Number(value);
                  const hasNumber =
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    Number.isFinite(number);
                  const marked = hasNumber && markedNumbers.has(number);

                  return (
                    <div
                      key={`cell-${rowIndex}-${columnIndex}`}
                      style={{
                        minHeight: 68,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #111a8f",
                        borderRadius: 10,
                        background: hasNumber
                          ? marked
                            ? "#ff2020"
                            : "#f8fafc"
                          : "#111a8f",
                        color: marked ? "#ffffff" : "#111a8f",
                        fontSize: "clamp(19px, 4vw, 34px)",
                        fontWeight: 900,
                        boxShadow: marked
                          ? "inset 0 0 0 3px rgba(255,255,255,0.7)"
                          : "none",
                      }}
                    >
                      {hasNumber ? number : ""}
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: 30,
                textAlign: "center",
                color: "#6b7280",
                fontWeight: 700,
              }}
            >
              No hay ningún cartón disponible.
            </div>
          )}
        </div>
      </div>

      <footer
        style={{
          padding: "12px 18px",
          textAlign: "center",
          background: "#ff2020",
          color: "#ffffff",
          fontWeight: 800,
          letterSpacing: 0.4,
        }}
      >
        Tu cartón personal · Cash Lojo
      </footer>
    </section>
  );
}

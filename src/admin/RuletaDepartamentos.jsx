import { useMemo, useState } from "react";

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function RuletaDepartamentos({
  departamentos = [],
  departamentosSeleccionados = [],
  guardandoId = null,
  onCambiarDepartamento,
}) {
  const [busqueda, setBusqueda] = useState("");

  const seleccionados = new Set(
    departamentosSeleccionados.map((item) => String(item.departamento_id))
  );

  const departamentosFiltrados = useMemo(() => {
    const texto = normalizar(busqueda);

    if (!texto) return departamentos;

    return departamentos.filter((departamento) =>
      normalizar(departamento.nombre).includes(texto)
    );
  }, [departamentos, busqueda]);

  return (
    <div style={contenedor}>
      <div style={info}>
        Los artículos de los departamentos marcados cuentan automáticamente para
        la ruleta. No hace falta marcarlos uno a uno.
      </div>

      <input
        style={input}
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar departamento..."
      />

      <div style={lista}>
        {departamentosFiltrados.map((departamento) => {
          const seleccionado = seleccionados.has(String(departamento.id));

          return (
            <label
              key={departamento.id}
              style={{
                ...fila,
                ...(seleccionado ? filaSeleccionada : {}),
              }}
            >
              <input
                type="checkbox"
                checked={seleccionado}
                disabled={guardandoId === departamento.id}
                onChange={() => onCambiarDepartamento(departamento)}
              />

              <span style={nombre}>{departamento.nombre}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

const contenedor = {
  display: "grid",
  gap: "12px",
};

const info = {
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1e40af",
  borderRadius: "12px",
  padding: "12px",
  fontSize: "14px",
  fontWeight: "700",
};

const input = {
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "10px",
  fontSize: "14px",
};

const lista = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "8px",
};

const fila = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "10px",
  background: "#ffffff",
  cursor: "pointer",
};

const filaSeleccionada = {
  background: "#ecfdf5",
  borderColor: "#86efac",
};

const nombre = {
  fontWeight: "800",
  color: "#111827",
};

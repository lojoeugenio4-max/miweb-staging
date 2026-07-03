export default function RuletaFormulario({
  formulario,
  cambiarCampo,
  guardarPremio,
  guardando,
  error,
  mensaje,
  idEditando,
  cancelarEdicion,
}) {
  return (
    <form style={formularioStyle} onSubmit={guardarPremio}>
      <h4 style={bloqueTitulo}>
        {idEditando ? "✏️ Editar premio" : "➕ Nuevo premio"}
      </h4>

      <div style={gridFormulario}>
        <label style={label}>
          Nombre del premio
          <input
            style={input}
            type="text"
            value={formulario.nombre}
            onChange={(e) => cambiarCampo("nombre", e.target.value)}
            placeholder="Ej: 10% descuento"
          />
        </label>

        <label style={label}>
          Color
          <input
            style={inputColor}
            type="color"
            value={formulario.color}
            onChange={(e) => cambiarCampo("color", e.target.value)}
          />
        </label>

        <label style={label}>
          Probabilidad
          <input
            style={input}
            type="number"
            min="0"
            step="0.01"
            value={formulario.probabilidad}
            onChange={(e) => cambiarCampo("probabilidad", e.target.value)}
            placeholder="Ej: 25"
          />
        </label>

        <label style={label}>
          Stock
          <input
            style={input}
            type="number"
            min="0"
            step="1"
            value={formulario.stock}
            onChange={(e) => cambiarCampo("stock", e.target.value)}
            placeholder="Vacío = ilimitado"
          />
        </label>

        <label style={label}>
          Orden
          <input
            style={input}
            type="number"
            min="0"
            step="1"
            value={formulario.orden}
            onChange={(e) => cambiarCampo("orden", e.target.value)}
            placeholder="Auto"
          />
        </label>

        <label style={checkLabel}>
          <input
            type="checkbox"
            checked={formulario.activo}
            onChange={(e) => cambiarCampo("activo", e.target.checked)}
          />
          Activo
        </label>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {mensaje && <div style={okStyle}>{mensaje}</div>}

      <div style={botones}>
        <button type="submit" style={botonPrincipal} disabled={guardando}>
          {guardando
            ? "Guardando..."
            : idEditando
              ? "Actualizar premio"
              : "Guardar premio"}
        </button>

        {idEditando && (
          <button
            type="button"
            style={botonSecundario}
            onClick={cancelarEdicion}
            disabled={guardando}
          >
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
}

const formularioStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "16px",
  background: "#f9fafb",
  marginBottom: "16px",
};

const bloqueTitulo = {
  margin: "0 0 14px",
  fontSize: "17px",
  color: "#111827",
};

const gridFormulario = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginBottom: "14px",
};

const label = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  fontSize: "13px",
  fontWeight: "700",
  color: "#374151",
};

const checkLabel = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  fontWeight: "700",
  color: "#374151",
  paddingTop: "24px",
};

const input = {
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "10px",
  fontSize: "14px",
  background: "#ffffff",
};

const inputColor = {
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  height: "39px",
  padding: "4px",
  background: "#ffffff",
};

const botones = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const botonPrincipal = {
  border: "none",
  background: "#111827",
  color: "#ffffff",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  cursor: "pointer",
};

const botonSecundario = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  cursor: "pointer",
};

const errorStyle = {
  marginBottom: "10px",
  color: "#b91c1c",
  fontSize: "14px",
  fontWeight: "700",
};

const okStyle = {
  marginBottom: "10px",
  color: "#15803d",
  fontSize: "14px",
  fontWeight: "700",
};

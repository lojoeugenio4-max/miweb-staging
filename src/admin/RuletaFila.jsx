export default function RuletaFila({ premio }) {
  return (
    <tr>
      <td style={td}>{premio.orden}</td>

      <td style={td}>{premio.nombre}</td>

      <td style={td}>
        <span
          style={{
            ...muestraColor,
            background: premio.color || "#f59e0b",
          }}
        />
        {premio.color}
      </td>

      <td style={td}>
        {Number(premio.probabilidad || 0)}%
      </td>

      <td style={td}>
        {premio.stock === null || premio.stock === undefined
          ? "Ilimitado"
          : premio.stock}
      </td>

      <td style={td}>
        {premio.activo ? (
          <span style={activo}>Activo</span>
        ) : (
          <span style={inactivo}>Inactivo</span>
        )}
      </td>
    </tr>
  );
}

const td = {
  borderBottom: "1px solid #f3f4f6",
  padding: "10px",
  color: "#111827",
};

const muestraColor = {
  display: "inline-block",
  width: "16px",
  height: "16px",
  borderRadius: "999px",
  marginRight: "8px",
  verticalAlign: "middle",
  border: "1px solid #d1d5db",
};

const activo = {
  display: "inline-block",
  background: "#dcfce7",
  color: "#166534",
  borderRadius: "999px",
  padding: "4px 9px",
  fontSize: "12px",
  fontWeight: "800",
};

const inactivo = {
  display: "inline-block",
  background: "#fee2e2",
  color: "#991b1b",
  borderRadius: "999px",
  padding: "4px 9px",
  fontSize: "12px",
  fontWeight: "800",
};

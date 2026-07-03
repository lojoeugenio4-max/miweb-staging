export default function Promociones() {
  return (
    <div>
      <h2 style={titulo}>🎁 Promociones</h2>
      <p style={texto}>
        Aquí configuraremos ruleta, regalos, campañas y artículos que cuentan para promociones.
      </p>
    </div>
  );
}

const titulo = {
  margin: "0 0 8px",
  fontSize: "24px",
  color: "#111827",
};

const texto = {
  margin: 0,
  color: "#6b7280",
  fontSize: "15px",
};

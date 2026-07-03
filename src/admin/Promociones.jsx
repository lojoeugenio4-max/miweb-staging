export default function Promociones() {
  return (
    <div>
      <h2 style={titulo}>🎁 Promociones</h2>

      <p style={texto}>
        Configura desde aquí las promociones disponibles para los pedidos:
        ruleta, regalos, campañas y artículos que generan participaciones.
      </p>

      <div style={grid}>
        <div style={tarjeta}>
          <div style={icono}>🎡</div>
          <h3 style={subtitulo}>Ruleta</h3>
          <p style={descripcion}>
            Configuración de premios, probabilidades y estado de la ruleta.
          </p>
          <button style={boton}>Configurar ruleta</button>
        </div>

        <div style={tarjeta}>
          <div style={icono}>🎁</div>
          <h3 style={subtitulo}>Regalos</h3>
          <p style={descripcion}>
            Gestión de regalos disponibles, stock y activación.
          </p>
          <button style={boton}>Gestionar regalos</button>
        </div>

        <div style={tarjeta}>
          <div style={icono}>📢</div>
          <h3 style={subtitulo}>Campañas</h3>
          <p style={descripcion}>
            Creación y control de campañas promocionales por fechas.
          </p>
          <button style={boton}>Gestionar campañas</button>
        </div>

        <div style={tarjeta}>
          <div style={icono}>🛒</div>
          <h3 style={subtitulo}>Artículos que cuentan</h3>
          <p style={descripcion}>
            Selección de artículos que generan participaciones en promociones.
          </p>
          <button style={boton}>Configurar artículos</button>
        </div>
      </div>
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
  maxWidth: "720px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
  marginTop: "24px",
};

const tarjeta = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "18px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const icono = {
  fontSize: "30px",
  marginBottom: "10px",
};

const subtitulo = {
  margin: "0 0 8px",
  fontSize: "18px",
  color: "#111827",
};

const descripcion = {
  margin: "0 0 16px",
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.45",
};

const boton = {
  border: "none",
  background: "#111827",
  color: "#ffffff",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  cursor: "pointer",
};

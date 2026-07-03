export default function Ruleta() {
  return (
    <div>
      <h3 style={titulo}>🎡 Ruleta promocional</h3>
      <p style={texto}>
        Aquí gestionaremos los premios de la ruleta conectados a Supabase.
      </p>

      <div style={aviso}>
        Archivo Ruleta.jsx creado correctamente. En el siguiente paso conectamos
        esta pantalla con la tabla <strong>promociones_ruleta_premios</strong>.
      </div>
    </div>
  );
}

const titulo = {
  margin: "0 0 8px",
  fontSize: "22px",
  color: "#111827",
};

const texto = {
  margin: "0 0 18px",
  color: "#6b7280",
  fontSize: "15px",
};

const aviso = {
  background: "#f9fafb",
  border: "1px dashed #d1d5db",
  borderRadius: "12px",
  padding: "14px",
  color: "#374151",
  fontSize: "14px",
};

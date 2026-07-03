import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import RuletaVisual from "../components/RuletaVisual";

export default function Ruleta() {
  const [premios, setPremios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPremios();
  }, []);

  async function cargarPremios() {
    setCargando(true);
    setError("");

    const { data, error } = await supabase
      .from("promociones_ruleta_premios")
      .select("*")
      .eq("activo", true)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setError("No se han podido cargar los premios.");
      setPremios([]);
    } else {
      setPremios(data || []);
    }

    setCargando(false);
  }

  if (cargando) {
    return (
      <div style={contenedor}>
        <h2 style={titulo}>🎡 Ruleta Promocional</h2>
        <p style={texto}>Cargando premios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={contenedor}>
        <h2 style={titulo}>🎡 Ruleta Promocional</h2>
        <div style={errorBox}>{error}</div>
      </div>
    );
  }

  return (
    <div style={contenedor}>
      <h1 style={titulo}>🎡 Ruleta Promocional</h1>

      <p style={texto}>
        Gira la ruleta y descubre el premio que te espera.
      </p>

      <RuletaVisual premios={premios} />
    </div>
  );
}

const contenedor = {
  maxWidth: "900px",
  margin: "40px auto",
  padding: "20px",
  textAlign: "center",
};

const titulo = {
  marginBottom: "12px",
  fontSize: "38px",
  fontWeight: "800",
  color: "#111827",
};

const texto = {
  marginBottom: "30px",
  color: "#6b7280",
  fontSize: "18px",
};

const errorBox = {
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  borderRadius: "12px",
  padding: "16px",
  fontWeight: "700",
};

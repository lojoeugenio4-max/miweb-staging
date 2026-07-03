import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import RuletaFormulario from "./RuletaFormulario";
import RuletaTabla from "./RuletaTabla";

const premioVacio = {
  nombre: "",
  color: "#f59e0b",
  probabilidad: "",
  stock: "",
  activo: true,
  orden: "",
};

export default function Ruleta() {
  const [premios, setPremios] = useState([]);
  const [formulario, setFormulario] = useState(premioVacio);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarPremios();
  }, []);

  async function cargarPremios() {
    setCargando(true);
    setError("");

    const { data, error } = await supabase
      .from("promociones_ruleta_premios")
      .select("*")
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

  function cambiarCampo(campo, valor) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function guardarPremio(e) {
    e.preventDefault();

    setError("");
    setMensaje("");

    const nombre = formulario.nombre.trim();

    const probabilidad = Number(formulario.probabilidad);

    const stock =
      formulario.stock === ""
        ? null
        : Number.parseInt(formulario.stock, 10);

    const orden =
      formulario.orden === ""
        ? premios.length + 1
        : Number.parseInt(formulario.orden, 10);

    if (!nombre) {
      setError("El nombre del premio es obligatorio.");
      return;
    }

    if (Number.isNaN(probabilidad) || probabilidad < 0) {
      setError("La probabilidad debe ser mayor o igual que 0.");
      return;
    }

    if (formulario.stock !== "" && (Number.isNaN(stock) || stock < 0)) {
      setError("Stock incorrecto.");
      return;
    }

    if (Number.isNaN(orden) || orden < 0) {
      setError("Orden incorrecto.");
      return;
    }

    setGuardando(true);

    const { error } = await supabase
      .from("promociones_ruleta_premios")
      .insert({
        nombre,
        color: formulario.color,
        probabilidad,
        stock,
        activo: formulario.activo,
        orden,
      });

    if (error) {
      setError("No se ha podido guardar el premio.");
    } else {
      setMensaje("Premio guardado correctamente.");
      setFormulario(premioVacio);
      await cargarPremios();
    }

    setGuardando(false);
  }

  const totalProbabilidad = premios.reduce(
    (t, p) => t + Number(p.probabilidad || 0),
    0
  );

  return (
    <div>
      <h3 style={titulo}>🎡 Ruleta promocional</h3>

      <p style={texto}>
        Gestiona los premios que aparecerán en la ruleta.
      </p>

      <RuletaFormulario
        formulario={formulario}
        cambiarCampo={cambiarCampo}
        guardarPremio={guardarPremio}
        guardando={guardando}
        error={error}
        mensaje={mensaje}
      />

      <div style={resumen}>
        <strong>Total probabilidad:</strong> {totalProbabilidad}

        {totalProbabilidad !== 100 && (
          <span style={advertencia}>
            {" "}
            · Recomendado: que el total sea 100
          </span>
        )}
      </div>

      <RuletaTabla
        premios={premios}
        cargando={cargando}
      />
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

const resumen = {
  margin: "0 0 16px",
  padding: "12px",
  borderRadius: "12px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  color: "#111827",
  fontSize: "14px",
};

const advertencia = {
  color: "#b45309",
  fontWeight: "700",
};

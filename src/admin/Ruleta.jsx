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
  const [idEditando, setIdEditando] = useState(null);

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

  function cancelarEdicion() {
    setIdEditando(null);
    setFormulario(premioVacio);
    setError("");
    setMensaje("");
  }

  async function guardarPremio(evento) {
    evento.preventDefault();

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
      setError("La probabilidad debe ser un número igual o mayor que 0.");
      return;
    }

    if (formulario.stock !== "" && (Number.isNaN(stock) || stock < 0)) {
      setError("El stock debe estar vacío o ser un número igual o mayor que 0.");
      return;
    }

    if (Number.isNaN(orden) || orden < 0) {
      setError("El orden debe estar vacío o ser un número igual o mayor que 0.");
      return;
    }

    setGuardando(true);

    const datosPremio = {
      nombre,
      color: formulario.color || "#f59e0b",
      probabilidad,
      stock,
      activo: formulario.activo,
      orden,
    };

    const resultado = idEditando
      ? await supabase
          .from("promociones_ruleta_premios")
          .update(datosPremio)
          .eq("id", idEditando)
      : await supabase
          .from("promociones_ruleta_premios")
          .insert(datosPremio);

    if (resultado.error) {
      setError(
        idEditando
          ? "No se ha podido actualizar el premio."
          : "No se ha podido guardar el premio."
      );
    } else {
      setMensaje(
        idEditando
          ? "Premio actualizado correctamente."
          : "Premio guardado correctamente."
      );

      setFormulario(premioVacio);
      setIdEditando(null);
      await cargarPremios();
    }

    setGuardando(false);
  }

  function editarPremio(premio) {
    setIdEditando(premio.id);

    setFormulario({
      nombre: premio.nombre || "",
      color: premio.color || "#f59e0b",
      probabilidad: premio.probabilidad ?? "",
      stock: premio.stock ?? "",
      activo: premio.activo ?? true,
      orden: premio.orden ?? "",
    });

    setError("");
    setMensaje("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function eliminarPremio(premio) {
    const confirmar = window.confirm(
      `¿Eliminar el premio "${premio.nombre}"?`
    );

    if (!confirmar) return;

    setError("");
    setMensaje("");

    const { error } = await supabase
      .from("promociones_ruleta_premios")
      .delete()
      .eq("id", premio.id);

    if (error) {
      setError("No se ha podido eliminar el premio.");
      return;
    }

    if (idEditando === premio.id) {
      cancelarEdicion();
    }

    setMensaje("Premio eliminado correctamente.");
    await cargarPremios();
  }

  const totalProbabilidad = premios.reduce(
    (total, premio) => total + Number(premio.probabilidad || 0),
    0
  );

  return (
    <div>
      <h3 style={titulo}>🎡 Ruleta promocional</h3>

      <p style={texto}>
        Gestiona los premios que aparecerán en la ruleta. Cada premio puede
        tener probabilidad, stock, color y estado activo.
      </p>

      <RuletaFormulario
        formulario={formulario}
        cambiarCampo={cambiarCampo}
        guardarPremio={guardarPremio}
        guardando={guardando}
        error={error}
        mensaje={mensaje}
        idEditando={idEditando}
        cancelarEdicion={cancelarEdicion}
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
        onEditar={editarPremio}
        onEliminar={eliminarPremio}
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

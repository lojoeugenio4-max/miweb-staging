import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

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

  async function guardarPremio(evento) {
    evento.preventDefault();

    setError("");
    setMensaje("");

    const nombre = formulario.nombre.trim();
    const probabilidad = Number(formulario.probabilidad);
    const stock =
      formulario.stock === "" ? null : Number.parseInt(formulario.stock, 10);
    const orden =
      formulario.orden === "" ? premios.length + 1 : Number.parseInt(formulario.orden, 10);

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

    const { error } = await supabase.from("promociones_ruleta_premios").insert({
      nombre,
      color: formulario.color || "#f59e0b",
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
    (total, premio) => total + Number(premio.probabilidad || 0),
    0
  );

  return (
    <div>
      <h3 style={titulo}>🎡 Ruleta promocional</h3>
      <p style={texto}>
        Gestiona los premios que aparecerán en la ruleta. Cada premio puede tener
        probabilidad, stock, color y estado activo.
      </p>

      <form style={formularioStyle} onSubmit={guardarPremio}>
        <h4 style={bloqueTitulo}>➕ Nuevo premio</h4>

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

        <button type="submit" style={botonPrincipal} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar premio"}
        </button>
      </form>

      <div style={resumen}>
        <strong>Total probabilidad:</strong> {totalProbabilidad}
        {totalProbabilidad !== 100 && (
          <span style={advertencia}>
            {" "}
            · Recomendado: que el total sea 100
          </span>
        )}
      </div>

      <div style={tablaContenedor}>
        <h4 style={bloqueTitulo}>Premios configurados</h4>

        {cargando ? (
          <p style={texto}>Cargando premios...</p>
        ) : premios.length === 0 ? (
          <div style={aviso}>
            Todavía no hay premios configurados. Crea el primer premio para empezar.
          </div>
        ) : (
          <table style={tabla}>
            <thead>
              <tr>
                <th style={th}>Orden</th>
                <th style={th}>Premio</th>
                <th style={th}>Color</th>
                <th style={th}>Probabilidad</th>
                <th style={th}>Stock</th>
                <th style={th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {premios.map((premio) => (
                <tr key={premio.id}>
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
                  <td style={td}>{Number(premio.probabilidad || 0)}%</td>
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
              ))}
            </tbody>
          </table>
        )}
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

const botonPrincipal = {
  border: "none",
  background: "#111827",
  color: "#ffffff",
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

const tablaContenedor = {
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "16px",
  background: "#ffffff",
  overflowX: "auto",
};

const tabla = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};

const th = {
  textAlign: "left",
  borderBottom: "1px solid #e5e7eb",
  padding: "10px",
  color: "#374151",
  fontSize: "13px",
};

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

const aviso = {
  background: "#f9fafb",
  border: "1px dashed #d1d5db",
  borderRadius: "12px",
  padding: "14px",
  color: "#374151",
  fontSize: "14px",
};

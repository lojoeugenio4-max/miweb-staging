import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export default function RuletaArticulos() {
  const [promocion, setPromocion] = useState(null);
  const [articulos, setArticulos] = useState([]);
  const [articulosSeleccionados, setArticulosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardandoId, setGuardandoId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    setError("");

    const { data: promocionData, error: promocionError } = await supabase
      .from("promociones_ruleta")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (promocionError || !promocionData) {
      setError("No se ha podido cargar la promoción.");
      setCargando(false);
      return;
    }

    setPromocion(promocionData);

    const { data: articulosData, error: articulosError } = await supabase
      .from("articulos")
      .select("id, codigo, nombre, activo")
      .order("nombre", { ascending: true });

    if (articulosError) {
      setError("No se han podido cargar los artículos.");
      setCargando(false);
      return;
    }

    const { data: seleccionadosData, error: seleccionadosError } =
      await supabase
        .from("promociones_ruleta_articulos")
        .select("*")
        .eq("promocion_id", promocionData.id);

    if (seleccionadosError) {
      setError("No se han podido cargar los artículos seleccionados.");
      setCargando(false);
      return;
    }

    setArticulos(articulosData || []);
    setArticulosSeleccionados(seleccionadosData || []);
    setCargando(false);
  }

  const codigosSeleccionados = useMemo(() => {
    return new Set(
      articulosSeleccionados.map((item) => String(item.codigo_articulo))
    );
  }, [articulosSeleccionados]);

  const articulosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return articulos.filter((articulo) => {
      if (!texto) return true;

      return (
        String(articulo.codigo || "").toLowerCase().includes(texto) ||
        String(articulo.nombre || "").toLowerCase().includes(texto)
      );
    });
  }, [articulos, busqueda]);

  async function cambiarArticulo(articulo) {
    if (!promocion) return;

    const codigo = String(articulo.codigo || "").trim();

    if (!codigo) {
      setError("Este artículo no tiene código.");
      return;
    }

    setGuardandoId(articulo.id);
    setError("");

    const yaSeleccionado = codigosSeleccionados.has(codigo);

    if (yaSeleccionado) {
      const { error } = await supabase
        .from("promociones_ruleta_articulos")
        .delete()
        .eq("promocion_id", promocion.id)
        .eq("codigo_articulo", codigo);

      if (error) {
        setError("No se ha podido quitar el artículo.");
      } else {
        setArticulosSeleccionados((actual) =>
          actual.filter((item) => String(item.codigo_articulo) !== codigo)
        );
      }
    } else {
      const nuevo = {
        promocion_id: promocion.id,
        articulo_id: articulo.id,
        codigo_articulo: codigo,
        nombre_articulo: articulo.nombre || "",
      };

      const { data, error } = await supabase
        .from("promociones_ruleta_articulos")
        .insert(nuevo)
        .select("*")
        .single();

      if (error) {
        setError("No se ha podido añadir el artículo.");
      } else {
        setArticulosSeleccionados((actual) => [...actual, data]);
      }
    }

    setGuardandoId(null);
  }

  if (cargando) {
    return <p style={texto}>Cargando artículos de promoción...</p>;
  }

  return (
    <div style={contenedor}>
      <h4 style={titulo}>📦 Artículos que cuentan para la ruleta</h4>

      <div style={resumen}>
        <strong>{articulosSeleccionados.length}</strong> artículos seleccionados · mínimo{" "}
        <strong>{promocion?.cajas_minimas || 0}</strong> cajas entre todos ellos
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <input
        style={input}
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por código o nombre..."
      />

      <div style={lista}>
        {articulosFiltrados.map((articulo) => {
          const codigo = String(articulo.codigo || "").trim();
          const seleccionado = codigosSeleccionados.has(codigo);

          return (
            <label
              key={articulo.id}
              style={{
                ...fila,
                ...(seleccionado ? filaSeleccionada : {}),
                ...(!articulo.activo ? filaInactiva : {}),
              }}
            >
              <input
                type="checkbox"
                checked={seleccionado}
                disabled={guardandoId === articulo.id}
                onChange={() => cambiarArticulo(articulo)}
              />

              <span style={codigoStyle}>{articulo.codigo}</span>

              <span style={nombreStyle}>
                {articulo.nombre}
                {!articulo.activo && " · INACTIVO"}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

const contenedor = {
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "16px",
  background: "#ffffff",
  marginBottom: "16px",
};

const titulo = {
  margin: "0 0 14px",
  fontSize: "17px",
  color: "#111827",
};

const texto = {
  margin: "0 0 18px",
  color: "#6b7280",
  fontSize: "15px",
};

const resumen = {
  marginBottom: "12px",
  padding: "10px 12px",
  borderRadius: "12px",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  color: "#111827",
  fontSize: "14px",
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "10px",
  fontSize: "14px",
  background: "#ffffff",
  marginBottom: "12px",
};

const lista = {
  display: "grid",
  gap: "8px",
  maxHeight: "420px",
  overflowY: "auto",
};

const fila = {
  display: "grid",
  gridTemplateColumns: "24px 90px 1fr",
  alignItems: "center",
  gap: "8px",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "10px",
  cursor: "pointer",
  background: "#ffffff",
};

const filaSeleccionada = {
  background: "#ecfdf5",
  borderColor: "#86efac",
};

const filaInactiva = {
  opacity: 0.55,
};

const codigoStyle = {
  fontWeight: "800",
  color: "#111827",
};

const nombreStyle = {
  color: "#374151",
};

const errorStyle = {
  marginBottom: "10px",
  color: "#b91c1c",
  fontSize: "14px",
  fontWeight: "700",
};

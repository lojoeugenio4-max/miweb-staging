import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import RuletaDepartamentos from "./RuletaDepartamentos";
import RuletaArticulosTabla from "./RuletaArticulosTabla";

export default function RuletaArticulos() {
  const [pestana, setPestana] = useState("departamentos");

  const [promocion, setPromocion] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentosSeleccionados, setDepartamentosSeleccionados] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [articulosSeleccionados, setArticulosSeleccionados] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [departamentoFiltro, setDepartamentoFiltro] = useState("TODOS");
  const [soloSeleccionados, setSoloSeleccionados] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardandoDepartamentoId, setGuardandoDepartamentoId] = useState(null);
  const [guardandoArticuloId, setGuardandoArticuloId] = useState(null);
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

    const { data: departamentosData, error: departamentosError } = await supabase
      .from("departamentos")
      .select("id, nombre")
      .order("nombre", { ascending: true });

    if (departamentosError) {
      setError("No se han podido cargar los departamentos.");
      setCargando(false);
      return;
    }

    const { data: departamentosSeleccionadosData, error: departamentosSeleccionadosError } =
      await supabase
        .from("promociones_ruleta_departamentos")
        .select("*")
        .eq("promocion_id", promocionData.id);

    if (departamentosSeleccionadosError) {
      setError("No se han podido cargar los departamentos seleccionados.");
      setCargando(false);
      return;
    }

    const { data: articulosData, error: articulosError } = await supabase
      .from("articulos")
      .select(`
        id,
        codigo,
        nombre,
        activo,
        departamento_id,
        departamentos (
          id,
          nombre
        )
      `)
      .order("nombre", { ascending: true });

    if (articulosError) {
      setError("No se han podido cargar los artículos.");
      setCargando(false);
      return;
    }

    const { data: articulosSeleccionadosData, error: articulosSeleccionadosError } =
      await supabase
        .from("promociones_ruleta_articulos")
        .select("*")
        .eq("promocion_id", promocionData.id);

    if (articulosSeleccionadosError) {
      setError("No se han podido cargar los artículos seleccionados.");
      setCargando(false);
      return;
    }

    setDepartamentos(departamentosData || []);
    setDepartamentosSeleccionados(departamentosSeleccionadosData || []);
    setArticulos(articulosData || []);
    setArticulosSeleccionados(articulosSeleccionadosData || []);
    setCargando(false);
  }

  async function cambiarDepartamento(departamento) {
    if (!promocion) return;

    setError("");
    setGuardandoDepartamentoId(departamento.id);

    const yaSeleccionado = departamentosSeleccionados.some(
      (item) => String(item.departamento_id) === String(departamento.id)
    );

    if (yaSeleccionado) {
      const { error } = await supabase
        .from("promociones_ruleta_departamentos")
        .delete()
        .eq("promocion_id", promocion.id)
        .eq("departamento_id", departamento.id);

      if (error) {
        setError("No se ha podido quitar el departamento.");
      } else {
        setDepartamentosSeleccionados((actual) =>
          actual.filter(
            (item) => String(item.departamento_id) !== String(departamento.id)
          )
        );
      }
    } else {
      const nuevo = {
        promocion_id: promocion.id,
        departamento_id: departamento.id,
      };

      const { data, error } = await supabase
        .from("promociones_ruleta_departamentos")
        .insert(nuevo)
        .select("*")
        .single();

      if (error) {
        setError("No se ha podido añadir el departamento.");
      } else {
        setDepartamentosSeleccionados((actual) => [...actual, data]);
      }
    }

    setGuardandoDepartamentoId(null);
  }

  async function cambiarArticulo(articulo) {
    if (!promocion) return;

    const codigo = String(articulo.codigo || "").trim();

    if (!codigo) {
      setError("Este artículo no tiene código.");
      return;
    }

    setError("");
    setGuardandoArticuloId(articulo.id);

    const yaSeleccionado = articulosSeleccionados.some(
      (item) => String(item.codigo_articulo) === codigo
    );

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

    setGuardandoArticuloId(null);
  }

  if (cargando) {
    return <p style={texto}>Cargando artículos de promoción...</p>;
  }

  return (
    <div style={contenedor}>
      <h4 style={titulo}>📦 Artículos que cuentan para la ruleta</h4>

      <div style={resumen}>
        <strong>{departamentosSeleccionados.length}</strong> departamentos ·{" "}
        <strong>{articulosSeleccionados.length}</strong> artículos individuales · mínimo{" "}
        <strong>{promocion?.cajas_minimas || 0}</strong> cajas válidas
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <div style={tabs}>
        <button
          type="button"
          style={{
            ...tab,
            ...(pestana === "departamentos" ? tabActivo : {}),
          }}
          onClick={() => setPestana("departamentos")}
        >
          🏢 Departamentos
        </button>

        <button
          type="button"
          style={{
            ...tab,
            ...(pestana === "articulos" ? tabActivo : {}),
          }}
          onClick={() => setPestana("articulos")}
        >
          📦 Artículos
        </button>
      </div>

      {pestana === "departamentos" ? (
        <RuletaDepartamentos
          departamentos={departamentos}
          departamentosSeleccionados={departamentosSeleccionados}
          guardandoId={guardandoDepartamentoId}
          onCambiarDepartamento={cambiarDepartamento}
        />
      ) : (
        <RuletaArticulosTabla
          articulos={articulos}
          articulosSeleccionados={articulosSeleccionados}
          departamentosSeleccionados={departamentosSeleccionados}
          busqueda={busqueda}
          departamentoFiltro={departamentoFiltro}
          soloSeleccionados={soloSeleccionados}
          guardandoId={guardandoArticuloId}
          onBusqueda={setBusqueda}
          onDepartamentoFiltro={setDepartamentoFiltro}
          onSoloSeleccionados={setSoloSeleccionados}
          onCambiarArticulo={cambiarArticulo}
        />
      )}
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

const tabs = {
  display: "flex",
  gap: "8px",
  marginBottom: "14px",
  flexWrap: "wrap",
};

const tab = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  fontWeight: "800",
  cursor: "pointer",
};

const tabActivo = {
  background: "#111827",
  color: "#ffffff",
  borderColor: "#111827",
};

const errorStyle = {
  marginBottom: "10px",
  color: "#b91c1c",
  fontSize: "14px",
  fontWeight: "700",
};

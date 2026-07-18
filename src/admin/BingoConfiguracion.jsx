import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const configuracionVacia = {
  nombre: "Promoción bingo principal",
  activa: false,
  variedad_minima: 15,
  mensaje_cliente: "Tu pedido cumple las condiciones para participar en el Bingo.",
  fecha_inicio: "",
  fecha_fin: "",
  premio_linea_activo: false,
  premio_linea_nombre: "",
  premio_linea_mensaje: "",
  premio_bingo_activo: false,
  premio_bingo_nombre: "",
  premio_bingo_mensaje: "",
};

export default function BingoConfiguracion() {
  const [configuracion, setConfiguracion] = useState(configuracionVacia);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { cargarConfiguracion(); }, []);

  async function cargarConfiguracion() {
    setCargando(true);
    setError("");

    const { data, error } = await supabase
      .from("promociones_bingo")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      setError("No se ha podido cargar la configuración del Bingo.");
    } else if (data) {
      setConfiguracion({
        nombre: data.nombre || "",
        activa: Boolean(data.activa),
        variedad_minima: data.variedad_minima ?? 15,
        mensaje_cliente: data.mensaje_cliente || "",
        fecha_inicio: data.fecha_inicio || "",
        fecha_fin: data.fecha_fin || "",
        premio_linea_activo: Boolean(data.premio_linea_activo),
        premio_linea_nombre: data.premio_linea_nombre || "",
        premio_linea_mensaje: data.premio_linea_mensaje || "",
        premio_bingo_activo: Boolean(data.premio_bingo_activo),
        premio_bingo_nombre: data.premio_bingo_nombre || "",
        premio_bingo_mensaje: data.premio_bingo_mensaje || "",
      });
    }
    setCargando(false);
  }

  function cambiarCampo(campo, valor) {
    setConfiguracion((actual) => ({ ...actual, [campo]: valor }));
  }

  async function guardarConfiguracion(evento) {
    evento.preventDefault();
    setGuardando(true);
    setMensaje("");
    setError("");

    const variedadMinima = Number.parseInt(configuracion.variedad_minima, 10);
    if (Number.isNaN(variedadMinima) || variedadMinima < 1) {
      setError("La variedad mínima debe ser un número igual o mayor que 1.");
      setGuardando(false);
      return;
    }
    if (configuracion.fecha_inicio && configuracion.fecha_fin && configuracion.fecha_fin < configuracion.fecha_inicio) {
      setError("La fecha fin no puede ser anterior a la fecha de inicio.");
      setGuardando(false);
      return;
    }
    if (configuracion.premio_linea_activo && !configuracion.premio_linea_nombre.trim()) {
      setError("Indica el nombre del premio por línea antes de activarlo.");
      setGuardando(false);
      return;
    }
    if (configuracion.premio_bingo_activo && !configuracion.premio_bingo_nombre.trim()) {
      setError("Indica el nombre del premio por Bingo antes de activarlo.");
      setGuardando(false);
      return;
    }

    const { data: promocionActual, error: buscarError } = await supabase
      .from("promociones_bingo")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (buscarError) {
      setError("No se ha podido comprobar la configuración actual.");
      setGuardando(false);
      return;
    }

    const datos = {
      nombre: configuracion.nombre.trim() || "Promoción bingo principal",
      activa: configuracion.activa,
      variedad_minima: variedadMinima,
      mensaje_cliente: configuracion.mensaje_cliente.trim(),
      fecha_inicio: configuracion.fecha_inicio || null,
      fecha_fin: configuracion.fecha_fin || null,
      premio_linea_activo: configuracion.premio_linea_activo,
      premio_linea_nombre: configuracion.premio_linea_nombre.trim(),
      premio_linea_mensaje: configuracion.premio_linea_mensaje.trim(),
      premio_bingo_activo: configuracion.premio_bingo_activo,
      premio_bingo_nombre: configuracion.premio_bingo_nombre.trim(),
      premio_bingo_mensaje: configuracion.premio_bingo_mensaje.trim(),
      updated_at: new Date().toISOString(),
    };

    const resultado = promocionActual
      ? await supabase.from("promociones_bingo").update(datos).eq("id", promocionActual.id)
      : await supabase.from("promociones_bingo").insert(datos);

    if (resultado.error) {
      console.error(resultado.error);
      setError("No se ha podido guardar la configuración del Bingo.");
    } else {
      setMensaje("Configuración del Bingo guardada correctamente.");
      await cargarConfiguracion();
    }
    setGuardando(false);
  }

  if (cargando) return <p style={texto}>Cargando configuración...</p>;

  return (
    <form style={contenedor} onSubmit={guardarConfiguracion}>
      <h4 style={titulo}>⚙️ Configuración de la promoción</h4>
      <div style={grid}>
        <label style={label}>Nombre de la promoción
          <input style={input} type="text" value={configuracion.nombre} onChange={(e) => cambiarCampo("nombre", e.target.value)} />
        </label>
        <label style={label}>Variedad mínima de artículos
          <input style={input} type="number" min="1" step="1" value={configuracion.variedad_minima} onChange={(e) => cambiarCampo("variedad_minima", e.target.value)} />
        </label>
        <label style={label}>Fecha inicio
          <input style={input} type="date" value={configuracion.fecha_inicio} onChange={(e) => cambiarCampo("fecha_inicio", e.target.value)} />
        </label>
        <label style={label}>Fecha fin
          <input style={input} type="date" value={configuracion.fecha_fin} onChange={(e) => cambiarCampo("fecha_fin", e.target.value)} />
        </label>
        <label style={checkLabel}>
          <input type="checkbox" checked={configuracion.activa} onChange={(e) => cambiarCampo("activa", e.target.checked)} />
          Promoción activa
        </label>
        <label style={{ ...label, gridColumn: "1 / -1" }}>Mensaje para el cliente
          <textarea style={textarea} value={configuracion.mensaje_cliente} onChange={(e) => cambiarCampo("mensaje_cliente", e.target.value)} rows={3} />
        </label>
      </div>

      <div style={premiosGrid}>
        <SeccionPremio
          titulo="🏅 Premio por línea"
          activo={configuracion.premio_linea_activo}
          nombre={configuracion.premio_linea_nombre}
          mensaje={configuracion.premio_linea_mensaje}
          onActivo={(valor) => cambiarCampo("premio_linea_activo", valor)}
          onNombre={(valor) => cambiarCampo("premio_linea_nombre", valor)}
          onMensaje={(valor) => cambiarCampo("premio_linea_mensaje", valor)}
        />
        <SeccionPremio
          titulo="🎱 Premio por Bingo"
          activo={configuracion.premio_bingo_activo}
          nombre={configuracion.premio_bingo_nombre}
          mensaje={configuracion.premio_bingo_mensaje}
          onActivo={(valor) => cambiarCampo("premio_bingo_activo", valor)}
          onNombre={(valor) => cambiarCampo("premio_bingo_nombre", valor)}
          onMensaje={(valor) => cambiarCampo("premio_bingo_mensaje", valor)}
        />
      </div>

      <div style={ayuda}>
        La variedad mínima indica cuántas referencias distintas de la lista configurada debe incluir el pedido para que el cliente identificado consiga su cartón de Bingo. Identificarse por sí solo no genera ningún cartón.
      </div>
      {error && <div style={errorStyle}>{error}</div>}
      {mensaje && <div style={okStyle}>{mensaje}</div>}
      <button type="submit" style={boton} disabled={guardando}>{guardando ? "Guardando..." : "Guardar configuración"}</button>
    </form>
  );
}

function SeccionPremio({ titulo, activo, nombre, mensaje, onActivo, onNombre, onMensaje }) {
  return (
    <section style={premioCard}>
      <div style={premioCabecera}>
        <h5 style={premioTitulo}>{titulo}</h5>
        <label style={switchLabel}>
          <input type="checkbox" checked={activo} onChange={(e) => onActivo(e.target.checked)} />
          {activo ? "Activo" : "Inactivo"}
        </label>
      </div>
      <label style={label}>Nombre del premio {activo && <span style={obligatorio}>*</span>}
        <input
          style={input}
          type="text"
          value={nombre}
          onChange={(e) => onNombre(e.target.value)}
          placeholder="Ej.: Lote de productos"
          required={activo}
        />
      </label>
      <label style={label}>Mensaje o descripción
        <textarea
          style={textarea}
          value={mensaje}
          onChange={(e) => onMensaje(e.target.value)}
          placeholder="Describe el premio o el mensaje que verá el ganador."
          rows={3}
        />
      </label>
    </section>
  );
}

const contenedor={border:"1px solid #e5e7eb",borderRadius:"14px",padding:"16px",background:"#fff",marginBottom:"16px"};
const titulo={margin:"0 0 14px",fontSize:"17px",color:"#111827"};
const texto={margin:"0 0 18px",color:"#6b7280",fontSize:"15px"};
const grid={display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))",gap:"12px",marginBottom:"14px"};
const label={display:"flex",flexDirection:"column",gap:"6px",fontSize:"13px",fontWeight:"700",color:"#374151"};
const checkLabel={display:"flex",alignItems:"center",gap:"8px",fontSize:"13px",fontWeight:"700",color:"#374151",paddingTop:"24px"};
const input={border:"1px solid #d1d5db",borderRadius:"10px",padding:"10px",fontSize:"14px",background:"#fff"};
const textarea={...input,resize:"vertical"};
const premiosGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"14px",margin:"4px 0 14px"};
const premioCard={display:"flex",flexDirection:"column",gap:"12px",padding:"14px",border:"1px solid #e5e7eb",borderRadius:"12px",background:"#f9fafb"};
const premioCabecera={display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px"};
const premioTitulo={margin:0,fontSize:"15px",color:"#111827"};
const switchLabel={display:"flex",alignItems:"center",gap:"7px",fontSize:"13px",fontWeight:"700",color:"#374151"};
const obligatorio={color:"#b91c1c"};
const ayuda={margin:"0 0 12px",padding:"10px 12px",borderRadius:"10px",background:"#eff6ff",border:"1px solid #bfdbfe",color:"#1e3a8a",fontSize:"13px",lineHeight:1.45};
const boton={border:"none",background:"#111827",color:"#fff",borderRadius:"10px",padding:"10px 14px",fontSize:"14px",cursor:"pointer"};
const errorStyle={marginBottom:"10px",color:"#b91c1c",fontSize:"14px",fontWeight:"700"};
const okStyle={marginBottom:"10px",color:"#15803d",fontSize:"14px",fontWeight:"700"};

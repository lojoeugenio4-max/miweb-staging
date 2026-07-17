import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * MÓDULO CLIENTES
 * ---------------------------------------------------------
 * Componente independiente para administrar clientes.
 *
 * Uso:
 *   <Clientes supabase={supabase} />
 *
 * Tabla esperada en Supabase: clientes
 *
 * Campos:
 *   id
 *   nombre
 *   telefono
 *   estado
 *   token
 *   enlace_personal
 *   created_at
 *   updated_at
 */

const ESTADOS = {
  ACTIVO: "activo",
  INACTIVO: "inactivo",
};

const FORMULARIO_INICIAL = {
  nombre: "",
  telefono: "",
  estado: ESTADOS.ACTIVO,
};

function generarToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replaceAll("-", "");
  }

  return [
    Date.now().toString(36),
    Math.random().toString(36).slice(2),
    Math.random().toString(36).slice(2),
  ].join("");
}

function limpiarTelefono(telefono) {
  return String(telefono ?? "")
    .trim()
    .replace(/[^\d+\s()-]/g, "");
}

function obtenerOrigen() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function crearEnlacePersonal(token) {
  return `${obtenerOrigen()}/cliente/${token}`;
}

function formatearFecha(fecha) {
  if (!fecha) return "—";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(valor);
}

function obtenerMensajeError(error, mensajePorDefecto) {
  if (!error) return mensajePorDefecto;
  return error.message || error.details || mensajePorDefecto;
}

function validarFormulario(formulario) {
  const errores = {};

  if (!formulario.nombre.trim()) {
    errores.nombre = "El nombre es obligatorio.";
  }

  if (!formulario.telefono.trim()) {
    errores.telefono = "El teléfono es obligatorio.";
  }

  return errores;
}

export default function Clientes({ supabase }) {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [erroresFormulario, setErroresFormulario] = useState({});

  const [aviso, setAviso] = useState(null);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  const mostrarAviso = useCallback((tipo, texto) => {
    setAviso({ tipo, texto });

    window.clearTimeout(mostrarAviso.temporizador);
    mostrarAviso.temporizador = window.setTimeout(() => {
      setAviso(null);
    }, 4000);
  }, []);

  const comprobarSupabase = useCallback(() => {
    if (!supabase || typeof supabase.from !== "function") {
      mostrarAviso(
        "error",
        "No se ha recibido un cliente Supabase válido en el componente Clientes."
      );
      return false;
    }

    return true;
  }, [supabase, mostrarAviso]);

  const cargarClientes = useCallback(async () => {
    if (!comprobarSupabase()) {
      setCargando(false);
      return;
    }

    setCargando(true);

    try {
      const { data, error } = await supabase
        .from("clientes")
        .select(
          "id, nombre, telefono, estado, token, enlace_personal, created_at, updated_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      mostrarAviso(
        "error",
        obtenerMensajeError(error, "No se pudieron cargar los clientes.")
      );
      setClientes([]);
    } finally {
      setCargando(false);
    }
  }, [comprobarSupabase, mostrarAviso, supabase]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  useEffect(() => {
    return () => {
      window.clearTimeout(mostrarAviso.temporizador);
    };
  }, [mostrarAviso]);

  const clientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) return clientes;

    return clientes.filter((cliente) => {
      const nombre = String(cliente.nombre ?? "").toLowerCase();
      const telefono = String(cliente.telefono ?? "").toLowerCase();

      return nombre.includes(termino) || telefono.includes(termino);
    });
  }, [busqueda, clientes]);

  const totalActivos = useMemo(
    () => clientes.filter((cliente) => cliente.estado === ESTADOS.ACTIVO).length,
    [clientes]
  );

  const totalInactivos = clientes.length - totalActivos;

  function abrirNuevoCliente() {
    setClienteEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setErroresFormulario({});
    setModalAbierto(true);
  }

  function abrirEdicion(cliente) {
    setClienteEditando(cliente);
    setFormulario({
      nombre: cliente.nombre ?? "",
      telefono: cliente.telefono ?? "",
      estado:
        cliente.estado === ESTADOS.INACTIVO
          ? ESTADOS.INACTIVO
          : ESTADOS.ACTIVO,
    });
    setErroresFormulario({});
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;

    setModalAbierto(false);
    setClienteEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setErroresFormulario({});
  }

  function actualizarCampo(campo, valor) {
    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [campo]: valor,
    }));

    setErroresFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [campo]: "",
    }));
  }

  async function guardarCliente(evento) {
    evento.preventDefault();

    const errores = validarFormulario(formulario);

    if (Object.keys(errores).length > 0) {
      setErroresFormulario(errores);
      return;
    }

    if (!comprobarSupabase()) return;

    setGuardando(true);

    const datosBase = {
      nombre: formulario.nombre.trim(),
      telefono: limpiarTelefono(formulario.telefono),
      estado: formulario.estado,
      updated_at: new Date().toISOString(),
    };

    try {
      if (clienteEditando) {
        const { data, error } = await supabase
          .from("clientes")
          .update(datosBase)
          .eq("id", clienteEditando.id)
          .select(
            "id, nombre, telefono, estado, token, enlace_personal, created_at, updated_at"
          )
          .single();

        if (error) throw error;

        setClientes((estadoAnterior) =>
          estadoAnterior.map((cliente) =>
            cliente.id === clienteEditando.id ? data : cliente
          )
        );

        mostrarAviso("exito", "Cliente actualizado correctamente.");
      } else {
        const token = generarToken();

        const nuevoCliente = {
          ...datosBase,
          token,
          enlace_personal: crearEnlacePersonal(token),
        };

        const { data, error } = await supabase
          .from("clientes")
          .insert(nuevoCliente)
          .select(
            "id, nombre, telefono, estado, token, enlace_personal, created_at, updated_at"
          )
          .single();

        if (error) throw error;

        setClientes((estadoAnterior) => [data, ...estadoAnterior]);
        mostrarAviso("exito", "Cliente creado correctamente.");
      }

      cerrarModal();
    } catch (error) {
      mostrarAviso(
        "error",
        obtenerMensajeError(error, "No se pudo guardar el cliente.")
      );
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(cliente) {
    if (!comprobarSupabase()) return;

    const nuevoEstado =
      cliente.estado === ESTADOS.ACTIVO
        ? ESTADOS.INACTIVO
        : ESTADOS.ACTIVO;

    setProcesandoId(cliente.id);

    try {
      const { data, error } = await supabase
        .from("clientes")
        .update({
          estado: nuevoEstado,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cliente.id)
        .select(
          "id, nombre, telefono, estado, token, enlace_personal, created_at, updated_at"
        )
        .single();

      if (error) throw error;

      setClientes((estadoAnterior) =>
        estadoAnterior.map((elemento) =>
          elemento.id === cliente.id ? data : elemento
        )
      );

      mostrarAviso(
        "exito",
        nuevoEstado === ESTADOS.ACTIVO
          ? "Cliente activado."
          : "Cliente desactivado."
      );
    } catch (error) {
      mostrarAviso(
        "error",
        obtenerMensajeError(error, "No se pudo cambiar el estado del cliente.")
      );
    } finally {
      setProcesandoId(null);
    }
  }

  async function copiarEnlace(cliente) {
    const enlace =
      cliente.enlace_personal ||
      (cliente.token ? crearEnlacePersonal(cliente.token) : "");

    if (!enlace) {
      mostrarAviso("error", "Este cliente no tiene enlace personal.");
      return;
    }

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(enlace);
      } else {
        const area = document.createElement("textarea");
        area.value = enlace;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.focus();
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }

      mostrarAviso("exito", "Enlace personal copiado.");
    } catch {
      mostrarAviso("error", "No se pudo copiar el enlace.");
    }
  }

  async function eliminarCliente() {
    if (!clienteAEliminar || !comprobarSupabase()) return;

    setProcesandoId(clienteAEliminar.id);

    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", clienteAEliminar.id);

      if (error) throw error;

      setClientes((estadoAnterior) =>
        estadoAnterior.filter(
          (cliente) => cliente.id !== clienteAEliminar.id
        )
      );

      mostrarAviso("exito", "Cliente eliminado definitivamente.");
      setClienteAEliminar(null);
    } catch (error) {
      mostrarAviso(
        "error",
        obtenerMensajeError(error, "No se pudo eliminar el cliente.")
      );
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <section style={estilos.pagina}>
      <div style={estilos.cabecera}>
        <div>
          <h1 style={estilos.titulo}>Clientes</h1>
          <p style={estilos.descripcion}>
            Gestiona los clientes y sus enlaces personales.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevoCliente}
          style={estilos.botonPrincipal}
        >
          + Nuevo cliente
        </button>
      </div>

      <div style={estilos.resumen}>
        <TarjetaResumen etiqueta="Total" valor={clientes.length} />
        <TarjetaResumen etiqueta="Activos" valor={totalActivos} />
        <TarjetaResumen etiqueta="Inactivos" valor={totalInactivos} />
      </div>

      <div style={estilos.herramientas}>
        <input
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar por nombre o teléfono"
          style={estilos.buscador}
        />

        <button
          type="button"
          onClick={cargarClientes}
          disabled={cargando}
          style={estilos.botonSecundario}
        >
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {aviso && (
        <div
          role="alert"
          style={{
            ...estilos.aviso,
            ...(aviso.tipo === "error"
              ? estilos.avisoError
              : estilos.avisoExito),
          }}
        >
          {aviso.texto}
        </div>
      )}

      <div style={estilos.panel}>
        {cargando ? (
          <EstadoVacio texto="Cargando clientes..." />
        ) : clientesFiltrados.length === 0 ? (
          <EstadoVacio
            texto={
              busqueda
                ? "No hay clientes que coincidan con la búsqueda."
                : "Todavía no hay clientes registrados."
            }
          />
        ) : (
          <div style={estilos.contenedorTabla}>
            <table style={estilos.tabla}>
              <thead>
                <tr>
                  <th style={estilos.celdaCabecera}>Nombre</th>
                  <th style={estilos.celdaCabecera}>Teléfono</th>
                  <th style={estilos.celdaCabecera}>Copiar enlace</th>
                  <th style={estilos.celdaCabecera}>Estado</th>
                  <th style={estilos.celdaCabecera}>Fecha de alta</th>
                  <th
                    style={{
                      ...estilos.celdaCabecera,
                      textAlign: "right",
                    }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {clientesFiltrados.map((cliente) => {
                  const procesando = procesandoId === cliente.id;
                  const activo = cliente.estado === ESTADOS.ACTIVO;

                  return (
                    <tr key={cliente.id}>
                      <td style={estilos.celda}>
                        <strong>{cliente.nombre}</strong>
                      </td>

                      <td style={estilos.celda}>
                        {cliente.telefono || "—"}
                      </td>

                      <td style={estilos.celda}>
                        <button
                          type="button"
                          onClick={() => copiarEnlace(cliente)}
                          style={estilos.botonEnlace}
                        >
                          Copiar enlace
                        </button>
                      </td>

                      <td style={estilos.celda}>
                        <span
                          style={{
                            ...estilos.insignia,
                            ...(activo
                              ? estilos.insigniaActiva
                              : estilos.insigniaInactiva),
                          }}
                        >
                          {activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td style={estilos.celda}>
                        {formatearFecha(cliente.created_at)}
                      </td>

                      <td
                        style={{
                          ...estilos.celda,
                          textAlign: "right",
                        }}
                      >
                        <div style={estilos.acciones}>
                          <button
                            type="button"
                            onClick={() => abrirEdicion(cliente)}
                            disabled={procesando}
                            style={estilos.botonAccion}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => cambiarEstado(cliente)}
                            disabled={procesando}
                            style={estilos.botonAccion}
                          >
                            {activo ? "Desactivar" : "Activar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setClienteAEliminar(cliente)}
                            disabled={procesando}
                            style={estilos.botonPeligro}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAbierto && (
        <Modal onCerrar={cerrarModal}>
          <div style={estilos.modalCabecera}>
            <div>
              <h2 style={estilos.modalTitulo}>
                {clienteEditando ? "Editar cliente" : "Nuevo cliente"}
              </h2>
              <p style={estilos.modalDescripcion}>
                {clienteEditando
                  ? "Modifica los datos del cliente."
                  : "Introduce los datos para crear el cliente."}
              </p>
            </div>

            <button
              type="button"
              onClick={cerrarModal}
              style={estilos.botonCerrar}
              aria-label="Cerrar ventana"
            >
              ×
            </button>
          </div>

          <form onSubmit={guardarCliente}>
            <CampoFormulario
              etiqueta="Nombre"
              error={erroresFormulario.nombre}
            >
              <input
                type="text"
                value={formulario.nombre}
                onChange={(evento) =>
                  actualizarCampo("nombre", evento.target.value)
                }
                style={{
                  ...estilos.input,
                  ...(erroresFormulario.nombre
                    ? estilos.inputConError
                    : {}),
                }}
                placeholder="Nombre del cliente"
                autoFocus
              />
            </CampoFormulario>

            <CampoFormulario
              etiqueta="Teléfono"
              error={erroresFormulario.telefono}
            >
              <input
                type="tel"
                value={formulario.telefono}
                onChange={(evento) =>
                  actualizarCampo("telefono", evento.target.value)
                }
                style={{
                  ...estilos.input,
                  ...(erroresFormulario.telefono
                    ? estilos.inputConError
                    : {}),
                }}
                placeholder="+34 600 000 000"
              />
            </CampoFormulario>

            <CampoFormulario etiqueta="Estado">
              <select
                value={formulario.estado}
                onChange={(evento) =>
                  actualizarCampo("estado", evento.target.value)
                }
                style={estilos.input}
              >
                <option value={ESTADOS.ACTIVO}>Activo</option>
                <option value={ESTADOS.INACTIVO}>Inactivo</option>
              </select>
            </CampoFormulario>

            {!clienteEditando && (
              <div style={estilos.informacionToken}>
                El token y el enlace personal se generarán automáticamente.
              </div>
            )}

            <div style={estilos.modalAcciones}>
              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                style={estilos.botonSecundario}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                style={estilos.botonPrincipal}
              >
                {guardando
                  ? "Guardando..."
                  : clienteEditando
                    ? "Guardar cambios"
                    : "Crear cliente"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {clienteAEliminar && (
        <Modal onCerrar={() => setClienteAEliminar(null)}>
          <h2 style={estilos.modalTitulo}>Eliminar cliente</h2>

          <p style={estilos.textoConfirmacion}>
            Se eliminará definitivamente a{" "}
            <strong>{clienteAEliminar.nombre}</strong> y toda la información
            relacionada mediante las reglas de borrado de la base de datos.
          </p>

          <p style={estilos.advertencia}>
            Esta acción no se puede deshacer.
          </p>

          <div style={estilos.modalAcciones}>
            <button
              type="button"
              onClick={() => setClienteAEliminar(null)}
              disabled={procesandoId === clienteAEliminar.id}
              style={estilos.botonSecundario}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={eliminarCliente}
              disabled={procesandoId === clienteAEliminar.id}
              style={estilos.botonEliminarConfirmacion}
            >
              {procesandoId === clienteAEliminar.id
                ? "Eliminando..."
                : "Eliminar definitivamente"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function TarjetaResumen({ etiqueta, valor }) {
  return (
    <div style={estilos.tarjetaResumen}>
      <span style={estilos.resumenEtiqueta}>{etiqueta}</span>
      <strong style={estilos.resumenValor}>{valor}</strong>
    </div>
  );
}

function CampoFormulario({ etiqueta, error, children }) {
  return (
    <label style={estilos.campo}>
      <span style={estilos.etiqueta}>{etiqueta}</span>
      {children}
      {error && <span style={estilos.errorCampo}>{error}</span>}
    </label>
  );
}

function EstadoVacio({ texto }) {
  return <div style={estilos.estadoVacio}>{texto}</div>;
}

function Modal({ onCerrar, children }) {
  function controlarTecla(evento) {
    if (evento.key === "Escape") {
      onCerrar();
    }
  }

  return (
    <div
      style={estilos.fondoModal}
      onMouseDown={onCerrar}
      onKeyDown={controlarTecla}
      role="presentation"
    >
      <div
        style={estilos.modal}
        onMouseDown={(evento) => evento.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    width: "100%",
    boxSizing: "border-box",
    padding: "24px",
    color: "#172033",
  },

  cabecera: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  titulo: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.2,
    fontWeight: 800,
  },

  descripcion: {
    margin: "6px 0 0",
    color: "#687386",
    fontSize: "15px",
  },

  resumen: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },

  tarjetaResumen: {
    border: "1px solid #e5e9f0",
    borderRadius: "14px",
    background: "#ffffff",
    padding: "16px 18px",
    boxShadow: "0 4px 16px rgba(20, 34, 66, 0.05)",
  },

  resumenEtiqueta: {
    display: "block",
    color: "#758095",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "6px",
  },

  resumenValor: {
    fontSize: "25px",
  },

  herramientas: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "14px",
  },

  buscador: {
    flex: 1,
    minWidth: "240px",
    height: "43px",
    border: "1px solid #d8dee8",
    borderRadius: "10px",
    padding: "0 14px",
    background: "#ffffff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  panel: {
    border: "1px solid #e5e9f0",
    borderRadius: "14px",
    background: "#ffffff",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(20, 34, 66, 0.06)",
  },

  contenedorTabla: {
    width: "100%",
    overflowX: "auto",
  },

  tabla: {
    width: "100%",
    minWidth: "980px",
    borderCollapse: "collapse",
  },

  celdaCabecera: {
    padding: "14px 16px",
    background: "#f7f9fc",
    borderBottom: "1px solid #e5e9f0",
    color: "#667085",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  celda: {
    padding: "15px 16px",
    borderBottom: "1px solid #edf0f5",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  acciones: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  botonPrincipal: {
    minHeight: "42px",
    border: 0,
    borderRadius: "10px",
    padding: "10px 16px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  botonSecundario: {
    minHeight: "42px",
    border: "1px solid #d5dbe5",
    borderRadius: "10px",
    padding: "9px 15px",
    background: "#ffffff",
    color: "#344054",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },

  botonAccion: {
    border: "1px solid #d5dbe5",
    borderRadius: "8px",
    padding: "7px 10px",
    background: "#ffffff",
    color: "#344054",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  botonPeligro: {
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "7px 10px",
    background: "#fff5f5",
    color: "#b42318",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  botonEnlace: {
    border: 0,
    padding: 0,
    background: "transparent",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  insignia: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "5px 9px",
    fontSize: "12px",
    fontWeight: 800,
  },

  insigniaActiva: {
    background: "#dcfce7",
    color: "#166534",
  },

  insigniaInactiva: {
    background: "#f1f3f6",
    color: "#667085",
  },

  aviso: {
    marginBottom: "14px",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: 700,
  },

  avisoExito: {
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#166534",
  },

  avisoError: {
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#b42318",
  },

  estadoVacio: {
    padding: "52px 20px",
    color: "#7a8496",
    textAlign: "center",
    fontSize: "15px",
  },

  fondoModal: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "rgba(15, 23, 42, 0.58)",
  },

  modal: {
    width: "100%",
    maxWidth: "540px",
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto",
    borderRadius: "16px",
    background: "#ffffff",
    padding: "24px",
    boxSizing: "border-box",
    boxShadow: "0 28px 70px rgba(15, 23, 42, 0.30)",
  },

  modalCabecera: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "20px",
  },

  modalTitulo: {
    margin: 0,
    color: "#172033",
    fontSize: "23px",
  },

  modalDescripcion: {
    margin: "6px 0 0",
    color: "#778196",
    fontSize: "14px",
  },

  botonCerrar: {
    alignSelf: "flex-start",
    border: 0,
    background: "transparent",
    color: "#667085",
    fontSize: "30px",
    lineHeight: 1,
    cursor: "pointer",
  },

  campo: {
    display: "block",
    marginBottom: "16px",
  },

  etiqueta: {
    display: "block",
    marginBottom: "7px",
    color: "#344054",
    fontSize: "14px",
    fontWeight: 800,
  },

  input: {
    width: "100%",
    height: "43px",
    border: "1px solid #d5dbe5",
    borderRadius: "10px",
    padding: "0 12px",
    background: "#ffffff",
    color: "#172033",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  inputConError: {
    borderColor: "#ef4444",
  },

  errorCampo: {
    display: "block",
    marginTop: "6px",
    color: "#b42318",
    fontSize: "12px",
    fontWeight: 700,
  },

  informacionToken: {
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "11px 13px",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  modalAcciones: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "24px",
  },

  textoConfirmacion: {
    color: "#475467",
    lineHeight: 1.65,
    margin: "16px 0 10px",
  },

  advertencia: {
    color: "#b42318",
    fontWeight: 800,
  },

  botonEliminarConfirmacion: {
    minHeight: "42px",
    border: 0,
    borderRadius: "10px",
    padding: "10px 16px",
    background: "#dc2626",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },
};

export function construirTextoPedidoWhatsApp({
  t,
  itemsPedido,
  customerNamePedido,
  notesPedido,
  premio = null,
  participacionRuleta = null,
  codigoParticipacion = null,
}) {
  const lines = [];

  lines.push(`*${t.orderSummary}*`);
  lines.push("");

  if (customerNamePedido) {
    lines.push(`*${t.customer}:* ${customerNamePedido}`);
    lines.push("");
  }

  const itemsOrdenados = [...itemsPedido].sort((a, b) => {
    const departamentoA = String(
      a.product.department || a.product.departamento || "SIN DEPARTAMENTO"
    );

    const departamentoB = String(
      b.product.department || b.product.departamento || "SIN DEPARTAMENTO"
    );

    const compararDepartamento = departamentoA.localeCompare(
      departamentoB,
      "es",
      { sensitivity: "base" }
    );

    if (compararDepartamento !== 0) return compararDepartamento;

    return String(a.product.name || "").localeCompare(
      String(b.product.name || ""),
      "es",
      { sensitivity: "base" }
    );
  });

  itemsOrdenados.forEach((item) => {
    const product = item.product;

    lines.push(String(product.name || "").trim());

    if (item.boxes) {
      lines.push(`*${item.boxes} ${t.boxesLower}*`);
    }

    if (item.units) {
      lines.push(`*${item.units} ${t.unitsLower}*`);
    }

    if (item.notes.trim()) {
      lines.push(`${t.notes}: ${item.notes.trim()}`);
    }

    lines.push("");
  });

  if (notesPedido) {
    lines.push(`*${t.notes}:* ${notesPedido}`);
    lines.push("");
  }

  const codigoRuleta =
    codigoParticipacion ||
    participacionRuleta?.code ||
    participacionRuleta?.codigo ||
    null;

  if (codigoRuleta) {
    lines.push("🎁 *PARTICIPACIÓN CONSEGUIDA*");
    lines.push("");
    lines.push(`Código: *${codigoRuleta}*`);
    lines.push("");
    lines.push("Presenta este código en caja para girar la ruleta.");
    lines.push("");
  } else if (premio) {
    lines.push("🎁 *PREMIO RULETA:*");
    lines.push(`*${premio.nombre}*`);

    if (premio.codigo) {
      lines.push(`Código: ${premio.codigo}`);
    }

    lines.push("");
  }

  lines.push(t.sentFrom);

  return lines.join("\n");
}

export function abrirPedidoEnWhatsApp({ whatsappNumber, texto }) {
  const message = encodeURIComponent(texto);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  window.location.assign(whatsappUrl);
}

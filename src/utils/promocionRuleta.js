export function calcularCajasPermitidasPedido({
  itemsPedido = [],
  codigosPermitidos = [],
}) {
  const permitidos = new Set(
    codigosPermitidos.map((codigo) => String(codigo).trim())
  );

  return itemsPedido.reduce((total, item) => {
    const codigoArticulo = String(
      item.product.codigo || item.product.idnum || ""
    ).trim();

    if (!permitidos.has(codigoArticulo)) {
      return total;
    }

    return total + Number(item.boxes || 0);
  }, 0);
}

export function pedidoCumplePromocionRuleta({
  itemsPedido = [],
  codigosPermitidos = [],
  cajasMinimas = 6,
}) {
  const cajasValidas = calcularCajasPermitidasPedido({
    itemsPedido,
    codigosPermitidos,
  });

  return cajasValidas >= Number(cajasMinimas || 0);
}

export function obtenerResumenPromocionRuleta({
  itemsPedido = [],
  codigosPermitidos = [],
  cajasMinimas = 6,
}) {
  const cajasValidas = calcularCajasPermitidasPedido({
    itemsPedido,
    codigosPermitidos,
  });

  const minimo = Number(cajasMinimas || 0);

  return {
    cumple: cajasValidas >= minimo,
    cajasValidas,
    cajasMinimas: minimo,
    cajasRestantes: Math.max(0, minimo - cajasValidas),
  };
}

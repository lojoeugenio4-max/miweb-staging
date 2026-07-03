export function calcularCajasPermitidasPedido({
  itemsPedido = [],
  codigosPermitidos = [],
  departamentosPermitidos = [],
}) {
  const codigos = new Set(
    codigosPermitidos.map((codigo) => String(codigo).trim())
  );

  const departamentos = new Set(
    departamentosPermitidos.map((id) => String(id).trim())
  );

  return itemsPedido.reduce((total, item) => {
    const codigoArticulo = String(
      item.product.codigo || item.product.idnum || ""
    ).trim();

    const departamentoId = String(
      item.product.departamento_id || item.product.department_id || ""
    ).trim();

    const cuentaPorCodigo = codigos.has(codigoArticulo);
    const cuentaPorDepartamento = departamentos.has(departamentoId);

    if (!cuentaPorCodigo && !cuentaPorDepartamento) {
      return total;
    }

    return total + Number(item.boxes || 0);
  }, 0);
}

export function pedidoCumplePromocionRuleta({
  itemsPedido = [],
  codigosPermitidos = [],
  departamentosPermitidos = [],
  cajasMinimas = 6,
}) {
  const cajasValidas = calcularCajasPermitidasPedido({
    itemsPedido,
    codigosPermitidos,
    departamentosPermitidos,
  });

  return cajasValidas >= Number(cajasMinimas || 0);
}

export function obtenerResumenPromocionRuleta({
  itemsPedido = [],
  codigosPermitidos = [],
  departamentosPermitidos = [],
  cajasMinimas = 6,
}) {
  const cajasValidas = calcularCajasPermitidasPedido({
    itemsPedido,
    codigosPermitidos,
    departamentosPermitidos,
  });

  const minimo = Number(cajasMinimas || 0);

  return {
    cumple: cajasValidas >= minimo,
    cajasValidas,
    cajasMinimas: minimo,
    cajasRestantes: Math.max(0, minimo - cajasValidas),
  };
}

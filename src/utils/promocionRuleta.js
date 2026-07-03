export function calcularCajasTotalesPedido(itemsPedido = []) {
  return itemsPedido.reduce((total, item) => {
    return total + Number(item.boxes || 0);
  }, 0);
}

export function pedidoCumplePromocionRuleta(itemsPedido = []) {
  const cajasTotales = calcularCajasTotalesPedido(itemsPedido);

  return cajasTotales >= 6;
}

export function obtenerResumenPromocionRuleta(itemsPedido = []) {
  const cajasTotales = calcularCajasTotalesPedido(itemsPedido);

  return {
    cumple: cajasTotales >= 6,
    cajasTotales,
    cajasNecesarias: 6,
    cajasRestantes: Math.max(0, 6 - cajasTotales),
  };
}

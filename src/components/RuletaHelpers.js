export function filtrarPremiosDisponibles(premios = []) {
  return premios.filter((premio) => {
    if (!premio.activo) return false;

    if (premio.stock === null) return true;

    return Number(premio.stock) > 0;
  });
}

export function calcularTotalProbabilidad(premios = []) {
  return premios.reduce(
    (total, premio) => total + Number(premio.probabilidad || 0),
    0
  );
}

export function elegirPremio(premios = []) {
  const disponibles = filtrarPremiosDisponibles(premios);

  if (!disponibles.length) return null;

  const total = calcularTotalProbabilidad(disponibles);

  if (total <= 0) {
    return disponibles[
      Math.floor(Math.random() * disponibles.length)
    ];
  }

  const numero = Math.random() * total;

  let acumulado = 0;

  for (const premio of disponibles) {
    acumulado += Number(premio.probabilidad || 0);

    if (numero <= acumulado) {
      return premio;
    }
  }

  return disponibles[disponibles.length - 1];
}

export function calcularIndicePremio(
  premios = [],
  premioGanador
) {
  return premios.findIndex(
    (premio) => premio.id === premioGanador.id
  );
}

export function calcularRotacionDestino({
  rotacionActual,
  indiceGanador,
  totalPremios,
}) {
  const gradosSector = 360 / totalPremios;

  const centroSector =
    indiceGanador * gradosSector + gradosSector / 2;

  const destino =
    rotacionActual +
    360 * 6 +
    (360 - centroSector);

  return destino;
}

export async function descontarStock(
  supabase,
  premio
) {
  if (premio.stock === null) return;

  if (Number(premio.stock) <= 0) return;

  await supabase
    .from("promociones_ruleta_premios")
    .update({
      stock: Number(premio.stock) - 1,
    })
    .eq("id", premio.id);
}

export function crearGradient(premios) {
  const grados = 360 / premios.length;

  return `conic-gradient(${premios
    .map((premio, index) => {
      const inicio = index * grados;
      const fin = inicio + grados;

      return `${premio.color || "#f59e0b"} ${inicio}deg ${fin}deg`;
    })
    .join(",")})`;
}

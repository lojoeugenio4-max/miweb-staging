import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function RuletaQR({
  codigo,
  onValidado,
  onError,
}) {
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    if (!codigo) return;
    validar();
  }, [codigo]);

  async function validar() {
    setVerificando(true);

    const { data, error } = await supabase
      .from("participaciones_ruleta")
      .select("*")
      .eq("codigo", codigo)
      .maybeSingle();

    setVerificando(false);

    if (error) {
      onError?.("No se pudo validar el código.");
      return;
    }

    if (!data) {
      onError?.("Código no válido.");
      return;
    }

    if (data.utilizado) {
      onError?.("Este código ya ha sido utilizado.");
      return;
    }

    onValidado?.(data);
  }

  return (
    <div style={contenedor}>
      {verificando ? "Validando código..." : null}
    </div>
  );
}

const contenedor = {
  minHeight: 24,
};

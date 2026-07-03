import React from "react";
import RuletaFila from "./RuletaFila";

export default function RuletaTabla({
  premios,
  onEditar,
  onEliminar,
  loading = false,
}) {
  if (!premios || premios.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
        No hay premios creados.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3">Premio</th>
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Probabilidad</th>
              <th className="text-left px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Color</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {premios.map((premio) => (
              <RuletaFila
                key={premio.id}
                premio={premio}
                onEditar={onEditar}
                onEliminar={onEliminar}
                loading={loading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

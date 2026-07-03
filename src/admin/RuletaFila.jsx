import React from "react";

export default function RuletaFila({ premio, onEditar, onEliminar, loading }) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 font-medium">
        {premio.nombre}
      </td>

      <td className="px-4 py-3">
        {premio.codigo || "-"}
      </td>

      <td className="px-4 py-3">
        {premio.probabilidad}%
      </td>

      <td className="px-4 py-3">
        {premio.stock === null || premio.stock === "" || premio.stock === undefined
          ? "Ilimitado"
          : premio.stock}
      </td>

      <td className="px-4 py-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            premio.activo
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {premio.activo ? "Activo" : "Inactivo"}
        </span>
      </td>

      <td className="px-4 py-3">
        <div
          className="w-8 h-8 rounded-full border"
          style={{ backgroundColor: premio.color || "#cccccc" }}
          title={premio.color}
        />
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEditar(premio)}
            disabled={loading}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => onEliminar(premio.id)}
            disabled={loading}
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}

import { useState } from "react";

export default function Clientes() {
  const [clientes] = useState([]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuevo cliente
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Teléfono</th>
              <th className="text-center p-3">Enlace</th>
              <th className="text-center p-3">Estado</th>
              <th className="text-center p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clientes.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-500 p-8"
                >
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

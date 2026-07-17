import { useState } from "react";

export default function Clientes() {
  const [clientes] = useState([]);

  return (
    <div style={{padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h1>Clientes</h1>
        <button>Nuevo cliente</button>
      </div>

      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Enlace</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length===0 && (
            <tr>
              <td colSpan={5} style={{textAlign:"center",padding:30}}>
                No hay clientes registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

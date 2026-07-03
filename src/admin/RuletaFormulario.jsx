import React from "react";

export default function RuletaFormulario({
  form,
  setForm,
  onSubmit,
  loading = false,
}) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-5">
        Añadir premio a la ruleta
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre del premio
          </label>

          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Ej: Pizza Familiar"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Probabilidad (%)
          </label>

          <input
            type="number"
            name="probabilidad"
            value={form.probabilidad}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            max="100"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Código de premio
          </label>

          <input
            type="text"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Ej: PIZZA100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Color
          </label>

          <input
            type="color"
            name="color"
            value={form.color}
            onChange={handleChange}
            className="w-full h-11 border rounded-lg p-1 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Stock (opcional)
          </label>

          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            placeholder="Vacío = ilimitado"
          />
        </div>

        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
            />

            <span className="text-sm font-medium">
              Premio activo
            </span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Descripción
          </label>

          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Descripción del premio..."
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition"
        >
          {loading ? "Guardando..." : "Guardar premio"}
        </button>
      </div>
    </form>
  );
}

import fs from "fs";
import path from "path";

const origen = "./public/fotos-originales";
const destino = "./public/productos";

const productos = [
  "AGUA LANJARON 1.5L PACK 6",
  "AGUA FUENTELAJARA 0.5L",
  "AGUA LANJARON 0.5L",
  "AGUA VALTORRE 0.5L PITORRO",
  // añade aquí todos los productos visibles en el mismo orden
];

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

if (!fs.existsSync(destino)) {
  fs.mkdirSync(destino, { recursive: true });
}

const fotos = fs
  .readdirSync(origen)
  .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
  .sort();

productos.forEach((producto, index) => {
  const foto = fotos[index];
  if (!foto) return;

  const extension = path.extname(foto).toLowerCase();
  const nuevoNombre = `${slugify(producto)}${extension}`;

  fs.copyFileSync(
    path.join(origen, foto),
    path.join(destino, nuevoNombre)
  );

  console.log(`${foto} → ${nuevoNombre}`);
});

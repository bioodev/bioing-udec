// Verifica los datos estructurados (JSON-LD) del build estático.
// Recorre dist/**/*.html (excepto el panel /admin), extrae los <script type="application/ld+json">,
// los parsea y falla si alguno no es JSON válido o si algún objeto de primer nivel no declara
// @context y @type. Imprime un resumen por tipo de página.
//
// Uso: npm run build && npm run verificar:jsonld   (o node scripts/verificar-jsonld.mjs)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SITIO = 'dist';
const EXCLUIDAS = new Set(['admin']); // el panel de Sveltia no usa Base.astro

function htmlDe(dir) {
  const resultado = [];
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    const rel = relative(SITIO, ruta);
    if (statSync(ruta).isDirectory()) {
      if (!EXCLUIDAS.has(rel.split(sep)[0])) resultado.push(...htmlDe(ruta));
    } else if (entrada.endsWith('.html')) {
      resultado.push(ruta);
    }
  }
  return resultado;
}

/** Categoría legible según la ruta (dist/…/index.html). */
function categoria(ruta) {
  const rel = relative(SITIO, ruta).split(sep).join('/');
  if (rel === 'index.html') return 'Inicio';
  if (rel.endsWith('/index.html')) {
    const partes = rel.slice(0, -'/index.html'.length).split('/');
    if (partes.length === 1) return `Listado: /${partes[0]}`;
    if (partes.length === 2) return `Ficha: /${partes[0]}/…`;
  }
  return `Otros: /${rel.replace(/index\.html$/, '')}`;
}

/** Objetos de primer nivel de un bloque (un arreglo JSON-LD es válido). */
const objetosDe = (dato) => (Array.isArray(dato) ? dato : [dato]);

const BLOQUE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;

const paginas = htmlDe(SITIO);
const porCategoria = new Map();
let bloques = 0;
const errores = [];

for (const ruta of paginas) {
  const html = readFileSync(ruta, 'utf8');
  const encontrados = [...html.matchAll(BLOQUE)];
  if (encontrados.length === 0) {
    errores.push(`${ruta}: sin bloques application/ld+json`);
    continue;
  }
  const cat = categoria(ruta);
  const tipos = porCategoria.get(cat) ?? { paginas: 0, bloques: 0, tipos: new Set() };
  tipos.paginas++;
  for (const [, contenido] of encontrados) {
    bloques++;
    tipos.bloques++;
    let dato;
    try {
      dato = JSON.parse(contenido);
    } catch (e) {
      errores.push(`${ruta}: JSON-LD inválido (${e.message})`);
      continue;
    }
    for (const objeto of objetosDe(dato)) {
      if (typeof objeto !== 'object' || objeto === null) {
        errores.push(`${ruta}: bloque que no es objeto`);
        continue;
      }
      if (!objeto['@context']) errores.push(`${ruta}: objeto sin @context`);
      if (!objeto['@type']) errores.push(`${ruta}: objeto sin @type`);
      if (objeto['@type']) tipos.tipos.add(objeto['@type']);
    }
  }
  porCategoria.set(cat, tipos);
}

console.log(`JSON-LD: ${paginas.length} página(s), ${bloques} bloque(s)`);
for (const [cat, info] of [...porCategoria].sort()) {
  console.log(`  ${cat}: ${info.paginas} página(s), tipos [${[...info.tipos].sort().join(', ')}]`);
}

if (errores.length) {
  console.error(`\n${errores.length} error(es):`);
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\nOK: todos los bloques son JSON válido con @context y @type.');

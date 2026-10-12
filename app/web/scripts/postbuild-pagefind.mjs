// Postbuild: indexa dist/ con Pagefind excluyendo /admin y /componentes (filtro de ruta).
// Ejecutar tras `astro build` (script package.json: postbuild).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createIndex, close } from 'pagefind';

const SITIO = 'dist';
// Rutas (relativas al sitio) que no deben indexarse.
const EXCLUIDAS = new Set(['admin', 'componentes']);

/** Recorre `dir` (relativo a cwd) y devuelve los .html indexables. */
function htmlIndexables(dir) {
  const resultado = [];
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    const rel = relative(SITIO, ruta);
    const esExcluida = rel.split(sep)[0] && EXCLUIDAS.has(rel.split(sep)[0]);
    if (statSync(ruta).isDirectory()) {
      if (!esExcluida && entrada !== 'pagefind') resultado.push(...htmlIndexables(ruta));
    } else if (entrada.endsWith('.html')) {
      resultado.push(ruta);
    }
  }
  return resultado;
}

// URL pública de cada archivo, imitando el comportamiento del CLI (quita `index.html`).
function urlDesde(ruta) {
  const rel = relative(SITIO, ruta).split(sep).join('/');
  return '/' + rel.replace(/index\.html$/, '');
}

const { index, errors } = await createIndex();
if (errors.length) {
  console.error('[postbuild] errores al crear el índice:', errors);
  process.exit(1);
}

// Páginas con «No mostrar en buscadores» (noindex, ADR 0010): no entran al índice del buscador.
const archivos = htmlIndexables(SITIO);
const indexables = archivos.filter((archivo) => !/<meta name="robots" content="noindex"/.test(readFileSync(archivo, 'utf8')));
for (const archivo of indexables) {
  const respuesta = await index.addHTMLFile({
    sourcePath: archivo,
    url: urlDesde(archivo),
    content: readFileSync(archivo, 'utf8'),
  });
  if (respuesta.errors.length) {
    console.error(`[postbuild] error indexando ${archivo}:`, respuesta.errors);
    process.exit(1);
  }
}

const { errors: erroresEscritura, outputPath } = await index.writeFiles({ outputPath: join(SITIO, 'pagefind') });
await close();
if (erroresEscritura.length) {
  console.error('[postbuild] errores al escribir el índice:', erroresEscritura);
  process.exit(1);
}
console.log(`[postbuild] Pagefind: ${indexables.length} página(s) indexada(s) en ${outputPath} (${archivos.length - indexables.length} con noindex fuera del índice)`);
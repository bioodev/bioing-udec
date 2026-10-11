// Postbuild: agrega a la CSP pública (regla /* de dist/_headers) el hash sha256 de cada
// <script> inline ejecutable del build, para no necesitar 'unsafe-inline' en script-src.
// Se excluye /admin: tiene su propia regla de CSP en public/_headers.
// Ejecutar tras `astro build` (script package.json: postbuild, después de Pagefind).
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { actualizarScriptSrc, extraerScriptsInline, hashScript } from '../src/lib/csp.ts';

const SITIO = 'dist';
const EXCLUIDAS = new Set(['admin']);

/** Recorre `dir` y devuelve los .html del sitio público. */
function htmlPublicos(dir) {
  const resultado = [];
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    const rel = relative(SITIO, ruta).split(sep);
    if (statSync(ruta).isDirectory()) {
      if (!EXCLUIDAS.has(rel[0])) resultado.push(...htmlPublicos(ruta));
    } else if (entrada.endsWith('.html')) {
      resultado.push(ruta);
    }
  }
  return resultado;
}

const archivosHtml = htmlPublicos(SITIO);
const hashes = new Set();
for (const archivo of archivosHtml) {
  for (const texto of extraerScriptsInline(readFileSync(archivo, 'utf8'))) {
    hashes.add(hashScript(texto));
  }
}
const lista = [...hashes].sort();

const rutaHeaders = join(SITIO, '_headers');
const headersOriginal = readFileSync(rutaHeaders, 'utf8');
const headers = actualizarScriptSrc(headersOriginal, lista);
writeFileSync(rutaHeaders, headers);

// Comprobación: cada script inline ejecutable de dist debe tener su hash en la regla /*.
const inicioAdmin = headers.indexOf('\n/admin/*');
const reglaPublica = inicioAdmin === -1 ? headers : headers.slice(0, inicioAdmin);
const faltantes = [];
for (const archivo of archivosHtml) {
  for (const texto of extraerScriptsInline(readFileSync(archivo, 'utf8'))) {
    const hash = hashScript(texto);
    if (!reglaPublica.includes(`'${hash}'`)) faltantes.push(`${archivo}: ${hash}`);
  }
}
if (faltantes.length) {
  console.error('[postbuild-csp] scripts inline sin hash en _headers:\n' + faltantes.join('\n'));
  process.exit(1);
}
console.log(`[postbuild-csp] ${lista.length} hash(es) de script inline en ${rutaHeaders} (${archivosHtml.length} página(s))`);

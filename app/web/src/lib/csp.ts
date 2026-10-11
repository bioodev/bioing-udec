// Lógica pura de la CSP pública: hashes de scripts inline para public/_headers.
// La usa scripts/postbuild-csp.mjs tras el build; no se importa desde las páginas.
import { createHash } from 'node:crypto';

// Tipos de <script> que el navegador ejecuta. Los demás (ld+json, importmap, plantillas)
// no se ejecutan, así que no necesitan hash.
const TIPOS_EJECUTABLES = new Set(['', 'module', 'text/javascript', 'application/javascript']);

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const HASH_TOKEN = /^'sha256-[^']+'$/;

/** Texto exacto de cada <script> inline ejecutable del HTML (sin src, sin bloques de datos). */
export function extraerScriptsInline(html: string): string[] {
  const scripts: string[] = [];
  for (const [, atributos, cuerpo] of html.matchAll(SCRIPT)) {
    if (/\bsrc\s*=/i.test(atributos!)) continue;
    const tipo = atributos!.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase() ?? '';
    if (TIPOS_EJECUTABLES.has(tipo)) scripts.push(cuerpo!);
  }
  return scripts;
}

/** Hash CSP de un script inline (sha256-<base64>) sobre su texto exacto, sin comillas. */
export function hashScript(texto: string): string {
  return `sha256-${createHash('sha256').update(texto, 'utf8').digest('base64')}`;
}

/**
 * Reemplaza los hashes sha256 de script-src en la regla `/*` de un archivo _headers.
 * Idempotente: quita los hashes previos y deja los recibidos. No toca otras reglas.
 */
export function actualizarScriptSrc(headers: string, hashes: string[]): string {
  const lineas = headers.split('\n');
  let enRegla = false;
  let actualizada = false;

  const salida = lineas.map((linea) => {
    // Las líneas de ruta no están indentadas; las cabeceras sí.
    if (/^\S/.test(linea) && !linea.startsWith('#')) {
      enRegla = linea.trim() === '/*';
      return linea;
    }
    if (!enRegla || !/^\s+Content-Security-Policy:/i.test(linea) || !/\bscript-src\b/.test(linea)) {
      return linea;
    }
    actualizada = true;
    return linea.replace(/(\bscript-src\b)([^;]*)/, (_, directiva: string, fuentes: string) => {
      const conservadas = fuentes.trim().split(/\s+/).filter((f) => f && !HASH_TOKEN.test(f));
      const nuevas = hashes.map((h) => `'${h}'`);
      return `${directiva} ${[...conservadas, ...nuevas].join(' ')}`;
    });
  });

  if (!actualizada) throw new Error('No se encontró script-src en la regla /* de _headers');
  return salida.join('\n');
}

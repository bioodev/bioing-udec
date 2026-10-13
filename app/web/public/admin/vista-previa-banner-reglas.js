// Reglas puras de la vista previa de Banners en el panel. Sin dependencias ni build: el panel las carga tal cual.
// Son una copia de la vigencia de src/lib/reglas.ts (estaVigente: inicio y fin incluidos) y del enlace externo de
// src/components/HeroCarrusel.astro (externo = http o https). Si cambia una, cambia la otra
// (src/lib/vista-previa-banner.test.ts las prueba).

const ZONA_HORARIA = 'America/Santiago';

/**
 * Límite del título del slide. Medido en el sitio a 375 px (text-4xl, 36 px, con el margen de 16 px): hasta 56
 * caracteres el título ocupa cuatro líneas y el slide conserva su alto mínimo (min-h-[32rem], 512 px). Desde 57
 * pasa a cinco líneas y el slide crece hasta 540 px. El botón sigue visible en ambos casos.
 */
export const LIMITE_TITULO_BANNER = 56;

/**
 * Límite de la etiqueta sobre el título (texto corto, en mayúsculas). Con 30 caracteres cabe en una línea del
 * slide, también a 375 px; más largo, la etiqueta se parte en dos líneas.
 */
export const LIMITE_ETIQUETA_BANNER = 30;

const texto = (valor) => (typeof valor === 'string' && valor.trim() ? valor.trim() : undefined);

// Fecha de un campo de fecha y hora del panel; undefined si falta o no es una fecha válida.
const fecha = (valor) => {
  if (!valor) return undefined;
  const d = new Date(valor);
  return Number.isNaN(d.valueOf()) ? undefined : d;
};

const formatoFechaHora = (d) =>
  d.toLocaleString('es-CL', { timeZone: ZONA_HORARIA, dateStyle: 'long', timeStyle: 'short' });

/**
 * Tipo del enlace: «interno» si empieza con /, «externo» si es http:// o https:// (igual que el sitio), y
 * undefined si no es ninguno de los dos.
 */
export function tipoEnlace(enlace) {
  const e = texto(enlace);
  if (!e) return undefined;
  if (e.startsWith('/')) return 'interno';
  if (/^https?:\/\//.test(e)) return 'externo';
  return undefined;
}

/** Cuándo se muestra el banner, en una frase. `datos` son los campos del banner en JS plano. */
export function estadoVigencia(datos, ahora = new Date()) {
  if (!datos.publicado) return 'Borrador (no publicado)';
  const inicio = fecha(datos.inicio);
  const fin = fecha(datos.fin);
  if (!inicio || !fin) return 'Faltan fechas de vigencia';
  if (fin < inicio) return 'Nunca se muestra: el fin es anterior al inicio';
  if (ahora < inicio) return `Programado: se muestra desde ${formatoFechaHora(inicio)}`;
  if (ahora > fin) return 'Vencido';
  return `Visible ahora (hasta ${formatoFechaHora(fin)})`;
}

/** Avisos breves para quien edita. Sin tono de error: son sugerencias. */
export function avisos(datos) {
  const lista = [];
  const titulo = texto(datos.titulo) ?? '';
  const inicio = fecha(datos.inicio);
  const fin = fecha(datos.fin);
  const enlace = texto(datos.enlace);

  if (!texto(datos.imagen)) lista.push('Sin imagen: el slide quedará sin fondo.');
  if (titulo.length > LIMITE_TITULO_BANNER) lista.push('Título largo: en el celular ocupa más de cuatro líneas y el slide crece.');
  if (texto(datos.etiqueta) && datos.etiqueta.trim().length > LIMITE_ETIQUETA_BANNER) {
    lista.push('Etiqueta larga: sobre la imagen conviene que no pase de 30 caracteres.');
  }
  if (!inicio || !fin) lista.push('Faltan fechas de vigencia: el banner no se mostrará.');
  else if (fin < inicio) lista.push('El fin de vigencia es anterior al inicio: el banner nunca se muestra.');
  if (!enlace) lista.push('Sin enlace: el botón no lleva a ninguna parte.');
  else if (!tipoEnlace(enlace)) lista.push('El enlace debe empezar con / (interno) o con https:// (externo).');
  return lista;
}

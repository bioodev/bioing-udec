// La vista previa del panel (public/admin/vista-previa-banner-reglas.js) no importa código del sitio: sus reglas
// son propias. Estas pruebas fijan el comportamiento; el límite del título se justifica en esa misma regla.
import { describe, expect, test } from 'vitest';
import {
  avisos,
  estadoVigencia,
  LIMITE_ETIQUETA_BANNER,
  LIMITE_TITULO_BANNER,
  tipoEnlace,
} from '../../public/admin/vista-previa-banner-reglas.js';

// Mismo formato que la vista previa de Actividades (vista-previa-seo.test.ts): fecha y hora en hora de Chile.
const formatoSitio = (iso: string) =>
  new Date(iso).toLocaleString('es-CL', { timeZone: 'America/Santiago', dateStyle: 'long', timeStyle: 'short' });

const base = {
  titulo: 'Admisión 2027',
  publicado: true,
  imagen: '/assets/media/demo-01.jpg',
  enlace: '/noticias/mi-noticia',
  inicio: '2027-01-01T00:00:00-03:00',
  fin: '2027-03-31T23:59:00-03:00',
};

const antes = new Date('2026-12-01T12:00:00-03:00');
const durante = new Date('2027-02-15T12:00:00-03:00');
const despues = new Date('2027-04-10T12:00:00-03:00');

describe('estadoVigencia', () => {
  test('un borrador no se muestra aunque esté dentro de las fechas', () => {
    expect(estadoVigencia({ ...base, publicado: false }, durante)).toBe('Borrador (no publicado)');
  });

  test('publicado y antes del inicio: programado desde la fecha de inicio', () => {
    expect(estadoVigencia(base, antes)).toBe(`Programado: se muestra desde ${formatoSitio(base.inicio)}`);
  });

  test('publicado y dentro de la vigencia: visible hasta el fin', () => {
    expect(estadoVigencia(base, durante)).toBe(`Visible ahora (hasta ${formatoSitio(base.fin)})`);
  });

  test('publicado y después del fin: vencido', () => {
    expect(estadoVigencia(base, despues)).toBe('Vencido');
  });

  test('los extremos cuentan como vigentes (igual que estaVigente del sitio)', () => {
    expect(estadoVigencia(base, new Date(base.inicio))).toMatch(/^Visible ahora/);
    expect(estadoVigencia(base, new Date(base.fin))).toMatch(/^Visible ahora/);
  });

  test('con el fin anterior al inicio nunca se muestra', () => {
    const invertido = { ...base, inicio: base.fin, fin: base.inicio };
    expect(estadoVigencia(invertido, durante)).toBe('Nunca se muestra: el fin es anterior al inicio');
  });

  test('sin fechas no puede decir cuándo se muestra', () => {
    expect(estadoVigencia({ ...base, inicio: undefined }, durante)).toBe('Faltan fechas de vigencia');
  });
});

describe('avisos', () => {
  test('una entrada completa no tiene avisos', () => {
    expect(avisos(base)).toEqual([]);
  });

  test('sin imagen', () => {
    expect(avisos({ ...base, imagen: '' })).toContain('Sin imagen: el slide quedará sin fondo.');
  });

  test('fin anterior al inicio', () => {
    const invertido = { ...base, inicio: base.fin, fin: base.inicio };
    expect(avisos(invertido)).toContain('El fin de vigencia es anterior al inicio: el banner nunca se muestra.');
  });

  test('faltan fechas', () => {
    expect(avisos({ ...base, fin: undefined })).toContain('Faltan fechas de vigencia: el banner no se mostrará.');
  });

  test('el límite del título (medido a 375 px): 56 caracteres no avisan, 57 sí', () => {
    expect(LIMITE_TITULO_BANNER).toBe(56);
    expect(avisos({ ...base, titulo: 'a'.repeat(56) })).toEqual([]);
    expect(avisos({ ...base, titulo: 'a'.repeat(57) })).toContain(
      'Título largo: en el celular ocupa más de cuatro líneas y el slide crece.',
    );
  });

  test('la etiqueta: 30 caracteres no avisan, 31 sí; sin etiqueta no hay aviso', () => {
    expect(LIMITE_ETIQUETA_BANNER).toBe(30);
    expect(avisos({ ...base, etiqueta: 'a'.repeat(30) })).toEqual([]);
    expect(avisos({ ...base, etiqueta: 'a'.repeat(31) })).toContain(
      'Etiqueta larga: sobre la imagen conviene que no pase de 30 caracteres.',
    );
    expect(avisos({ ...base, etiqueta: '' })).toEqual([]);
  });

  test('enlace vacío', () => {
    expect(avisos({ ...base, enlace: '  ' })).toContain('Sin enlace: el botón no lleva a ninguna parte.');
  });

  test('enlace que no empieza con / ni con https://', () => {
    expect(avisos({ ...base, enlace: 'noticias/mi-noticia' })).toContain(
      'El enlace debe empezar con / (interno) o con https:// (externo).',
    );
    expect(avisos({ ...base, enlace: 'www.udec.cl' })).toHaveLength(1);
  });

  test('un enlace http:// se acepta como externo, igual que el sitio', () => {
    expect(avisos({ ...base, enlace: 'http://ejemplo.cl' })).toEqual([]);
  });
});

describe('tipoEnlace', () => {
  test('una ruta que empieza con / es interna', () => {
    expect(tipoEnlace('/p/mi-pagina')).toBe('interno');
    expect(tipoEnlace('/')).toBe('interno');
  });

  test('una dirección https o http es externa', () => {
    expect(tipoEnlace('https://admision.udec.cl')).toBe('externo');
    expect(tipoEnlace('http://ejemplo.cl')).toBe('externo');
  });

  test('cualquier otra cosa no tiene tipo', () => {
    expect(tipoEnlace('')).toBeUndefined();
    expect(tipoEnlace('udec.cl')).toBeUndefined();
  });
});

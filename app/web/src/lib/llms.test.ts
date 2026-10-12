import { describe, expect, test } from 'vitest';
import { DESCRIPCIONES_SECCIONES, generarLlms, seccionesLlms } from './llms';
import { MENU } from './navegacion';

const SITIO = 'https://bioing.example';

describe('seccionesLlms', () => {
  test('una sección por cada entrada disponible del menú', () => {
    expect(seccionesLlms()).toHaveLength(MENU.filter((seccion) => seccion.disponible).length);
  });

  test('cada sección tiene descripción', () => {
    for (const seccion of seccionesLlms()) {
      expect(seccion.descripcion, seccion.titulo).toBeTruthy();
    }
  });

  test('no describe nada fuera del menú', () => {
    const rutas = seccionesLlms().map((seccion) => seccion.href);
    for (const href of rutas) expect(DESCRIPCIONES_SECCIONES[href], href).toBeTruthy();
  });
});

describe('generarLlms', () => {
  const salida = generarLlms(SITIO, seccionesLlms());

  test('empieza con el título y trae la línea de resumen', () => {
    expect(salida.startsWith('# BIOING+')).toBe(true);
    expect(salida).toMatch(/\n> .+/);
  });

  test('incluye la sección de enlaces', () => {
    expect(salida).toContain('## Secciones');
  });

  test('enlaza cada sección con URL absoluta y su descripción', () => {
    expect(salida).toContain('- [Noticias](https://bioing.example/noticias): Noticias de la comunidad de Bioingeniería.');
    expect(salida).toContain('- [Agenda](https://bioing.example/agenda): ');
  });

  test('la portada queda como URL absoluta con barra final', () => {
    expect(salida).toContain('- [Inicio](https://bioing.example/): ');
  });

  test('no menciona el panel de administración', () => {
    expect(salida).not.toContain('/admin');
  });
});

describe('seccionesLlms con secciones ocultas', () => {
  test('omite las secciones que el panel oculta', () => {
    const titulos = seccionesLlms({ anuncios: false, repositorio: false }).map((s) => s.titulo);
    expect(titulos).not.toContain('Anuncios');
    expect(titulos).not.toContain('Repositorio');
    expect(titulos).toContain('Noticias');
    expect(titulos).toContain('Inicio');
  });
});

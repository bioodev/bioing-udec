import { describe, expect, test } from 'vitest';
import { esInterno, idYouTube, vistaPreviaDrive } from './enlaces';

describe('vistaPreviaDrive', () => {
  test('archivo de Drive', () =>
    expect(vistaPreviaDrive('https://drive.google.com/file/d/AbC_12-x/view?usp=sharing')).toBe('https://drive.google.com/file/d/AbC_12-x/preview'));
  test('open?id=', () =>
    expect(vistaPreviaDrive('https://drive.google.com/open?id=AbC_12-x')).toBe('https://drive.google.com/file/d/AbC_12-x/preview'));
  test('Docs, Sheets y Slides', () => {
    expect(vistaPreviaDrive('https://docs.google.com/document/d/XyZ/edit')).toBe('https://docs.google.com/document/d/XyZ/preview');
    expect(vistaPreviaDrive('https://docs.google.com/spreadsheets/d/XyZ/edit#gid=0')).toBe('https://docs.google.com/spreadsheets/d/XyZ/preview');
    expect(vistaPreviaDrive('https://docs.google.com/presentation/d/XyZ/edit')).toBe('https://docs.google.com/presentation/d/XyZ/preview');
  });
  test('no reconocidos', () => {
    expect(vistaPreviaDrive('https://drive.google.com/')).toBeNull();
    expect(vistaPreviaDrive('https://drive.google.com/drive/folders/XyZ')).toBeNull();
    expect(vistaPreviaDrive('https://example.com/file/d/XyZ/view')).toBeNull();
    expect(vistaPreviaDrive('no es url')).toBeNull();
  });
});

describe('idYouTube', () => {
  test('formatos habituales', () => {
    expect(idYouTube('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe('dQw4w9WgXcQ');
    expect(idYouTube('https://youtu.be/dQw4w9WgXcQ?si=abc')).toBe('dQw4w9WgXcQ');
    expect(idYouTube('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(idYouTube('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  test('no reconocidos', () => {
    expect(idYouTube('https://vimeo.com/123')).toBeNull();
    expect(idYouTube('https://www.youtube.com/@canal')).toBeNull();
    expect(idYouTube('nada')).toBeNull();
  });
});

describe('esInterno', () => {
  const sitio = 'https://bioing.udec.cl/';
  test('rutas relativas son internas', () => {
    expect(esInterno('/agenda', sitio)).toBe(true);
    expect(esInterno('/p/bioingenieria')).toBe(true);
  });
  test('mismo host que el sitio (con o sin www) es interno', () => {
    expect(esInterno('https://bioing.udec.cl/noticias/x', sitio)).toBe(true);
    expect(esInterno('https://www.bioing.udec.cl/noticias/x', sitio)).toBe(true);
  });
  test('otros hosts son externos', () => {
    expect(esInterno('https://forms.gle/abc', sitio)).toBe(false);
    expect(esInterno('https://udec.cl/', sitio)).toBe(false);
    expect(esInterno('https://bioing.udec.cl.evil.com/', sitio)).toBe(false);
  });
  test('sin sitio conocido, solo las rutas relativas son internas', () => {
    expect(esInterno('https://bioing.udec.cl/x')).toBe(false);
    expect(esInterno('/x')).toBe(true);
  });
  test('protocolo relativo y texto que no es URL no son internos', () => {
    expect(esInterno('//evil.com/x', sitio)).toBe(false);
    expect(esInterno('no es url', sitio)).toBe(false);
  });
});

import { describe, expect, test } from 'vitest';
import { idYouTube, vistaPreviaDrive } from './enlaces';

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

import { describe, expect, test } from 'vitest';
import { vistaPreviaDrive } from './enlaces';

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

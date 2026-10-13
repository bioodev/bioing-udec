import { describe, expect, test } from 'vitest';
import { enlacesCompartir } from './compartir';

const url = 'https://bioing.example/agenda/charla-genetica';
const titulo = 'Charla de genética & IA';
const enlaces = enlacesCompartir(url, titulo);
const de = (red: string) => enlaces.find((e) => e.red === red)!.url;

describe('enlacesCompartir', () => {
  test('ofrece WhatsApp, LinkedIn, X y correo, en ese orden', () => {
    expect(enlaces.map((e) => e.red)).toEqual(['whatsapp', 'linkedin', 'x', 'correo']);
  });
  test('WhatsApp lleva el título y el enlace en un solo texto, codificados', () => {
    expect(de('whatsapp')).toBe(`https://wa.me/?text=${encodeURIComponent(`${titulo} ${url}`)}`);
  });
  test('LinkedIn solo lleva el enlace', () => {
    expect(de('linkedin')).toBe(`https://www.linkedin.com/sharing/share-offset/?url=${encodeURIComponent(url)}`);
  });
  test('X lleva enlace y título; el «&» del título no corta el parámetro', () => {
    expect(de('x')).toBe(`https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(titulo)}`);
    expect(de('x')).toContain('%26');
  });
  test('el correo usa el título como asunto y el enlace como cuerpo', () => {
    expect(de('correo')).toBe(`mailto:?subject=${encodeURIComponent(titulo)}&body=${encodeURIComponent(url)}`);
  });
  test('cada enlace trae una etiqueta visible para la persona', () => {
    expect(enlaces.every((e) => e.etiqueta.length > 0)).toBe(true);
  });
});

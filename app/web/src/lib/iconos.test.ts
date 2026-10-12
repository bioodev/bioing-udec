import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { ICONOS, esIcono } from './iconos';

// La lista se escribe dos veces: en el desplegable del panel (ancla &iconos_phosphor de config.yml) y en el mapa
// de componentes de Icono.astro. Este test impide que cualquiera de las dos se desalinee.
const config = readFileSync(`${process.cwd()}/public/admin/config.yml`, 'utf8');
const icono = readFileSync(`${process.cwd()}/src/components/Icono.astro`, 'utf8');

const valoresDelPanel = (): string[] => {
  const lineas = config.split('\n');
  const inicio = lineas.findIndex((l) => l.includes('&iconos_phosphor'));
  const valores: string[] = [];
  for (const linea of lineas.slice(inicio + 1)) {
    const opcion = linea.match(/^\s+- \{ label: [^,{}]+, value: (\w+) \}\s*$/);
    if (!opcion) break;
    valores.push(opcion[1]!);
  }
  return valores;
};

const nombresDelMapa = (): string[] => {
  const bloque = icono.match(/const mapa = \{([\s\S]*?)\};/)?.[1] ?? '';
  return bloque.split(',').map((n) => n.trim()).filter(Boolean);
};

describe('ICONOS (lista curada de Phosphor)', () => {
  test('no tiene nombres repetidos y todos son de Phosphor (PascalCase)', () => {
    expect(new Set(ICONOS).size).toBe(ICONOS.length);
    for (const nombre of ICONOS) expect(nombre).toMatch(/^[A-Z][A-Za-z]+$/);
  });

  test('config.yml ofrece exactamente la misma lista, en el mismo orden', () => {
    expect(valoresDelPanel()).toEqual([...ICONOS]);
  });

  test('el mapa de Icono.astro tiene exactamente la misma lista', () => {
    expect([...nombresDelMapa()].sort()).toEqual([...ICONOS].sort());
  });
});

describe('esIcono', () => {
  test('reconoce los nombres de la lista', () => {
    expect(esIcono('Newspaper')).toBe(true);
    expect(esIcono('Flask')).toBe(true);
  });

  test('rechaza nombres fuera de la lista, vacíos o indefinidos', () => {
    expect(esIcono('Tabler')).toBe(false);
    expect(esIcono('constructor')).toBe(false);
    expect(esIcono('')).toBe(false);
    expect(esIcono(undefined)).toBe(false);
  });
});

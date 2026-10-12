// Regla pura del tema de las vistas previas del panel. Sin dependencias ni build: el panel la carga tal cual.
// src/lib/vista-previa-tema.test.ts fija su comportamiento.

/**
 * Tema que debe tener una vista previa: el del panel (data-theme de su <html>, «light» o «dark») y, si el panel no
 * lo fijó, el del sistema.
 * @param {string | undefined} dataTheme valor de document.documentElement.dataset.theme del panel
 * @param {boolean} prefiereOscuro true si el sistema pide tema oscuro
 * @returns {'light' | 'dark'}
 */
export function temaEfectivo(dataTheme, prefiereOscuro) {
  if (dataTheme === 'light' || dataTheme === 'dark') return dataTheme;
  return prefiereOscuro ? 'dark' : 'light';
}

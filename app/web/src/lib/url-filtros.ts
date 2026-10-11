// Parámetros de la URL que reflejan los filtros de un listado (Noticias, Agenda, Anuncios, Repositorio).
// Puro: lo usan el test y `src/scripts/url-filtros.ts`.

/**
 * Devuelve el href con los valores como query params. Un valor vacío o igual a uno de
 * `neutros` (p. ej. 'todas') quita el parámetro, para que la URL solo muestre filtros activos.
 */
export function urlConFiltros(href: string, valores: Record<string, string>, neutros: readonly string[]): string {
  const url = new URL(href);
  for (const [clave, valor] of Object.entries(valores)) {
    if (valor && !neutros.includes(valor)) url.searchParams.set(clave, valor);
    else url.searchParams.delete(clave);
  }
  return url.href;
}

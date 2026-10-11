// Refleja los filtros de un listado en la URL (para compartirlo) sin romper la navegación.
// ClientRouter guarda su índice y la posición de scroll en history.state: si se reemplaza por
// `null`, el "atrás" del navegador llega sin estado y el router lo ignora.
import { urlConFiltros } from '@/lib/url-filtros';

export function sincronizarFiltrosEnUrl(valores: Record<string, string>, neutros: readonly string[]) {
  history.replaceState(history.state, '', urlConFiltros(location.href, valores, neutros));
}

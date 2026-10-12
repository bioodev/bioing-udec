// Tema de las vistas previas del panel (ADR 0010, guía de usuario 4.15). Sveltia dibuja cada vista previa en un iframe
// blob: que no hereda el tema del panel, así que este módulo copia data-theme del <html> del panel a cada iframe.
// Lo hace al abrir una entrada, al cambiar de entrada y al cambiar el tema en Ajustes, sin recargar. La regla
// (qué tema corresponde) está en vista-previa-tema-reglas.js; los colores, en vista-previa.css, que también se
// registra aquí como estilo de la vista previa. Sin Sveltia, no hace nada.
import { temaEfectivo } from './vista-previa-tema-reglas.js';

const consultaOscuro = window.matchMedia('(prefers-color-scheme: dark)');

function aplicarTema() {
  const tema = temaEfectivo(document.documentElement.dataset.theme, consultaOscuro.matches);
  for (const iframe of document.querySelectorAll('iframe')) {
    try {
      // Un iframe de otro origen lanza al leer su documento: no es una vista previa del panel.
      const html = iframe.contentDocument?.documentElement;
      if (html && html.dataset.theme !== tema) html.dataset.theme = tema;
    } catch {
      /* sin acceso al documento del iframe */
    }
  }
}

if (window.CMS) {
  CMS.registerPreviewStyle('/admin/vista-previa.css');
}

// Cambio de tema en Ajustes (data-theme del panel) o del sistema (si el panel sigue al sistema).
new MutationObserver(aplicarTema).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
consultaOscuro.addEventListener('change', aplicarTema);
// Aparición de iframes nuevos (al abrir una entrada) y recarga de su documento.
new MutationObserver(aplicarTema).observe(document.body, { childList: true, subtree: true });
document.addEventListener('load', (evento) => {
  if (evento.target instanceof HTMLIFrameElement) aplicarTema();
}, true);

aplicarTema();

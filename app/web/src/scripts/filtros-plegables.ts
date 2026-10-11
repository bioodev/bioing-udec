// Acordeón de filtros en móvil (componente FiltrosPlegables.astro). Se inicia en cada astro:page-load
// (ClientRouter) con una marca para no duplicar listeners. En móvil parte cerrado; el botón muestra cuántos
// filtros hay activos para que no queden "escondidos" sin aviso.
import { contarActivos, textoBotonFiltros } from '@/lib/filtros-plegables';

const ESCRITORIO = '(min-width: 48rem)'; // breakpoint md de Tailwind

export function iniciarFiltrosPlegables(): void {
  for (const region of document.querySelectorAll<HTMLElement>('[data-plegable]:not([data-iniciado])')) {
    region.dataset.iniciado = '';
    const boton = document.querySelector<HTMLButtonElement>(`[data-plegable-boton][aria-controls="${region.id}"]`);
    const texto = boton?.querySelector('[data-plegable-texto]');
    if (!boton || !texto) continue;
    const neutros = (region.dataset.neutros ?? '').split(',').filter(Boolean);

    const actualizarTexto = () => {
      const valores = [...region.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name]')].map((c) => c.value);
      texto.textContent = textoBotonFiltros(contarActivos(valores, neutros));
    };
    const plegar = (plegado: boolean) => {
      region.toggleAttribute('data-plegado', plegado);
      boton.setAttribute('aria-expanded', String(!plegado));
    };

    plegar(!matchMedia(ESCRITORIO).matches);
    boton.addEventListener('click', () => plegar(!region.hasAttribute('data-plegado')));

    const formulario = region.closest('form');
    for (const evento of ['input', 'change', 'starwind:value-change']) {
      // Starwind actualiza el input oculto después de emitir el evento: se lee en la vuelta siguiente.
      formulario?.addEventListener(evento, () => setTimeout(actualizarTexto, 0));
    }
    // Los filtros que vienen en la URL se aplican después de iniciar la página.
    setTimeout(actualizarTexto, 100);
  }
}

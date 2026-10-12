// Pliegue de filtros (componente FiltrosPlegables.astro), en móvil y en escritorio. Se inicia en cada
// astro:page-load (ClientRouter) con una marca para no duplicar listeners. El botón muestra cuántos filtros hay
// activos para que no queden "escondidos" sin aviso, y «Limpiar filtros» vacía los campos del pliegue por el
// mismo camino que usa cada página (input/change/starwind:value-change), sin reimplementar el filtrado.
import { contarActivos, estaPlegadoInicial, mostrarLimpiar, textoBotonFiltros } from '@/lib/filtros-plegables';

export function iniciarFiltrosPlegables(): void {
  for (const region of document.querySelectorAll<HTMLElement>('[data-plegable]:not([data-iniciado])')) {
    region.dataset.iniciado = '';
    const boton = document.querySelector<HTMLButtonElement>(`[data-plegable-boton][aria-controls="${region.id}"]`);
    const limpiar = document.querySelector<HTMLButtonElement>(`[data-plegable-limpiar="${region.id}"]`);
    const texto = boton?.querySelector('[data-plegable-texto]');
    if (!boton || !texto) continue;
    const neutros = (region.dataset.neutros ?? '').split(',').filter(Boolean);
    const formulario = region.closest('form');

    const activos = () => contarActivos([...region.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name]')].map((c) => c.value), neutros);
    const actualizarBotones = () => {
      const n = activos();
      texto.textContent = textoBotonFiltros(n);
      if (limpiar) limpiar.hidden = !mostrarLimpiar(n);
    };
    const plegar = (plegado: boolean) => {
      region.toggleAttribute('data-plegado', plegado);
      boton.setAttribute('aria-expanded', String(!plegado));
    };

    // Sin JS el botón no hace nada: solo se muestra cuando el script está listo.
    boton.hidden = false;
    plegar(true);
    boton.addEventListener('click', () => plegar(!region.hasAttribute('data-plegado')));

    // Vacía los campos del pliegue: selects nativos a la primera opción («Todos»); los Starwind
    // (Combobox/Select) reciben starwind:set-value con '' (cada página trata '' como «todas»).
    limpiar?.addEventListener('click', () => {
      for (const select of region.querySelectorAll<HTMLSelectElement>('select[name]')) select.selectedIndex = 0;
      for (const raiz of region.querySelectorAll<HTMLElement>('[data-slot="combobox"][id], [data-slot="select"][id]')) {
        raiz.dispatchEvent(new CustomEvent('starwind:set-value', { detail: { value: '' } }));
      }
      // Los Starwind fijan su valor de forma asíncrona: el change se emite después para que la página filtre.
      setTimeout(() => formulario?.dispatchEvent(new Event('change', { bubbles: true })), 0);
    });

    for (const evento of ['input', 'change', 'starwind:value-change']) {
      // Starwind actualiza el input oculto después de emitir el evento: se lee en la vuelta siguiente.
      formulario?.addEventListener(evento, () => setTimeout(actualizarBotones, 0));
    }
    // Los filtros que vienen en la URL se aplican después de iniciar la página: se decide el pliegue
    // inicial con los valores ya aplicados, en lugar de cerrar y abrir al cargar.
    setTimeout(() => {
      actualizarBotones();
      plegar(estaPlegadoInicial(activos()));
    }, 100);
  }
}

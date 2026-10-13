// Rellena los <span data-relativo> de la página con el texto relativo de su fecha («· hace 3 días»).
// El cálculo es en el navegador: el build es diario y el texto se volvería viejo. Sin JavaScript el span
// queda vacío y se ve solo la fecha absoluta del <time>. Lo llama Base.astro en cada astro:page-load.
import { tiempoRelativo } from '@/lib/tiempo-relativo';

/** Idempotente: sobrescribe el texto, así que basta con llamarla en cada navegación. */
export function iniciarTiempoRelativo(): void {
  const ahora = new Date();
  document.querySelectorAll<HTMLElement>('[data-relativo]').forEach((el) => {
    const fecha = new Date(el.dataset.relativo ?? '');
    if (Number.isNaN(fecha.getTime())) return;
    const conHora = el.dataset.relativoHora !== undefined;
    el.textContent = ` · ${tiempoRelativo(fecha, ahora, { conHora })}`;
  });
}

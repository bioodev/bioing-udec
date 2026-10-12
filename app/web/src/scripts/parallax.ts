// Parallax de las secciones destacadas del Inicio (SeccionDestacada.astro). La imagen (`[data-parallax]`, 120 %
// de alto) se desplaza en Y de -10 % a +10 % mientras la sección cruza el viewport, con `scrub`: se mueve más lento
// que el scroll. Con prefers-reduced-motion no hay animación (imagen fija y centrada). Sin JavaScript la imagen
// queda centrada. Se limpia en astro:before-swap y se reinicia en astro:page-load (ClientRouter), con gsap.context().
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let contexto: gsap.Context | undefined;

/** Quita los parallax de la página actual. */
export function limpiarParallax(): void {
  contexto?.revert();
  contexto = undefined;
}

/** Crea (o recrea) los parallax de la página actual. Idempotente. */
export function iniciarParallax(): void {
  limpiarParallax();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const imagenes = gsap.utils.toArray<HTMLElement>('[data-parallax]');
  if (!imagenes.length) return;

  gsap.registerPlugin(ScrollTrigger);
  contexto = gsap.context(() => {
    for (const imagen of imagenes) {
      gsap.fromTo(
        imagen,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: { trigger: imagen.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }
  });
}

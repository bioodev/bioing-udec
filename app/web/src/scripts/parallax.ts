// Parallax de las secciones destacadas del Inicio (SeccionDestacada.astro). La imagen (`[data-parallax]`, 175 %
// de alto, centrada con top -37,5 %) se desplaza en Y de -20 % a +20 % de su propio alto mientras la sección cruza
// el viewport, con `scrub`: se mueve más lento que el scroll. Con prefers-reduced-motion no hay animación (imagen
// fija y centrada). Sin JavaScript la imagen queda centrada. Se limpia en astro:before-swap y se reinicia en
// astro:page-load (ClientRouter), con gsap.context().
//
// Por qué 175 % y -37,5 %: con el desplazamiento máximo (20 % × 1,75 = 35 % de la sección) el borde superior de la
// imagen queda en -2,5 % y el inferior en 102,5 %; no aparece ningún borde vacío. Si se sube el desplazamiento,
// revisar que se cumpla top + desplazamiento ≤ 0 y bottom - desplazamiento ≥ 100 %.
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
        { yPercent: -20 },
        {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: { trigger: imagen.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }
  });
}

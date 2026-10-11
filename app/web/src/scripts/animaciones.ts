// Animaciones del sitio (GSAP, fade solo). Convención declarativa:
//   data-animar="hero"     → entrada al cargar (primer slide del carrusel), con stagger
//   data-animar="fade-up"  → el elemento aparece (fade) al entrar en el viewport
//   data-animar="grilla"   → contenedor: sus hijos aparecen escalonados al entrar en vista
//
// Se integra con View Transitions (ClientRouter de Astro 7): se limpia en
// `astro:before-swap` y se reinicializa en `astro:page-load` (carga inicial y navegación),
// usando gsap.context() para no dejar animaciones apuntando al DOM anterior.
//
// Rendimiento: los reveals usan un único IntersectionObserver nativo (sin ScrollTrigger,
// que medir posiciones y refrescar era lo que inflaba el TBT de Lighthouse); GSAP solo
// ejecuta el tween de opacity. El hero anima únicamente el primer slide (el resto se deja
// visible con gsap.set, sin costo por frame).
//
// Accesibilidad: con prefers-reduced-motion no se crea ninguna animación y se quita la clase
// .anima (todo visible). Sin JavaScript el contenido nunca se oculta: la clase .anima la pone
// un script inline del <head> de Base.astro, y un guard con timeout la quita si este módulo
// no llega a ejecutarse.
import { gsap } from 'gsap';

let contexto: gsap.Context | undefined;
let observador: IntersectionObserver | undefined;

/** Limpia las animaciones de la página actual. */
export function limpiarAnimaciones(): void {
  contexto?.revert();
  contexto = undefined;
  observador?.disconnect();
  observador = undefined;
}

/** Crea (o recrea) las animaciones de la página actual. Idempotente. */
export function iniciarAnimaciones(): void {
  limpiarAnimaciones();

  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducir) {
    document.documentElement.classList.remove('anima');
    return;
  }

  // ClientRouter (View Transitions) puede resetear atributos del <html> al navegar, así que
  // se re-asegura la clase ANTES de crear los tweens (los valores iniciales se leen al crearse).
  document.documentElement.classList.add('anima');
  document.documentElement.setAttribute('data-animaciones', '1');

  try {
    contexto = gsap.context(() => {
      // HERO: entrada al cargar (fade solo). Por rendimiento se anima SOLO el primer slide
      // (el visible al cargar); el resto de los elementos del carrusel se dejan visibles
      // con un set instantáneo (están fuera de pantalla y no deberían costar frames).
      const todos = gsap.utils.toArray<HTMLElement>('[data-animar="hero"]');
      if (todos.length) {
        const slideInicial = document.querySelector('[data-slide]');
        const visibles = todos.filter((el) => el.closest('[data-slide]') === slideInicial);
        const resto = todos.filter((el) => !visibles.includes(el));
        gsap.set(resto, { opacity: 1, overwrite: 'auto' });
        if (visibles.length) {
          gsap.to(visibles, {
            opacity: 1, duration: 0.6, ease: 'power3.out',
            stagger: 0.08, delay: 0.05, overwrite: 'auto',
          });
        }
      }

      // REVEALS (fade): un único IntersectionObserver nativo observa títulos y grillas.
      // rootMargin inferior -15% ≈ "el elemento entró al 85% del viewport", una sola vez.
      observador = new IntersectionObserver((entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          observador?.unobserve(entrada.target);
          const elemento = entrada.target as HTMLElement;
          if (elemento.dataset.animar === 'grilla') {
            const hijos = Array.from(elemento.children).filter((h): h is HTMLElement => h instanceof HTMLElement);
            if (!hijos.length) continue;
            gsap.to(hijos, {
              opacity: 1, duration: 0.6, ease: 'power3.out',
              stagger: Math.min(0.06, 0.45 / hijos.length), overwrite: 'auto',
            });
          } else {
            gsap.to(elemento, { opacity: 1, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
          }
        }
      // threshold 0: basta con que asome. Con un umbral proporcional, una grilla alta (p. ej. 30
      // documentos del Repositorio) nunca llegaba al 5 % visible y quedaba oculta hasta hacer scroll.
      }, { rootMargin: '0px 0px -15% 0px', threshold: 0 });

      document.querySelectorAll('[data-animar="grilla"], [data-animar="fade-up"]').forEach((el) => observador!.observe(el));
    }, document.body);
  } catch {
    // Si algo falla al crear las animaciones, nunca dejar contenido oculto.
    document.documentElement.classList.remove('anima');
  }
}
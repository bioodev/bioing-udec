// Animaciones del sitio (GSAP). Convención declarativa:
//   data-animar="hero"     → entrada al cargar (título, texto y botón del hero), con stagger
//   data-animar="fade-up"  → el elemento aparece (fade + slide-up) al entrar en el viewport
//   data-animar="grilla"   → contenedor: sus hijos aparecen escalonados al entrar en vista
//
// Se integra con View Transitions (ClientRouter de Astro 7): se limpia en
// `astro:before-swap` y se reinicializa en `astro:page-load` (carga inicial y navegación),
// usando gsap.context() para no dejar triggers apuntando al DOM anterior.
//
// Accesibilidad: con prefers-reduced-motion no se crea ninguna animación y se quita la clase
// .anima (todo visible). Sin JavaScript el contenido nunca se oculta: la clase .anima la pone
// un script inline del <head> de Base.astro, y un guard con timeout la quita si este módulo
// no llega a ejecutarse.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let contexto: gsap.Context | undefined;

/** Limpia las animaciones y los ScrollTrigger de la página actual. */
export function limpiarAnimaciones(): void {
  contexto?.revert();
  contexto = undefined;
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
    // Ojo: NO usar clearProps:'transform' al terminar: la clase .anima sigue aplicando
    // translateY(20px) por CSS, y al limpiar el transform inline el contenido volvería a
    // bajarse. El transform inline final (translate(0,0)) queda como ancla sobre el CSS.
    contexto = gsap.context(() => {
    // HERO: entrada al cargar, con ligero escalonado entre título, texto y botón.
    const hero = gsap.utils.toArray<HTMLElement>('[data-animar="hero"]');
    if (hero.length) {
      gsap.to(hero, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        stagger: 0.12, delay: 0.1, overwrite: 'auto',
      });
    }

    // SECCIONES: elementos individuales que aparecen al scrollear.
    gsap.utils.toArray<HTMLElement>('[data-animar="fade-up"]').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        overwrite: 'auto',
      });
    });

    // GRILLAS: los hijos aparecen escalonados cuando la grilla entra en vista. Se limita el
    // escalonado en el tiempo para que las listas largas no tarden (stagger total ≈ 0.45 s).
    gsap.utils.toArray<HTMLElement>('[data-animar="grilla"]').forEach((contenedor) => {
      const hijos = Array.from(contenedor.children).filter((h): h is HTMLElement => h instanceof HTMLElement);
      if (!hijos.length) return;
      gsap.to(hijos, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        stagger: Math.min(0.06, 0.45 / hijos.length),
        scrollTrigger: { trigger: contenedor, start: 'top 88%', once: true },
        overwrite: 'auto',
      });
    });
  }, document.body);

  // Recalcular posiciones cuando termina de cargar (imágenes, fuentes): cambian los triggers.
  window.addEventListener('load', () => ScrollTrigger.refresh());
  ScrollTrigger.refresh();
  } catch {
    // Si algo falla al crear las animaciones, nunca dejar contenido oculto.
    document.documentElement.classList.remove('anima');
  }
}
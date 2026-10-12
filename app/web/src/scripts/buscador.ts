// Buscador en un modal (Pagefind component UI) y el «Volver» de /buscar.
// <pagefind-modal> solo se renderiza en el build (Base.astro, import.meta.env.PROD): en `npm run dev`
// no existe /pagefind/ y los botones siguen llevando a /buscar. El script del componente se agrega
// al DOM después de la carga (requestIdleCallback), no en el HTML inicial. Es un archivo del propio
// sitio, así que cabe en script-src 'self'.
import { puedeVolverAtras } from '@/lib/volver';

const RUTA = '/pagefind/';
const SCRIPT = `${RUTA}pagefind-component-ui.js`;
const ESTILOS = `${RUTA}pagefind-component-ui.css`;

export type ModalPagefind = HTMLElement & { open?: () => void; isOpen?: boolean };

const enBuscar = () => /^\/buscar\/?$/.test(location.pathname);

/** El modal, solo si el componente ya está definido (si no, `open` no existe). */
export function modalBuscador(): ModalPagefind | null {
  const modal = document.querySelector<ModalPagefind>('pagefind-modal');
  return modal && typeof modal.open === 'function' ? modal : null;
}

/** Abre el modal. Devuelve false si no está disponible (dev, o el componente aún no cargó). */
export function abrirBuscador(): boolean {
  const modal = modalBuscador();
  if (!modal) return false;
  // Tras cerrar con Esc, el componente pone isOpen en false solo al disparar el evento `close` del
  // <dialog>, que es asíncrono: un open() en ese hueco se ignora. Se espera ese evento y luego se abre.
  const dialog = modal.querySelector<HTMLDialogElement>('dialog');
  if (dialog && !dialog.open && modal.isOpen) {
    dialog.addEventListener('close', () => modal.open?.(), { once: true });
    return true;
  }
  modal.open?.();
  return true;
}

// Los estilos van en el <head>, que ClientRouter reemplaza al navegar: se vuelven a poner en cada página.
function asegurarEstilos(): void {
  if (document.querySelector(`link[href="${ESTILOS}"]`)) return;
  const enlace = document.createElement('link');
  enlace.rel = 'stylesheet';
  enlace.href = ESTILOS;
  document.head.append(enlace);
}

// Una sola vez por documento: los custom elements quedan definidos aunque ClientRouter cambie el DOM.
function cargarComponente(): void {
  if (customElements.get('pagefind-modal') || document.querySelector(`script[src="${SCRIPT}"]`)) return;
  const script = document.createElement('script');
  script.src = SCRIPT;
  document.head.append(script);
}

export function iniciarBuscadorModal(): void {
  if (!document.querySelector('pagefind-modal') || enBuscar()) return;
  asegurarEstilos();
  const programar = 'requestIdleCallback' in window
    ? (fn: () => void) => window.requestIdleCallback(fn, { timeout: 2000 })
    : (fn: () => void) => setTimeout(fn, 200);
  programar(cargarComponente);
}

let volverEscuchando = false;

// Delegado en document: el botón «Volver» existe solo en /buscar y ClientRouter lo reemplaza.
export function iniciarVolver(): void {
  if (volverEscuchando) return;
  volverEscuchando = true;
  document.addEventListener('click', (evento) => {
    if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    const enlace = evento.target instanceof Element ? evento.target.closest<HTMLAnchorElement>('a[data-volver]') : null;
    if (!enlace) return;
    const puede = puedeVolverAtras({
      referrer: document.referrer,
      origen: location.origin,
      indiceHistorial: (history.state as { index?: number } | null)?.index,
    });
    if (!puede) return; // sin historial del sitio: el enlace lleva a la portada
    evento.preventDefault();
    history.back();
  });
}

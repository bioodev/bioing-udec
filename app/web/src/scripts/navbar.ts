// Comportamiento del header (componente Navbar.astro): desplegables, atajo de búsqueda y ocultar al bajar.
// Los listeners se registran una sola vez (el módulo corre una vez con ClientRouter) y se delegan en
// `document`, porque el header se reemplaza en cada navegación. El estado por página se reinicia en
// `astro:page-load`.
import { navigate } from 'astro:transitions/client';
import { ocultarHeader } from '@/lib/ocultar-header';
import { abrirBuscador, modalBuscador } from '@/scripts/buscador';

let escuchando = false;
let enfocarBuscadorAlLlegar = false;
let yAnterior = 0;
let ocultoAntes = false;
let actualizacionPendiente = false;

const esMac = /Mac|iPhone|iPad/.test(navigator.platform);
const enBuscar = () => /^\/buscar\/?$/.test(location.pathname);

function desplegables(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-desplegable]')];
}

function botonDe(grupo: HTMLElement): HTMLButtonElement | null {
  return grupo.querySelector<HTMLButtonElement>('[data-desplegable-boton]');
}

function estaAbierto(grupo: HTMLElement): boolean {
  return botonDe(grupo)?.getAttribute('aria-expanded') === 'true';
}

function cerrar(grupo: HTMLElement, devolverFoco = false): void {
  const boton = botonDe(grupo);
  const panel = grupo.querySelector<HTMLElement>('[data-desplegable-panel]');
  if (!boton || !panel) return;
  boton.setAttribute('aria-expanded', 'false');
  panel.hidden = true;
  if (devolverFoco) boton.focus();
}

function cerrarTodos(excepto?: HTMLElement): void {
  for (const grupo of desplegables()) if (grupo !== excepto) cerrar(grupo);
}

function abrir(grupo: HTMLElement): void {
  cerrarTodos(grupo);
  const boton = botonDe(grupo);
  const panel = grupo.querySelector<HTMLElement>('[data-desplegable-panel]');
  if (!boton || !panel) return;
  boton.setAttribute('aria-expanded', 'true');
  panel.hidden = false;
}

// Ocultar al bajar: no se oculta mientras haya un desplegable abierto, el foco esté en el header
// o el menú móvil esté abierto. Con prefers-reduced-motion el ocultado es instantáneo (sin transición).
function hayBloqueo(header: HTMLElement): boolean {
  if (desplegables().some(estaAbierto)) return true;
  if (header.contains(document.activeElement)) return true;
  return document.querySelector('dialog[data-sw-drawer-popup][open]') !== null;
}

function actualizarHeader(): void {
  actualizacionPendiente = false;
  const header = document.querySelector<HTMLElement>('[data-navbar]');
  if (!header) return;
  const y = window.scrollY;
  const oculto = hayBloqueo(header) ? false : ocultarHeader(y, yAnterior, ocultoAntes);
  header.classList.toggle('-translate-y-full', oculto);
  yAnterior = y;
  ocultoAntes = oculto;
}

function programarActualizacion(): void {
  if (actualizacionPendiente) return;
  actualizacionPendiente = true;
  requestAnimationFrame(actualizarHeader);
}

function esCampoDeTexto(objetivo: EventTarget | null): boolean {
  if (!(objetivo instanceof HTMLElement)) return false;
  return objetivo.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(objetivo.tagName);
}

// El buscador de Pagefind se dibuja después de la navegación: se reintenta un rato hasta que aparezca el campo.
function enfocarBuscador(intentos = 30): void {
  const campo = document.querySelector<HTMLInputElement>('.pagefind-ui__search-input');
  if (campo) {
    campo.focus();
    return;
  }
  if (intentos > 0) setTimeout(() => enfocarBuscador(intentos - 1), 100);
}

// Con el modal disponible (build), Ctrl+K y `/` lo abren sobre la página actual. Sin él (dev, o el
// componente aún no cargó) se va a /buscar, como antes.
function irABuscar(): void {
  if (enBuscar()) {
    enfocarBuscador();
    return;
  }
  if (abrirBuscador()) return;
  enfocarBuscadorAlLlegar = true;
  navigate('/buscar');
}

function registrarListeners(): void {
  // Botones «Buscar» (escritorio y menú móvil): abren el modal en vez de navegar. Va en captura para
  // adelantarse al ClientRouter; con Ctrl, Cmd, Shift, Alt o clic medio sigue el enlace normal.
  document.addEventListener('click', (evento) => {
    if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    const objetivo = evento.target instanceof Element ? evento.target : null;
    if (!objetivo?.closest('a[data-buscar]') || enBuscar() || !modalBuscador()) return;
    evento.preventDefault();
    // En el menú móvil el Sheet sigue abierto: el modal se abre al terminar de cerrarse el Sheet,
    // para que el foco no vuelva al botón del menú por encima del modal.
    const hoja = document.querySelector<HTMLDialogElement>('dialog[data-sw-drawer-popup][open]');
    if (hoja) hoja.addEventListener('close', () => abrirBuscador(), { once: true });
    else abrirBuscador();
  }, true);

  document.addEventListener('click', (evento) => {
    const objetivo = evento.target instanceof Element ? evento.target : null;
    const boton = objetivo?.closest<HTMLButtonElement>('[data-desplegable-boton]');
    if (boton) {
      const grupo = boton.closest<HTMLElement>('[data-desplegable]');
      if (!grupo) return;
      if (estaAbierto(grupo)) cerrar(grupo);
      else abrir(grupo);
      return;
    }
    // Clic fuera de cualquier desplegable: se cierran todos.
    if (!objetivo?.closest('[data-desplegable]')) cerrarTodos();
  });

  // Tab que sale del desplegable lo cierra. Sin destino (relatedTarget nulo) no se cierra, para no
  // romper el clic en Safari, que no enfoca el botón al pulsarlo.
  document.addEventListener('focusout', (evento) => {
    const grupo = evento.target instanceof Element ? evento.target.closest<HTMLElement>('[data-desplegable]') : null;
    const destino = evento.relatedTarget;
    if (grupo && destino instanceof Node && !grupo.contains(destino)) cerrar(grupo);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') {
      const abierto = desplegables().find(estaAbierto);
      if (abierto) cerrar(abierto, true);
      return;
    }
    const atajo = (evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k';
    const barra = evento.key === '/' && !evento.ctrlKey && !evento.metaKey && !evento.altKey;
    if (!atajo && !(barra && !esCampoDeTexto(evento.target))) return;
    evento.preventDefault();
    irABuscar();
  });

  document.addEventListener('focusin', programarActualizacion);
  window.addEventListener('scroll', programarActualizacion, { passive: true });
}

export function iniciarNavbar(): void {
  if (!escuchando) {
    escuchando = true;
    registrarListeners();
  }
  // Estado de la página nueva: header visible, desplegables cerrados (el DOM ya es nuevo).
  yAnterior = window.scrollY;
  ocultoAntes = false;
  for (const texto of document.querySelectorAll('[data-atajo-texto]')) {
    texto.textContent = esMac ? '⌘K' : 'Ctrl K';
  }
  if (enfocarBuscadorAlLlegar && enBuscar()) {
    enfocarBuscadorAlLlegar = false;
    enfocarBuscador();
  }
}

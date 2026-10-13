// Enlaces para compartir una ficha. Puro, con test: el componente Compartir.astro solo los pinta.
// Son enlaces simples (sin scripts de terceros); la URL absoluta se arma en el build.

export type Red = 'whatsapp' | 'linkedin' | 'x' | 'correo';

export interface EnlaceCompartir {
  red: Red;
  etiqueta: string;
  url: string;
}

/** WhatsApp, LinkedIn, X y correo para `urlAbsoluta` con el `titulo` de la ficha. */
export function enlacesCompartir(urlAbsoluta: string, titulo: string): EnlaceCompartir[] {
  const url = encodeURIComponent(urlAbsoluta);
  const texto = encodeURIComponent(titulo);
  return [
    { red: 'whatsapp', etiqueta: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(`${titulo} ${urlAbsoluta}`)}` },
    { red: 'linkedin', etiqueta: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offset/?url=${url}` },
    { red: 'x', etiqueta: 'X', url: `https://x.com/intent/post?url=${url}&text=${texto}` },
    { red: 'correo', etiqueta: 'Correo', url: `mailto:?subject=${texto}&body=${url}` },
  ];
}

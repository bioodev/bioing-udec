// Código QR de la URL de una ficha, generado en el build como SVG (sin JS en el cliente ni servicios externos).
// Colores fijos: negro sobre blanco, también en tema oscuro, para que siempre se pueda escanear.
import { renderSVG } from 'uqr';

/** SVG del QR de `urlAbsoluta`, con margen de silencio incluido. */
export function qrSvg(urlAbsoluta: string): string {
  return renderSVG(urlAbsoluta, { pixelSize: 8, border: 2, whiteColor: '#ffffff', blackColor: '#000000' });
}

/** El mismo SVG como `data:` URL, para `<img>` y para descargarlo con `<a download>`. */
export function qrDataUrl(urlAbsoluta: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg(urlAbsoluta))}`;
}

/** Nombre del archivo descargado: `codigo-qr-<último segmento de la ruta>.svg`. */
export function nombreQr(urlAbsoluta: string): string {
  const url = new URL(urlAbsoluta);
  const segmento = url.pathname.split('/').filter(Boolean).pop() ?? 'bioing';
  return `codigo-qr-${segmento}.svg`;
}

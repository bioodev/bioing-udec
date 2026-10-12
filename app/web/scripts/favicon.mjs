// Genera los favicons desde el logo del sitio (src/assets/logo.svg), su única fuente:
//   public/favicon.svg          copia exacta del logo (navegadores modernos)
//   public/favicon.ico          PNG de 32 × 32 (navegadores y lectores de feeds que piden /favicon.ico)
//   public/apple-touch-icon.png PNG de 180 × 180 con fondo lleno (iOS redondea las esquinas por su cuenta)
// Uso: `npm run favicon` después de cambiar el logo. src/lib/favicon.test.ts comprueba que estén al día.
import { copyFile, readFile } from 'node:fs/promises';
import sharp from 'sharp';

const raiz = new URL('../', import.meta.url);
const logo = new URL('src/assets/logo.svg', raiz);
const publico = (nombre) => new URL(`public/${nombre}`, raiz).pathname;

// Color de fondo del ícono de iOS: el relleno del primer <rect> del logo (el acento del sitio).
const svg = await readFile(logo, 'utf8');
const fondo = svg.match(/<rect[^>]*fill="(#[0-9a-fA-F]{3,8})"/)?.[1] ?? '#ffffff';

await copyFile(logo, publico('favicon.svg'));
await sharp(Buffer.from(svg), { density: 384 }).resize(32, 32).png().toFile(publico('favicon.ico'));
await sharp(Buffer.from(svg), { density: 1536 }).resize(180, 180).flatten({ background: fondo }).png().toFile(publico('apple-touch-icon.png'));
console.log(`Favicons generados desde src/assets/logo.svg (fondo de iOS: ${fondo}).`);

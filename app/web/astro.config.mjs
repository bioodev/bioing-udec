import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// Astro no carga .env en process.env al leer esta config: se lee con loadEnv de Vite.
// La variable del entorno (p. ej. la de Workers Builds) gana sobre el archivo .env.
const { SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
	// URL pública canónica: se fija con SITE_URL (ver .env.example); la real se define en Cloudflare en la Fase C.
	site: process.env.SITE_URL ?? SITE_URL ?? 'https://bioing.example',
	integrations: [
		sitemap({
			// No indexar el panel ni el catálogo interno de componentes.
			filter: (pagina) => !['/admin/', '/componentes/'].some((ruta) => pagina.includes(ruta)),
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
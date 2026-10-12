import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import { readFileSync } from 'node:fs';
import { leerConfigMenu } from './src/lib/navegacion.ts';
import { seccionesDesactivadas } from './src/integrations/secciones-desactivadas.ts';
import { satteri } from '@astrojs/markdown-satteri';
import { sanearHtml } from './src/lib/sanear-html.ts';

// Astro no carga .env en process.env al leer esta config: se lee con loadEnv de Vite.
// La variable del entorno (p. ej. la de Workers Builds) gana sobre el archivo .env.
const { SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// Secciones que el panel apagó (src/content/menu/menu.yml). Una sección desactivada no se publica (ver ADR 0008).
const menu = leerConfigMenu(readFileSync(`${process.cwd()}/src/content/menu/menu.yml`, 'utf8'));

// https://astro.build/config
export default defineConfig({
	// URL pública canónica: se fija con SITE_URL (ver .env.example); la real se define en Cloudflare en la Fase C.
	site: process.env.SITE_URL ?? SITE_URL ?? 'https://bioing.example',
	integrations: [
		sitemap({
			// No indexar el panel ni el catálogo interno de componentes.
			filter: (pagina) => !['/admin/', '/componentes/'].some((ruta) => pagina.includes(ruta)),
		}),
		// Después de sitemap: quita del build las secciones apagadas y sus URL del sitemap.
		seccionesDesactivadas(menu),
	],
	// El cuerpo Markdown del panel se sanea: sin HTML crudo (scripts, formularios, <meta refresh>…) ni enlaces
	// javascript:/data:. Sätteri es el procesador por defecto de Astro 7; ver src/lib/sanear-html.ts.
	markdown: { processor: satteri({ hastPlugins: [sanearHtml] }) },
	vite: {
		plugins: [tailwindcss()],
		build: {
			// Los scripts procesados (module) salen como archivo externo: la CSP pública no admite
			// 'unsafe-inline' en script-src (public/_headers). Astro incrusta inline todo chunk de
			// script menor que assetsInlineLimit; devolver false para .js lo evita. Lo demás
			// (CSS, imágenes) conserva el umbral por defecto de Vite (undefined).
			assetsInlineLimit: (ruta) => (ruta.endsWith('.js') ? false : undefined),
		},
	},
});

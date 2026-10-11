import type { APIRoute } from 'astro';
import { generarLlms, seccionesLlms } from '../lib/llms';

// Índice curado para agentes; no reemplaza al sitemap (/sitemap-index.xml).
export const GET: APIRoute = ({ site }) => {
  const url = site ?? new URL('https://bioing.example');
  return new Response(generarLlms(url, seccionesLlms()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

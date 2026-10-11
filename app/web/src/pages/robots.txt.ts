import type { APIRoute } from 'astro';
import { generarRobots } from '../lib/robots';

// Genera /robots.txt en el build para escribir el Sitemap con URL absoluta.
export const GET: APIRoute = ({ site }) => {
  const url = site ?? new URL('https://bioing.example');
  return new Response(generarRobots(url), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

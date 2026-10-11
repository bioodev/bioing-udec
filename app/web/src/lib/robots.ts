// robots.txt como función pura: se genera en el build (src/pages/robots.txt.ts) para
// que el Sitemap quede con URL absoluta (el archivo estático anterior lo tenía relativo).
// Política: se permite indexar y citar el sitio; se bloquea el uso del contenido para
// entrenar modelos. Para revertir el bloqueo, quita agentes de BOTS_BLOQUEADOS (o muévelos
// a BOTS_PERMITIDOS); el cambio se aplica en el próximo build.

/** Bots de entrenamiento de modelos: sin acceso al contenido. */
export const BOTS_BLOQUEADOS = [
  'Google-Extended',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'Diffbot',
  'ImagesiftBot',
  'anthropic-ai',
];

/** Bots de búsqueda, citación y acciones pedidas por la persona: permitidos. */
export const BOTS_PERMITIDOS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
];

const SITEMAP = '/sitemap-index.xml';

/** URL absoluta del sitemap-index del sitio. */
export function urlSitemap(site: URL | string): string {
  return new URL(SITEMAP, site).href;
}

/** Contenido completo de /robots.txt para el sitio dado. */
export function generarRobots(site: URL | string): string {
  const bloques: string[] = [
    [
      '# robots.txt generado en el build (ver src/pages/robots.txt.ts).',
      '# Política de rastreo: se permite indexar y citar el sitio; se bloquea el uso del',
      '# contenido para entrenar modelos. Es una decisión del equipo: para revertirla, quita',
      '# los agentes de BOTS_BLOQUEADOS (o muévelos a BOTS_PERMITIDOS) en src/lib/robots.ts;',
      '# el cambio se aplica en el próximo build.',
    ].join('\n'),
    ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Crawl-delay: 1'].join('\n'),
    [
      '# Bots de entrenamiento: sin acceso al contenido.',
      ...BOTS_BLOQUEADOS.flatMap((agente) => ['', `User-agent: ${agente}`, 'Disallow: /']),
    ].join('\n'),
    [
      '# Bots de búsqueda, citación y acciones pedidas por la persona: permitidos.',
      ...BOTS_PERMITIDOS.flatMap((agente) => ['', `User-agent: ${agente}`, 'Allow: /']),
    ].join('\n'),
    `Sitemap: ${urlSitemap(site)}`,
  ];

  return bloques.join('\n\n') + '\n';
}

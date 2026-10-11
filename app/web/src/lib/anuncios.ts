// Etiquetas de Anuncios, compartidas por la tarjeta, el listado y la ficha.
// Deben coincidir con los `value` del esquema `anuncios` (content.config.ts y config.yml).
export const TIPOS_ANUNCIO = {
  trabajo: 'Oferta de trabajo',
  practica: 'Práctica profesional',
  pasantia: 'Pasantía',
  proyecto: 'Proyecto de investigación',
  convocatoria: 'Convocatoria',
  colaboracion: 'Solicitud de colaboración',
  otra: 'Otra oportunidad',
} as const;

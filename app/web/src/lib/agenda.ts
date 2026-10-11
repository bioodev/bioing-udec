// Etiquetas de la Agenda, compartidas por la tarjeta, el listado y la ficha.
// Deben coincidir con los `value` del esquema `actividades` (content.config.ts y config.yml).
export const TIPOS_ACTIVIDAD = {
  seminario: 'Seminario',
  charla: 'Charla',
  congreso: 'Congreso',
  taller: 'Taller',
  estudiantes: 'Actividad de estudiantes',
  egresados: 'Actividad de egresados/as',
  academica: 'Actividad académica',
  encuentro: 'Encuentro de la comunidad',
  otra: 'Otra',
} as const;

export const MODALIDADES = {
  presencial: 'Presencial',
  'en-linea': 'En línea',
  hibrida: 'Híbrida',
} as const;

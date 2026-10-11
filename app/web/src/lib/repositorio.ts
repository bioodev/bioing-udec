// Etiquetas del Repositorio, compartidas por la tarjeta, el listado y la ficha.
// Deben coincidir con los `value` del esquema `documentos` (content.config.ts y config.yml).
export const TIPOS_DOCUMENTO = {
  decreto: 'Decreto',
  reglamento: 'Reglamento',
  ley: 'Ley',
  informe: 'Informe',
  publicacion: 'Publicación',
  institucional: 'Documento institucional',
  historico: 'Documento histórico',
  academico: 'Material académico',
  otro: 'Otro',
} as const;

// Íconos que el panel ofrece para los encabezados de listado y el bloque «¿Eres egresado/a y no apareces?» (ADR 0011).
// Son nombres de componentes de phosphor-astro. El desplegable del panel (ancla &iconos_phosphor de config.yml)
// y el mapa de Icono.astro deben tener esta misma lista: lo comprueba src/lib/iconos.test.ts.
export const ICONOS = [
  'Newspaper', 'CalendarDots', 'Megaphone', 'Books', 'UsersThree', 'InstagramLogo', 'Flask', 'Dna', 'Microscope',
  'Atom', 'Leaf', 'GraduationCap', 'Briefcase', 'Handshake', 'Lightbulb', 'Star', 'Heart', 'Rocket', 'Trophy',
  'Globe', 'MapPin', 'FileText', 'Folder', 'ChartBar', 'Code', 'Gear', 'Info', 'Question', 'Sparkle', 'Users',
  'Student', 'Chalkboard', 'Pill', 'Heartbeat', 'TestTube', 'Plant', 'Drop', 'Fish', 'Cpu', 'Robot', 'Bank',
  'Certificate', 'Medal', 'UserPlus',
] as const;

export type NombreIcono = (typeof ICONOS)[number];

/** ¿Es un nombre de la lista? Un valor desconocido (p. ej. uno escrito a mano) no muestra ícono; no rompe el build. */
export const esIcono = (nombre: string | undefined): nombre is NombreIcono =>
  nombre !== undefined && (ICONOS as readonly string[]).includes(nombre);

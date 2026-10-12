// Tipos del módulo de reglas de la vista previa (vista-previa-seo-reglas.js). Lo usan las pruebas de src/lib/.

export interface Armado {
  titulo: string;
  descripcion?: string;
  imagen?: string;
}

export interface SeoEntrada {
  titulo?: string;
  descripcion?: string;
  imagen?: string;
  noindex?: boolean;
}

export interface VistaPrevia {
  titulo: string;
  descripcion: string | undefined;
  imagen: string | undefined;
  url: string;
  noindex: boolean;
  avisos: string[];
}

export declare const SUFIJO_TITULO: string;
export declare const LIMITE_TITULO: number;
export declare const LIMITE_DESCRIPCION: number;
export declare const IMAGEN_SITIO: string;
export declare const TIPOS: Record<'actividades' | 'anuncios' | 'documentos', Record<string, string>>;
export declare const RUTAS: Record<string, string>;

export declare function tituloDocumento(titulo: string): string;
export declare function resolverSeo(
  armado: Armado,
  seo: SeoEntrada | undefined,
): { titulo: string; descripcion: string | undefined; imagen: string | undefined; noindex: boolean };
export declare function cuandoActividad(inicio: string | undefined, fin?: string): string;
export declare function valoresArmados(coleccion: string, datos: Record<string, unknown>): Armado;
export declare function truncar(valor: string, limite: number): string;
export declare function avisos(datos: { titulo: string; descripcion: string | undefined; noindex: boolean }): string[];
export declare function vistaPrevia(
  coleccion: string,
  datos: Record<string, unknown>,
  opciones?: { slug?: string },
): VistaPrevia;

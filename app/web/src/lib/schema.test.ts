import { describe, expect, test } from 'vitest';
import {
  absoluta,
  actividad,
  documento,
  jsonLd,
  listaElementos,
  migas,
  noticia,
  ofertaLaboral,
  persona,
  sitioWeb,
  type JsonLd,
} from './schema';

const SITE = 'https://bioing.example';

/** Falla si algún valor (recursivo) es `undefined`. */
function sinUndefined(valor: unknown): boolean {
  if (Array.isArray(valor)) return valor.every(sinUndefined);
  if (valor && typeof valor === 'object') return Object.values(valor).every(sinUndefined);
  return valor !== undefined;
}

const fecha = new Date('2026-06-15T00:00:00.000Z');

describe('absoluta', () => {
  test('convierte rutas relativas y conserva absolutas', () => {
    expect(absoluta('/noticias/x', SITE)).toBe('https://bioing.example/noticias/x');
    expect(absoluta('https://otro.cl/a', SITE)).toBe('https://otro.cl/a');
    expect(absoluta('/personas/x', new URL('https://bioing.example/'))).toBe('https://bioing.example/personas/x');
  });
  test('usa el sitio por defecto si falta', () => {
    expect(absoluta('/x', undefined)).toBe('https://bioing.example/x');
  });
});

describe('sitioWeb', () => {
  test('devuelve WebSite y Organization (NGO)', () => {
    const [web, org] = sitioWeb(SITE);
    expect(web).toMatchObject({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'BIOING+', url: 'https://bioing.example/' });
    expect(org).toMatchObject({ '@type': 'NGO', name: 'BIOING+' });
  });
  test('el WebSite referencia la Organization y declara la FCB como organización madre', () => {
    const [web, org] = sitioWeb(SITE);
    expect(web.publisher).toEqual({ '@id': 'https://bioing.example#organizacion' });
    expect(org.parentOrganization).toMatchObject({ name: expect.stringContaining('Facultad de Ciencias Biológicas') });
  });
  test('sin configuración no declara sameAs ni SearchAction', () => {
    const [web, org] = sitioWeb(SITE);
    expect(web.potentialAction).toBeUndefined();
    expect(org.sameAs).toBeUndefined();
    expect(sinUndefined(sitioWeb(SITE))).toBe(true);
  });
  test('SearchAction solo si la búsqueda por URL está operativa', () => {
    const [web] = sitioWeb(SITE, { busqueda: true });
    expect(web.potentialAction).toMatchObject({
      '@type': 'SearchAction',
      target: { urlTemplate: 'https://bioing.example/buscar?q={search_term_string}' },
    });
  });
  test('sameAs solo con perfiles reales', () => {
    const [, org] = sitioWeb(SITE, { sameAs: ['https://www.instagram.com/bioingudec'] });
    expect(org.sameAs).toEqual(['https://www.instagram.com/bioingudec']);
  });
});

describe('migas', () => {
  test('BreadcrumbList con posiciones y URLs absolutas', () => {
    const b = migas(
      [
        { name: 'Inicio', url: '/' },
        { name: 'Noticias', url: '/noticias' },
        { name: 'Una noticia', url: '/noticias/una' },
      ],
      SITE,
    );
    expect(b['@type']).toBe('BreadcrumbList');
    expect(b.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://bioing.example/' },
      { '@type': 'ListItem', position: 2, name: 'Noticias', item: 'https://bioing.example/noticias' },
      { '@type': 'ListItem', position: 3, name: 'Una noticia', item: 'https://bioing.example/noticias/una' },
    ]);
    expect(sinUndefined(b)).toBe(true);
  });
});

describe('noticia', () => {
  const completa = noticia(
    { data: { titulo: 'Premio de innovación', fecha, bajada: 'Una bajada', imagen: { src: '/img/foto.png' }, etiquetas: ['premio', 'salud'] } },
    {
      site: SITE,
      url: '/noticias/premio',
      temas: ['logros'],
      areas: ['salud', 'biomateriales'],
      personas: [{ nombre: 'Ana Pérez', url: '/personas/ana-perez' }, { nombre: 'Sin Ficha' }],
      organizaciones: [{ nombre: 'Lab UdeC' }],
    },
  );

  test('NewsArticle con campos completos y URLs absolutas', () => {
    expect(completa).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: 'Premio de innovación',
      datePublished: '2026-06-15T00:00:00.000Z',
      description: 'Una bajada',
      image: 'https://bioing.example/img/foto.png',
      articleSection: 'logros',
      keywords: 'premio, salud',
      mainEntityOfPage: 'https://bioing.example/noticias/premio',
      inLanguage: 'es',
    });
    expect(completa.about).toEqual([
      { '@type': 'Thing', name: 'salud' },
      { '@type': 'Thing', name: 'biomateriales' },
    ]);
    expect(completa.mentions).toEqual([
      { '@type': 'Person', name: 'Ana Pérez', url: 'https://bioing.example/personas/ana-perez' },
      { '@type': 'Person', name: 'Sin Ficha' },
      { '@type': 'Organization', name: 'Lab UdeC' },
    ]);
    expect(sinUndefined(completa)).toBe(true);
  });

  test('sin opcionales no deja claves undefined', () => {
    const minima = noticia({ data: { titulo: 'Solo título', fecha } }, { site: SITE, url: '/noticias/min' });
    expect(minima.description).toBeUndefined();
    expect(minima.image).toBeUndefined();
    expect(minima.mentions).toBeUndefined();
    expect(minima.articleSection).toBeUndefined();
    expect(sinUndefined(minima)).toBe(true);
  });
});

describe('actividad', () => {
  const base = { data: { titulo: 'Charla', inicio: new Date('2026-06-12T21:00:00.000Z'), modalidad: 'presencial' as const } };

  test('presencial con lugar → Place', () => {
    const e = actividad({ data: { ...base.data, lugar: 'Sala 201, FCB' } }, { site: SITE, url: '/agenda/charla' });
    expect(e).toMatchObject({
      '@type': 'Event',
      name: 'Charla',
      startDate: '2026-06-12T21:00:00.000Z',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: 'Sala 201, FCB' },
    });
  });

  test('en línea sin lugar → VirtualLocation (sin Place)', () => {
    const e = actividad({ data: { ...base.data, modalidad: 'en-linea' } }, { site: SITE, url: '/agenda/charla' });
    expect(e.eventAttendanceMode).toBe('https://schema.org/OnlineEventAttendanceMode');
    expect(e.location).toEqual({ '@type': 'VirtualLocation', url: 'https://bioing.example/agenda/charla' });
  });

  test('híbrida con lugar → Place + VirtualLocation', () => {
    const e = actividad({ data: { ...base.data, modalidad: 'hibrida', lugar: 'Auditorio' } }, { site: SITE, url: '/agenda/charla' });
    expect(e.eventAttendanceMode).toBe('https://schema.org/MixedEventAttendanceMode');
    expect(e.location).toEqual([
      { '@type': 'Place', name: 'Auditorio' },
      { '@type': 'VirtualLocation', url: 'https://bioing.example/agenda/charla' },
    ]);
  });

  test('híbrida sin lugar → solo VirtualLocation; presencial sin lugar → sin location', () => {
    expect(actividad({ data: { ...base.data, modalidad: 'hibrida' } }, { site: SITE, url: '/x' }).location).toEqual({
      '@type': 'VirtualLocation',
      url: 'https://bioing.example/x',
    });
    expect(actividad(base, { site: SITE, url: '/x' }).location).toBeUndefined();
  });

  test('fin, organizadores, expositores, imagen y oferta de inscripción', () => {
    const e = actividad(
      {
        data: {
          ...base.data,
          fin: new Date('2026-06-12T23:00:00.000Z'),
          imagen: { src: '/img/e.png' },
          enlace_inscripcion: 'https://forms.gle/x',
        },
      },
      {
        site: SITE,
        url: '/agenda/charla',
        organizadores: [
          { tipo: 'persona', nombre: 'Carolina López', url: '/personas/profesora-lopez' },
          { tipo: 'organizacion', nombre: 'Lab UdeC' },
        ],
        expositores: [{ nombre: 'Diego Rojas' }],
      },
    );
    expect(e.endDate).toBe('2026-06-12T23:00:00.000Z');
    expect(e.image).toBe('https://bioing.example/img/e.png');
    expect(e.offers).toEqual({ '@type': 'Offer', url: 'https://forms.gle/x', availability: 'https://schema.org/InStock' });
    expect(e.organizer).toEqual([
      { '@type': 'Person', name: 'Carolina López', url: 'https://bioing.example/personas/profesora-lopez' },
      { '@type': 'Organization', name: 'Lab UdeC' },
    ]);
    expect(e.performer).toEqual({ '@type': 'Person', name: 'Diego Rojas' });
    expect(sinUndefined(e)).toBe(true);
  });

  test('sin organizadores/expositores/enlace no declara organizer ni offers', () => {
    const e = actividad(base, { site: SITE, url: '/x' });
    expect(e.organizer).toBeUndefined();
    expect(e.performer).toBeUndefined();
    expect(e.offers).toBeUndefined();
    expect(sinUndefined(e)).toBe(true);
  });
});

describe('ofertaLaboral', () => {
  const ahora = new Date('2026-06-01T12:00:00.000Z');

  test('trabajo vigente → JobPosting', () => {
    const j = ofertaLaboral(
      { data: { titulo: 'Se busca ingeniero/a', tipo: 'trabajo', fecha: new Date('2026-05-01'), fecha_limite: new Date('2026-12-31') } },
      { site: SITE, url: '/anuncios/x', oferente: { tipo: 'organizacion', nombre: 'Alimentos Bío' }, areas: ['industria-alimentaria'], ahora },
    );
    expect(j).toMatchObject({
      '@type': 'JobPosting',
      title: 'Se busca ingeniero/a',
      datePosted: '2026-05-01T00:00:00.000Z',
      validThrough: '2026-12-31T00:00:00.000Z',
      url: 'https://bioing.example/anuncios/x',
      hiringOrganization: { '@type': 'Organization', name: 'Alimentos Bío' },
    });
    expect(j?.description).toBe('Se busca ingeniero/a · Áreas: industria-alimentaria');
    expect(sinUndefined(j)).toBe(true);
  });

  test('práctica y pasantía también son JobPosting; sin fecha límite vence a 60 días', () => {
    const practica = ofertaLaboral(
      { data: { titulo: 'Práctica', tipo: 'practica', fecha: new Date('2026-05-01') } },
      { site: SITE, url: '/x', ahora },
    );
    expect(practica?.['@type']).toBe('JobPosting');
    expect(practica?.validThrough).toBe(new Date(new Date('2026-05-01').valueOf() + 60 * 86_400_000).toISOString());
  });

  test('un Anuncio vencido o de otro tipo no genera JobPosting', () => {
    expect(
      ofertaLaboral({ data: { titulo: 'Viejo', tipo: 'trabajo', fecha: new Date('2026-01-01') } }, { site: SITE, url: '/x', ahora }),
    ).toBeNull();
    expect(
      ofertaLaboral({ data: { titulo: 'Proyecto', tipo: 'proyecto', fecha: new Date('2026-05-01'), fecha_limite: new Date('2027-01-01') } }, { site: SITE, url: '/x', ahora }),
    ).toBeNull();
  });

  test('si el Oferente es Persona, hiringOrganization usa su nombre', () => {
    const j = ofertaLaboral(
      { data: { titulo: 'Colaboración', tipo: 'trabajo', fecha: new Date('2026-05-01'), fecha_limite: new Date('2027-01-01') } },
      { site: SITE, url: '/x', oferente: { tipo: 'persona', nombre: 'Ana Pérez' }, ahora },
    );
    expect(j?.hiringOrganization).toEqual({ '@type': 'Organization', name: 'Ana Pérez' });
  });
});

describe('persona', () => {
  test('con Perfil de egresado autorizado declara cargo, afiliación, enlaces y alumniOf', () => {
    const p = persona(
      {
        data: {
          nombre: 'Ana Pérez',
          descripcion: 'Investigadora',
          foto: { src: '/img/ana.png' },
          perfil_egresado: {
            autorizado: true,
            anio_egreso: 2019,
            cargo: 'Investigadora',
            enlaces: [{ etiqueta: 'LinkedIn', url: 'https://www.linkedin.com/in/ana' }],
          },
        },
      },
      { site: SITE, url: '/personas/ana-perez', organizacion: { nombre: 'Lab UdeC', sitioWeb: 'https://udec.cl' } },
    );
    expect(p).toMatchObject({
      '@type': 'Person',
      name: 'Ana Pérez',
      description: 'Investigadora',
      image: 'https://bioing.example/img/ana.png',
      jobTitle: 'Investigadora',
      url: 'https://bioing.example/personas/ana-perez',
      affiliation: { '@type': 'Organization', name: 'Lab UdeC', url: 'https://udec.cl' },
      sameAs: ['https://www.linkedin.com/in/ana'],
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidad de Concepción' },
    });
    expect(sinUndefined(p)).toBe(true);
  });

  test('sin perfil autorizado no expone datos profesionales', () => {
    const p = persona(
      { data: { nombre: 'Ignacio Morales', perfil_egresado: { autorizado: false, anio_egreso: 2019, cargo: 'Oculto' } } },
      { site: SITE, url: '/personas/ignacio', organizacion: { nombre: 'No debería aparecer' } },
    );
    expect(p.jobTitle).toBeUndefined();
    expect(p.affiliation).toBeUndefined();
    expect(p.sameAs).toBeUndefined();
    expect(p.alumniOf).toBeUndefined();
    expect(sinUndefined(p)).toBe(true);
  });

  test('Persona sin perfil solo declara nombre y URL', () => {
    const p = persona({ data: { nombre: 'Carolina López' } }, { site: SITE, url: '/personas/carolina' });
    expect(p).toMatchObject({ '@type': 'Person', name: 'Carolina López' });
    expect(p.jobTitle).toBeUndefined();
    expect(sinUndefined(p)).toBe(true);
  });
});

describe('documento', () => {
  test('DigitalDocument con año, enlace, temas y palabras clave', () => {
    const d = documento(
      { data: { titulo: 'Reglamento de titulación', anio: 2024, enlace: 'https://drive.google.com/x', descripcion: 'Normativa', palabras_clave: ['título', 'reglamento'] } },
      { site: SITE, url: '/repositorio/reglamento', temas: ['institucional'] },
    );
    expect(d).toMatchObject({
      '@type': 'DigitalDocument',
      name: 'Reglamento de titulación',
      datePublished: '2024-01-01',
      url: 'https://drive.google.com/x',
      inLanguage: 'es',
      description: 'Normativa',
      keywords: 'título, reglamento',
      mainEntityOfPage: 'https://bioing.example/repositorio/reglamento',
    });
    expect(d.about).toEqual([{ '@type': 'Thing', name: 'institucional' }]);
    expect(sinUndefined(d)).toBe(true);
  });
});

describe('listaElementos', () => {
  test('CollectionPage con ItemList posicionado y URLs absolutas', () => {
    const l = listaElementos(
      'Directorio de bioingenieros/as',
      [
        { name: 'Ana Pérez', url: '/personas/ana-perez' },
        { name: 'Diego Rojas', url: '/personas/diego-rojas' },
      ],
      SITE,
    );
    expect(l).toMatchObject({ '@type': 'CollectionPage', name: 'Directorio de bioingenieros/as' });
    expect(l.mainEntity).toEqual({
      '@type': 'ItemList',
      numberOfItems: 2,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Pérez', url: 'https://bioing.example/personas/ana-perez' },
        { '@type': 'ListItem', position: 2, name: 'Diego Rojas', url: 'https://bioing.example/personas/diego-rojas' },
      ],
    });
    expect(sinUndefined(l)).toBe(true);
  });
});

describe('jsonLd', () => {
  test('serializa objetos y arreglos', () => {
    const objeto: JsonLd = { '@type': 'Thing', name: 'x' };
    expect(JSON.parse(jsonLd(objeto))).toEqual(objeto);
    expect(JSON.parse(jsonLd([objeto]))).toEqual([objeto]);
  });
  test('escapa </script> para no cerrar el bloque', () => {
    const texto = jsonLd({ '@type': 'Thing', name: 'antes </script> después' });
    expect(texto).not.toContain('</script>');
    expect(texto).toContain('<\\/script>');
    expect(JSON.parse(texto).name).toBe('antes </script> después');
  });
});

# Agenda — reunión del Hito 3 (2026-10-18)

> **Borrador para revisar antes de enviar.** No se ha enviado nada: la prepara y la manda la persona.
> La agenda es corta a propósito: una hora y media, con la vista previa abierta como guion.

**Objetivo:** cerrar el Hito 3 (aceptación de las secciones restantes) y despejar los bloqueos de las
semanas siguientes: el nombre de la cuenta central, la decisión de datos personales y las respuestas
de contenido.

**Participan:** contraparte de la carrera (Encargado/a de comunicaciones y jefatura) y el proveedor.
**Base:** `../preguntas-reunion.md` §6, §7.1, §8 y §9, más los temas nuevos del
[plan de avance y mejoras](../plans/2026-10-18-plan-avance-y-mejoras.md).

## Antes de la reunión

- Vista previa publicada y abierta en pantalla (con la reunión como guion): se recorren Agenda, Anuncios,
  Repositorio, Instagram, «¿Qué es la Bioingeniería?» y el anuario en PDF.
- Enviar con antelación las secciones §8 y §9 de `preguntas-reunion.md` para que lleguen con respuestas
  (son muchas y de contenido).
- Pedir por escrito, **sin esperar la reunión**, el visto bueno del nombre de la cuenta central y la
  designación del Encargado/a y de dos administradores (Bloque 0 del plan).

## Agenda (90 minutos)

1. **Visto bueno del nombre de la cuenta central** (5 min, decisión).
   Ruta crítica de todo lo que falta: sin el nombre no se crean las cuentas ni se migra.
   Salida esperada: nombre aprobado y confirmado por escrito.

2. **Aceptación del Hito 3** (15 min, decisión).
   Recorrido por las secciones restantes ya funcionando con contenido de prueba (Agenda, Anuncios,
   Repositorio, Instagram, «¿Qué es la Bioingeniería?» y el anuario PDF). Criterio del hito: las secciones
   funcionan y las pruebas automáticas están en verde, y la contraparte acepta.
   Salida esperada: aceptación formal (o la lista cerrada de observaciones).

3. **Datos personales y Ley 21.719** (20 min, decisión; el punto más caro de revertir).
   La ley rige desde el 1 de diciembre de 2026, antes de la puesta en producción, y el Directorio publica
   datos de egresados/as. Decidir entre las dos opciones del ADR
   [0017](../adr/0017-datos-personales-del-directorio.md) —(a) procedimiento documentado de supresión que
   incluya el historial de Git, o (b) datos del Directorio fuera del repositorio— y confirmar el Google Form
   como registro de consentimiento. Sumar a asesoría jurídica de la UdeC si la carrera lo considera.
   Salida esperada: opción elegida y quién da el visto bueno. **Antes de cargar egresados/as reales.**

4. **Identidad, alcance y correo oficial** (`preguntas-reunion.md` §6) (15 min).
   6.1 una persona encargada y una de respaldo con los mismos permisos · 6.2 cuenta de Instagram y quién
   tiene acceso · 6.3 logo y manual de marca UdeC/FCB, o aprobación del diseño · 6.4 dominio (UdeC o
   propio) y restricciones de TI · 6.5 solo español (se propone que sí) · 6.6 qué es imprescindible para
   marzo · y el **correo o canal oficial** para el `Contact` de `security.txt`.

5. **Página destacada del Inicio** (`preguntas-reunion.md` §7.1) (10 min).
   El switch «Destacar en el Inicio» ya está implementado; falta validar: una página a la vez o hasta dos ·
   de dónde sale el resumen · si se muestran los bloques destacados · si basta el desplegable «La carrera ▾»
   · y si se entienden las tres formas de destacar (Banners, Página destacada y Secciones destacadas).

6. **Panel de edición** (`preguntas-reunion.md` §8) (10 min).
   Las dudas de nombres y textos del panel (8.1 a 8.16). Se puede resolver por correo lo que no quepa acá;
   en sala, priorizar 8.1 (¿se entienden los nombres nuevos?) y 8.16 (aviso de privacidad por Instagram).

7. **URLs del sitio WordPress actual** (5 min, dato).
   Pedir el listado de las direcciones indexadas del sitio actual para configurar los `_redirects`
   (supuesto contractual, propuesta §10). Salida esperada: el listado o quién lo entrega y para cuándo.

8. **Contenido real** (`preguntas-reunion.md` §9) (10 min).
   9.1 redes con sus direcciones · 9.2 enlace del Google Form del Directorio (bloquea el botón de sumarse) ·
   9.3 si las organizaciones «(ejemplo)» son reales · 9.4 bajada obligatoria y cuerpo real de las noticias ·
   9.6 el video institucional · 9.7 quién completa los datos de cada persona.

9. **Compromisos y fechas** (cierre, 5 min). Repasar el plano B y el aviso por escrito:
   - **15-dic-2026**: dominio, tarjeta e identidad visual. Si se atrasa, el Hito 4 se demuestra en
     `workers.dev` de la cuenta central y el dominio queda como redespliegue final.
   - **15-ene-2027**: listado de egresados/as con autorizaciones y contenidos iniciales. Si se atrasa, se
     publica el Directorio vacío o solo con perfiles autorizados.
   - Compromiso de avisar por escrito en cuanto se pase cada fecha.

## Después de la reunión

- Registrar las respuestas en `preguntas-reunion.md` y las decisiones como ADR.
- Si se acepta el Hito 3: anotarlo y pasar a la cuenta central, la migración y los ambientes (Bloque 2).
- Proponer como oportunidad los componentes de editor para video/PDF/mapa (`guia-evolucion.md` §4).

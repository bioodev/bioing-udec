# 0003 · Cuenta central anticipada y ambientes QA / producción

- **Estado:** Accepted · 2026-10-11 · el punto 2 (QA construida desde `develop`) lo reemplaza el
  [ADR 0004](0004-flujo-de-trabajo-una-persona.md): QA se publica a mano
- **Decisores:** proveedor (pendiente: visto bueno de la carrera para el nombre del correo)
- **Contexto relacionado:** `../propuesta-desarrollo.md` §6.5 · `../plans/2026-10-11-plan-hito-4-produccion.md` ·
  `../plans/2026-10-11-plan-ambientes-qa-produccion.md` · `../pendientes-infra.md`

## Contexto

La Fase A del Hito 4 está cerrada. Lo que sigue (migrar a GitHub, el login del panel, CI/CD) dependía de que
la carrera creara la cuenta central, la organización de GitHub y la cuenta de Cloudflare (Fase B, plazo
15-dic-2026). Un atraso ahí corre el Hito 4 completo. Además, las pruebas de mayor riesgo de la carga real
(subir imágenes desde Sveltia, "Agregar Persona") solo se pueden hacer con el backend definitivo.

Se evaluó crear un correo y cuentas aparte, solo para desarrollo y QA, y también servir QA desde el dominio
de desarrollo del proveedor. Esa zona está en la cuenta personal de Cloudflare del proveedor. Un dominio
propio en un Worker exige la zona en la misma cuenta, y Cloudflare bloquea los CNAME a `workers.dev` entre
cuentas (error 1014).

## Decisión

1. **El proveedor crea ya la cuenta central del proyecto** (Gmail, organización de GitHub y cuenta de
   Cloudflare), tal como la define §6.5. La carrera aprueba el nombre antes. Desde el primer día es la cuenta
   de producción y se traspasa en el Hito 5.
2. **Un solo juego de cuentas, varios ambientes**, en vez de cuentas por ambiente:
   - dev: local (+ Gitea mientras dure);
   - QA: Worker `bioing-web-qa` (`env.qa` en `wrangler.jsonc`), rama `develop`, en `*.workers.dev` con
     `noindex`;
   - producción: Worker `bioing-web`, rama `main`, en `*.workers.dev` hasta que exista el dominio oficial.
3. QA usa **Workers separados** (entornos de Wrangler) y no las Previews de Workers Builds. Cada Worker tiene
   su propia variable de build `SITE_URL`, y la URL de QA queda estable.
4. **No se usa el dominio del proveedor** para ningún ambiente de la entrega.
5. `npm run deploy:dev` publica solo QA. Producción se publica solo por Workers Builds.

## Consecuencias

- C1, C3 y casi toda C4 se pueden hacer ahora. De la carrera solo queda el dominio, la tarjeta y la identidad
  visual. El paso al dominio oficial se reduce a un redespliegue documentado.
- El proveedor custodia temporalmente las cuentas de la carrera. Mitigación: doble factor con dos métodos,
  recuperación al correo de la jefatura, credenciales en un gestor compartido y checklist de traspaso
  (teléfono, códigos de respaldo, owners, rotación del Deploy Hook y de la OAuth App).
- El `config.yml` del panel es el mismo en ambos ambientes y escribe en `main`: el contenido se edita solo
  desde producción.
- `workers.dev` está pensado para proyectos no críticos. Es aceptable mientras no haya dominio, y producción
  pasa al dominio propio en cuanto exista.

## Alternativas

- **Esperar a que la carrera cree las cuentas** (plan original): sin riesgo de custodia, pero deja C1–C4 y las
  pruebas del panel colgando de la Fase B.
- **Cuentas aparte para dev/QA a nombre del proveedor**: obliga a migrar todo de nuevo a la cuenta central y
  duplica la configuración (OAuth App, Worker de auth, Builds).
- **QA en el dominio del proveedor**: Cloudflare no lo permite entre cuentas sin mover la zona o pagar
  Cloudflare for SaaS, y además ata una URL de la entrega a una cuenta personal.
- **QA con Previews de Workers Builds**: menos Workers, pero la URL depende de la rama o de la versión, y
  `SITE_URL` (que se fija en el build) no la conoce de antemano. Se pueden activar más adelante para ramas de
  funcionalidad.

# 0004 · Flujo de trabajo para una persona: solo `main` se construye

- **Estado:** Accepted · 2026-10-11 · reemplaza el punto 2 del [ADR 0003](0003-cuenta-central-anticipada-y-ambientes.md)
  en lo que toca a QA
- **Decisores:** proveedor
- **Contexto relacionado:** `../plans/2026-10-11-plan-ambientes-qa-produccion.md` §3.4 · `../../AGENTS.md`

## Contexto

El ADR 0003 conectaba dos Workers a Workers Builds: QA desde `develop` y producción desde `main`. El
desarrollo lo hace una sola persona con ayuda de agentes, que hacen commits muy seguido. Si cada push a
`develop` dispara un build, se gastan minutos de Workers Builds (3 000/mes en el plan gratuito, 1 build a la
vez) en estados intermedios que nadie va a revisar. Además:

- Workers Builds no documenta un `[skip ci]` en el mensaje del commit.
- Los *build watch paths* filtran por archivo, no por intención, y se ignoran si un push trae más de 20
  commits.
- El panel (Sveltia) publica con commits directos a `main`, así que exigir PR en `main` lo bloquearía.

Se evaluó un flujo con PR, CI en GitHub Actions y rulesets. Es el estándar de un equipo, pero es demasiado
para una persona.

## Decisión

1. **Cloudflare construye solo `main`** (Worker `bioing-web`), con las Preview builds desactivadas.
2. **QA (`bioing-web-qa`) no se conecta a Workers Builds:** se publica a mano con `npm run deploy:dev` cuando
   hay algo que mostrar.
3. **Se trabaja en `develop`** (o en ramas y worktrees). Los push a `develop` no cuestan nada. **Publicar** es
   mergear `develop` en `main` y hacer push: un build por push, sin importar cuántos commits traiga.
4. **Los agentes nunca hacen push**; lo hace la persona.
5. **Antes de mergear a `main`:** `npm run verificar` (tests, `astro check`, build, postbuild y JSON-LD). Es un
   script local, sin CI en GitHub.
6. **Protección de `main`:** un ruleset que solo prohíbe el force-push y el borrado. Sin PR ni checks
   obligatorios, para no bloquear al panel.
7. **Build watch paths** en `bioing-web`: excluir `docs/*`, `.github/*`, `AGENTS.md` y `README.md`. No se
   excluye `*.md`, porque el contenido del sitio es Markdown.

## Consecuencias

- Solo hay builds cuando se publica: un merge a `main`, una publicación desde el panel o la reconstrucción
  diaria. Son ≈ 30–60 al mes, menos del 5 % de la cuota.
- QA puede quedar desactualizada. Es aceptable, porque se publica cuando se quiere mostrar algo.
- No hay revisión automática en GitHub: la red de seguridad es `npm run verificar` local y, si el build de
  `main` falla, el sitio publicado no cambia (Workers Builds no despliega un build roto).
- Si el proyecto pasa a un equipo, se puede subir a PR + CI sin cambiar la infraestructura: basta agregar
  `ci.yml` y exigir PR para el código, con el Encargado en la *bypass list* del ruleset.

## Alternativas

- **PR + CI (GitHub Actions) + rulesets:** es lo profesional para un equipo, pero para una persona es
  burocracia, y obliga a resolver la bypass list del panel.
- **Rama `qa` aparte construida por Cloudflare:** controla los builds de QA, pero suma una rama más que
  sincronizar. El deploy manual cumple lo mismo con menos piezas.
- **Confiar en `[skip ci]`:** no está documentado en Workers Builds.

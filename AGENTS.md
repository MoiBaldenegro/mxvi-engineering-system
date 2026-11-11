# AGENTS.md — MXVI Engineering System

Este repositorio define **cómo se construye** un producto del ecosistema MXVI:
arquitectura por niveles, convenciones y estructura de código. Es el hermano
del MXVI Design System (cómo se ve).

Sitio: https://moibaldenegro.github.io/mxvi-engineering-system/

## Qué hay aquí

| Ruta | Qué es |
|---|---|
| `docs/` | Documentación canónica (VitePress). Una carpeta por sección; `docs/hexagonal/` es el nivel 1. |
| `examples/hexagonal-basic/` | Proyecto de referencia del nivel 1. El código de la documentación se incluye desde aquí. |
| `tools/check-layers.mjs` | Verificador de la regla de dependencias, sin dependencias. |
| `scripts/prepare-docs.mjs` | Genera `llms*.txt`, el Markdown público y los zips (no se versionan). |
| `scripts/check-docs.mjs` | Comprueba páginas, inclusiones de código, fragmentos y enlaces. |
| `scripts/sync-mxvi.mjs` | Sincroniza el look del sitio desde el MXVI Design System. |

## Estado

- **Nivel 1 · Hexagonal básico:** desarrollado.
- **Nivel 2 (hexagonal + DDD) y nivel 3 (hexagonal + DDD + CQRS):** planeados.
  No escribas su contenido sin que se pida; no existe todavía.

## Comandos (Node 22 o superior)

- `npm run check` — compila y prueba el código de referencia, revisa sus capas
  y comprueba la documentación. Debe pasar antes de cualquier commit.
- `node --test "tools/*.test.mjs"` — pruebas del verificador de capas.
- `npm run build` — genera los soportes para agentes y construye el sitio.
- `npm run dev` — sitio en local.

## Reglas para cambiar este repositorio

- **El código de referencia manda.** Si cambias una regla, cambia primero el
  ejemplo (con su prueba) y después la documentación.
- **No pegues código en la documentación si puede incluirse.** Usa
  `<<< @/../examples/...` para mostrar un archivo. Un bloque `ts` escrito a
  mano en un nivel debe existir tal cual en el ejemplo; `check-docs` lo verifica.
- **Una regla, un lugar.** Cada regla se explica en su página; las demás
  enlazan. El contrato compacto del nivel y las instrucciones para agentes la
  resumen, no la redefinen.
- **Los niveles se suman.** Un nivel nuevo conserva lo del anterior y documenta
  solo lo que añade. Se registra en `LEVELS` (`scripts/prepare-docs.mjs`) con
  su proyecto de referencia.
- **Documentación en español; código, identificadores y pruebas en inglés.**
- **`docs/.vitepress/theme/mxvi/` no se edita a mano:** es una copia del design
  system (`node scripts/sync-mxvi.mjs`).
- Los archivos de `docs/public/` generados (`markdown/`, `downloads/`,
  `llms*.txt`, `ai/`, `tools/`) no se versionan.

## Cómo añadir un nivel

1. Crear `examples/<nivel>/` con el proyecto de referencia y sus pruebas.
2. Crear `docs/<nivel>/` con las mismas páginas que el nivel 1, documentando
   solo lo que cambia o se añade.
3. Registrar el nivel en `LEVELS`, en la barra lateral
   (`docs/.vitepress/config.mts`) y en el mapa (`docs/levels/index.md`).
4. Ajustar `tools/check-layers.mjs` si el nivel cambia la regla de dependencias.
5. `npm run check` y `npm run build`.

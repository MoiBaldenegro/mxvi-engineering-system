# MXVI Engineering System

**Una forma de construir. Varios niveles.**

Arquitectura, convenciones y estructura de código para los productos del
ecosistema MXVI, organizadas por niveles que van de menos a más. Con código de
referencia que se prueba solo y documentación pensada para personas y para
agentes de IA.

- Sitio: https://moibaldenegro.github.io/mxvi-engineering-system/
- Hermano de: [MXVI Design System](https://moibaldenegro.github.io/mxvi-design-system/)

## Niveles

| Nivel | Arquitectura | Estado |
|---|---|---|
| 1 | Hexagonal básico (sin DDD, sin CQRS) | Disponible |
| 2 | Hexagonal + DDD (ligero o completo) | Planeado |
| 3 | Hexagonal + DDD + CQRS (con o sin eventos) | Planeado |

## Qué incluye

- **Documentación** (`docs/`): principios, mapa de niveles y el nivel 1
  completo: capas, estructura de carpetas, dominio, aplicación (casos de uso o
  servicios de aplicación), adaptadores, raíz de composición, errores, pruebas,
  nombres, ejemplo guiado y checklist.
- **Proyecto de referencia** (`examples/hexagonal-basic/`): un acortador de
  enlaces que cumple el nivel 1. La documentación incluye su código
  directamente.
- **Verificador de capas** (`tools/check-layers.mjs`): comprueba la regla de
  dependencias de cualquier proyecto. Un archivo, sin dependencias.
- **Soportes para agentes:** `llms.txt`, `llms-full.txt`, `llms-hexagonal.txt`,
  cada página como Markdown y zips con su `AGENTS.md`.

## Usarlo en un proyecto

```bash
# Verificar la regla de dependencias
curl -O https://moibaldenegro.github.io/mxvi-engineering-system/tools/check-layers.mjs
node check-layers.mjs src
```

Para darle las reglas a un agente, usa
[`llms-hexagonal.txt`](https://moibaldenegro.github.io/mxvi-engineering-system/llms-hexagonal.txt)
o descomprime
[`mxvi-hexagonal-markdown.zip`](https://moibaldenegro.github.io/mxvi-engineering-system/downloads/mxvi-hexagonal-markdown.zip)
en el repositorio.

## Desarrollo

Requiere Node 22 o superior.

```bash
npm install
npm run check                      # código de referencia, capas y documentación
node --test "tools/*.test.mjs"     # pruebas del verificador
npm run dev                        # sitio en local
npm run build                      # soportes para agentes + sitio
```

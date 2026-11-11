---
title: Verificador de capas
---

# Verificador de capas

`check-layers.mjs` comprueba la [regla de dependencias](/hexagonal/layers) de
un proyecto leyendo sus `import`. Es un solo archivo, sin dependencias, y sirve
igual en CI, en un *hook* o para que un agente valide su propio trabajo.

- **Descargar:** [`/tools/check-layers.mjs`](/tools/check-layers.mjs)
- **Requiere:** Node 18 o superior.
- **Lenguajes:** archivos `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` y `.cjs`.

## Uso

```bash
node check-layers.mjs            # revisa ./src
node check-layers.mjs src        # una carpeta
node check-layers.mjs apps/api/src apps/web/src   # varias
```

Sale con código `0` si todo cumple y con `1` si hay violaciones:

```text
Capas ✘ 2 violación(es) de la regla de dependencias:

  src/presentation/LinksController.ts:4  presentation no puede importar infrastructure ("../infrastructure/file/JsonFileShortLinkRepository")
  src/domain/ShortLink.ts:1  domain no puede importar el paquete "zod"

domain → nada · application → domain · infrastructure y presentation → hacia adentro.
```

## Qué revisa

| Capa del archivo | Puede importar | Paquetes |
|---|---|---|
| `domain` | `domain` | No |
| `application` | `domain`, `application` | No |
| `infrastructure` | `domain`, `application`, `infrastructure`, archivos fuera de las capas | Sí |
| `presentation` | `domain`, `application`, `presentation`, archivos fuera de las capas | Sí |

- **La capa de un archivo** es la primera carpeta de su ruta que se llama como
  una capa. Funciona con `src/domain/...` y con `src/<módulo>/domain/...`.
- **Cuenta todo tipo de import:** `import`, `import type`, `export ... from`,
  `import()` y `require()`. Una dependencia de tipos también es una
  dependencia.
- **Paquete** es todo lo que no empieza con `.`: librerías y módulos de la
  plataforma (`node:fs`).

## Qué no revisa

- Archivos fuera de las capas: `main`, `container`, módulos del framework,
  configuración. Son la raíz de composición y pueden importar todo.
- Pruebas: `*.test.*`, `*.spec.*` y las carpetas `test/`, `tests/`,
  `__tests__/` y `__mocks__/`.
- Imports con alias de rutas (`@/domain/...`): se tratan como paquetes. En
  `domain` y `application` se reportan; usa rutas relativas en esas capas.
- Que el contenido de cada archivo sea el correcto para su capa. Eso lo cubre
  la [checklist](/hexagonal/checklist).

## En CI

```yaml
- name: Regla de dependencias
  run: node tools/check-layers.mjs src
```

## Desde código

El archivo también exporta sus funciones:

```js
import { checkLayers } from './check-layers.mjs';

const violations = checkLayers('src'); // string[]
```

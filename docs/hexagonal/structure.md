---
title: Estructura de carpetas
---

# Estructura de carpetas

Hay dos acomodos válidos. Las capas y sus reglas son las mismas en ambos;
cambia cuál es la carpeta de primer nivel.

## Por capa

Para aplicaciones de **un solo módulo** o pequeñas: una SPA, un servicio con
una sola área, una herramienta.

```text
src/
├── domain/
│   ├── ShortLink.ts               modelo
│   ├── shortLinkRules.ts          reglas puras
│   ├── errors/
│   │   └── ShortLinkErrors.ts
│   └── ports/
│       ├── ShortLinkRepository.ts
│       ├── CodeGenerator.ts
│       └── Clock.ts
├── application/
│   ├── CreateShortLink.ts         un caso de uso por archivo
│   ├── CreateShortLink.test.ts    la prueba junto al código
│   ├── ResolveShortLink.ts
│   └── ResolveShortLink.test.ts
├── infrastructure/
│   ├── memory/
│   │   └── InMemoryShortLinkRepository.ts
│   ├── file/
│   │   └── JsonFileShortLinkRepository.ts
│   ├── system/
│   │   ├── RandomCodeGenerator.ts
│   │   └── SystemClock.ts
│   └── ShortLinkRepository.contract.test.ts
├── presentation/
│   └── http/
│       ├── shortLinkHttpHandler.ts
│       └── shortLinkHttpHandler.test.ts
├── test/
│   └── fakes.ts                   dobles compartidos por las pruebas
├── container.ts                   raíz de composición
└── main.ts                        punto de entrada
```

Es la estructura del [proyecto de referencia](/hexagonal/walkthrough).

## Por módulo

Para aplicaciones con **varias áreas** (por ejemplo `characters`, `guilds`,
`identity`). Cada módulo repite las cuatro capas y lo común va en `shared`.

```text
src/
├── characters/
│   ├── domain/
│   │   ├── Character.ts
│   │   ├── errors/
│   │   └── ports/
│   ├── application/
│   ├── infrastructure/
│   ├── presentation/
│   └── characters.module.ts       raíz de composición del módulo
├── guilds/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   ├── presentation/
│   └── guilds.module.ts
├── shared/
│   ├── domain/                    errores y tipos comunes
│   ├── infrastructure/            cliente HTTP, caché, logging
│   └── presentation/              filtros, guardas, middlewares
├── config/                        lectura y validación del entorno
└── main.ts
```

## Cuál elegir

| Situación | Acomodo |
|---|---|
| Una sola área de negocio. | Por capa |
| Dos o más áreas que cambian por razones distintas. | Por módulo |
| Empezó por capa y apareció una segunda área. | Mover a por módulo: cada capa se reparte en sus módulos. |

No se mezclan: un proyecto usa uno de los dos.

## Reglas de la estructura

- **Los nombres de las capas son fijos:** `domain`, `application`,
  `infrastructure`, `presentation`. El [verificador](/tools/check-layers) los
  reconoce por nombre en cualquier profundidad.
- **Los puertos viven en `domain/ports/`**, uno por archivo.
- **Los errores viven en `domain/errors/`.**
- **`infrastructure` se subdivide por tecnología** (`memory`, `file`, `http`,
  `postgres`, `system`), no por tipo de clase.
- **`presentation` se subdivide por canal** (`http`, `cli`, `ui`).
- **Las pruebas van junto al código** (`X.ts` y `X.test.ts`). Los dobles
  compartidos van en `test/`.
- **La raíz de composición queda fuera de las capas:** `container.ts` y
  `main.ts` en el acomodo por capa; `<módulo>.module.ts` en la raíz de cada
  módulo en el acomodo por módulo.

## Entre módulos

En el acomodo por módulo, la regla de capas se aplica también entre módulos:
la `application` de `guilds` puede importar el `domain` de `characters`, pero
ningún `domain` importa `infrastructure` de nadie. Si dos módulos necesitan lo
mismo, eso sube a `shared`.

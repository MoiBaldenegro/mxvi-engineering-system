---
title: Nombres
---

# Nombres

Los nombres dicen qué es cada pieza y en qué capa vive, sin abrir el archivo.
El código (identificadores, archivos, pruebas) va en **inglés**.

## Archivos y clases

| Pieza | Capa | Patrón | Ejemplo |
|---|---|---|---|
| Modelo | `domain` | Sustantivo en singular | `ShortLink.ts` |
| Reglas | `domain` | `<modelo>Rules`, funciones `is…`, `can…`, `calculate…` | `shortLinkRules.ts` → `isValidTargetUrl` |
| Errores | `domain/errors` | `<Modelo>Errors.ts`; cada clase dice qué pasó | `ShortLinkNotFound`, `InvalidUrl` |
| Puerto | `domain/ports` | Rol para el negocio, sin tecnología | `ShortLinkRepository`, `Clock`, `CodeGenerator` |
| Caso de uso | `application` | Verbo + sustantivo, método `execute` | `CreateShortLink`, `ResolveShortLink` |
| Servicio de aplicación | `application` | `<Área>Service`, métodos con verbo | `ShortLinkService.create` |
| Adaptador de salida | `infrastructure/<tecnología>` | Tecnología + puerto | `JsonFileShortLinkRepository`, `SystemClock` |
| Adaptador de entrada | `presentation/<canal>` | Lo que es en su canal | `shortLinkHttpHandler`, `ShortLinksController` |
| Raíz de composición | fuera de las capas | `container`, `main`, `<módulo>.module` | `container.ts` |
| Prueba | junto al código | `<archivo>.test.ts` | `CreateShortLink.test.ts` |
| Prueba de contrato | `infrastructure` | `<Puerto>.contract.test.ts` | `ShortLinkRepository.contract.test.ts` |
| Dobles de prueba | `test/` | `Fixed…`, `Sequence…`, `InMemory…`, `Failing…` | `FixedClock` |

## Formato

- **Un concepto por archivo**, y el archivo se llama como lo que exporta.
- `PascalCase` para archivos que exportan una clase o un tipo
  (`CreateShortLink.ts`); `camelCase` para los que exportan funciones
  (`shortLinkRules.ts`).
- Las carpetas van en minúsculas: `domain`, `ports`, `memory`.
- Las interfaces no llevan prefijo `I`: el puerto es `Clock` y el adaptador
  `SystemClock`.

## Métodos

| Situación | Patrón | Ejemplo |
|---|---|---|
| Buscar uno que puede no existir | `findBy…` devuelve `T \| null` | `findByCode(code)` |
| Guardar o reemplazar | `save` | `save(link)` |
| Listar | `list…` o `findAll…` | `listByOwner(ownerId)` |
| Borrar | `delete…` | `deleteByCode(code)` |
| Operación de un caso de uso | `execute` | `createShortLink.execute(url)` |
| Regla que responde sí o no | `is…`, `has…`, `can…` | `isValidTargetUrl(url)` |

## Lo que se evita

- Nombres de tecnología en el dominio o la aplicación (`MongoUser`,
  `HttpCharacterService` dentro de `application`).
- Sufijos que no dicen nada: `Manager`, `Helper`, `Util`, `Handler` (salvo que
  el canal lo llame así, como un *handler* HTTP).
- `Impl`: si hay una sola implementación, se nombra por su tecnología igual.
- Abreviaturas (`repo`, `svc`, `mgr`) en nombres de archivos, clases y
  propiedades públicas.

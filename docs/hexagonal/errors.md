---
title: Errores
---

# Errores

Los errores son parte del contrato de un módulo. Se declaran en el dominio, se
lanzan en el dominio y la aplicación, se **traducen** en los bordes.

## El recorrido de un error

```text
tecnología ──▶ adaptador de salida ──▶ caso de uso ──▶ adaptador de entrada ──▶ cliente
 (ENOENT,        traduce a un            lo deja pasar     traduce a su            (404, 503,
  timeout,       error del dominio       o lanza el suyo   protocolo               mensaje)
  500...)
```

## Declararlos

Una clase base por módulo y una clase por situación que alguien necesita
distinguir.

<<< @/../examples/hexagonal-basic/src/domain/errors/ShortLinkErrors.ts

- **La clase base** (`ShortLinkError`) permite atrapar "cualquier error de este
  módulo".
- **Cada error lleva los datos que lo explican** (`url`, `code`) como
  propiedades, no solo dentro del mensaje.
- **El nombre dice qué pasó en términos del negocio:** `ShortLinkNotFound`, no
  `Error404` ni `DatabaseError`.
- Hay tres familias: **entrada inválida** (`InvalidUrl`), **no existe**
  (`ShortLinkNotFound`) y **falla técnica** (`ShortLinkStoreUnavailable`).

## Quién lanza qué

| Lugar | Lanza | Ejemplo |
|---|---|---|
| Caso de uso | Entrada inválida y "no existe" | `throw new InvalidUrl(url)` |
| Adaptador de salida | Falla técnica, traducida | `throw new ShortLinkStoreUnavailable(...)` |
| Puerto | Nada por "no existe": devuelve `null` | `findByCode(): Promise<ShortLink \| null>` |
| Adaptador de entrada | Nada del dominio: solo traduce | `toHttpError(error)` |

## Traducir en la salida

El adaptador atrapa los errores de su tecnología y lanza uno del dominio. El
caso de uso nunca ve un error de `node:fs`, de un cliente HTTP o de un ORM.

```ts
try {
  await writeFile(this.filePath, JSON.stringify(records, null, 2));
} catch (error) {
  throw new ShortLinkStoreUnavailable(describe(error));
}
```

## Traducir en la entrada

Un solo lugar por adaptador de entrada sabe qué significa cada error en su
protocolo:

```ts
function toHttpError(error: unknown): [number, string] {
  if (error instanceof InvalidUrl || error instanceof SyntaxError) {
    return [400, error.message];
  }
  if (error instanceof ShortLinkNotFound) {
    return [404, error.message];
  }
  if (error instanceof ShortLinkStoreUnavailable) {
    return [503, 'The service is temporarily unavailable.'];
  }
  return [500, 'Unexpected error.'];
}
```

- Los errores de entrada inválida y "no existe" pueden mostrar su mensaje.
- Las fallas técnicas y los errores inesperados responden con un mensaje
  genérico: el detalle va al registro, no al cliente.

## Reglas

- Ningún error de una librería cruza hacia `application`.
- `application` y `domain` no conocen códigos de estado ni textos de interfaz.
- No se usan errores para el flujo normal: buscar algo que puede no existir
  devuelve `null`.
- No se atrapa un error para ignorarlo. Si un adaptador decide que una
  situación no es una falla (un archivo que aún no existe), lo documenta en el
  código.

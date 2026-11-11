---
title: Adaptadores
---

# Adaptadores

Un adaptador conecta la aplicación con una tecnología. Hay dos tipos, según
quién llama a quién.

| | Adaptador de entrada | Adaptador de salida |
|---|---|---|
| Capa | `presentation` | `infrastructure` |
| Dirección | El mundo llama a la aplicación | La aplicación llama al mundo |
| Depende de | Casos de uso | Un puerto (lo implementa) |
| Ejemplos | Controlador HTTP, comando CLI, componente de UI, consumidor de una cola | Repositorio, cliente de una API, reloj, generador de ids |

## Adaptadores de salida

Implementan un puerto del dominio con una tecnología concreta.

<<< @/../examples/hexagonal-basic/src/infrastructure/file/JsonFileShortLinkRepository.ts

Lo que este adaptador muestra:

- **Tiene su propio formato de datos** (`ShortLinkRecord`, con `created_at`
  como texto) y dos funciones de traducción, `toRecord` y `toDomain`. El
  formato de almacenamiento nunca sale del adaptador.
- **Traduce las fallas** de su tecnología a un error del dominio
  (`ShortLinkStoreUnavailable`). Ningún error de `node:fs` llega al caso de uso.
- **Distingue "no hay datos" de "falló":** un archivo que no existe es un
  almacén vacío; un archivo corrupto es una falla.

Un puerto puede tener varios adaptadores. El de memoria sirve para pruebas y
para correr la aplicación sin infraestructura:

<<< @/../examples/hexagonal-basic/src/infrastructure/memory/InMemoryShortLinkRepository.ts

Y los puertos pequeños tienen adaptadores pequeños:

<<< @/../examples/hexagonal-basic/src/infrastructure/system/SystemClock.ts

### Reglas de un adaptador de salida

- Implementa **un** puerto (`implements ShortLinkRepository`).
- Se nombra con la tecnología y el puerto: `JsonFileShortLinkRepository`,
  `InMemoryShortLinkRepository`, `SystemClock`.
- Devuelve modelos del dominio; sus tipos internos (registros, DTO, filas) no
  se exportan fuera de su carpeta.
- No contiene reglas de negocio: no decide, solo guarda, lee o llama.
- Devuelve copias, no referencias a su estado interno.

## Adaptadores de entrada

Traducen un protocolo a una llamada de caso de uso, y el resultado o el error
de vuelta al protocolo.

<<< @/../examples/hexagonal-basic/src/presentation/http/shortLinkHttpHandler.ts

Lo que este adaptador muestra:

- **Declara qué casos de uso necesita** (`ShortLinkHttpDependencies`) y los
  recibe ya armados. No conoce repositorios.
- **Extrae y normaliza la entrada** (ruta, cuerpo JSON) y pasa valores simples
  al caso de uso.
- **Es el único que sabe de HTTP:** códigos de estado, cabeceras, formato de
  la respuesta.
- **Traduce errores en un solo lugar** (`toHttpError`). Ver
  [Errores](/hexagonal/errors).

### Reglas de un adaptador de entrada

- Solo llama casos de uso (o servicios de aplicación). Nunca un puerto ni un
  adaptador de salida.
- No contiene reglas de negocio. Validar que el cuerpo sea JSON es suyo;
  validar que la URL sea aceptable es del dominio.
- Decide la forma de la respuesta: qué campos expone y con qué nombres. No
  devuelve el modelo del dominio tal cual si eso expone datos de más.
- Dos adaptadores de entrada distintos (HTTP y CLI, por ejemplo) usan los
  mismos casos de uso sin que estos cambien.

## En un framework

Con un framework web el adaptador de entrada es su controlador, y el de salida
suele envolver su cliente o su ORM. Las reglas no cambian:

- El controlador recibe casos de uso por inyección y solo traduce.
- Los decoradores y tipos del framework se quedan en `presentation` e
  `infrastructure`; no entran a `application` ni a `domain`.
- Las guardas, filtros y middlewares son parte de la entrada: van en
  `presentation` (o `shared/presentation`).

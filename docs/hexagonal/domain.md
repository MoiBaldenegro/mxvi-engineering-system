---
title: Dominio
---

# Dominio

En el nivel 1 el dominio es deliberadamente simple: **datos planos, reglas
como funciones puras, errores y puertos**. No hay entidades con
comportamiento, objetos de valor ni agregados; eso llega en el nivel 2.

## Modelos

Un modelo es una interfaz o tipo con los datos de un concepto del negocio. Sin
métodos, sin decoradores, sin herencia de librerías.

<<< @/../examples/hexagonal-basic/src/domain/ShortLink.ts

- Los nombres de los campos son los del negocio, no los de la base de datos ni
  los de una API (`createdAt`, no `created_at`).
- Los tipos son los del lenguaje: `Date` para fechas, `number` para cantidades.
- Un modelo no sabe cómo se guarda ni cómo se muestra.

## Reglas

Las reglas de negocio que no dependen de nada externo son **funciones puras**
junto al modelo: misma entrada, misma salida, sin leer ni escribir nada.

<<< @/../examples/hexagonal-basic/src/domain/shortLinkRules.ts

Una regla que necesita datos externos (¿existe ya este código?, ¿qué hora es?)
no va aquí: la resuelve el [caso de uso](/hexagonal/application) con un puerto.

## Errores

Cada módulo declara los errores que puede reportar, con una clase base propia.

<<< @/../examples/hexagonal-basic/src/domain/errors/ShortLinkErrors.ts

Los detalles están en [Errores](/hexagonal/errors).

## Puertos

Un puerto es una interfaz que describe **lo que la aplicación necesita** de
algo externo, en términos del dominio.

<<< @/../examples/hexagonal-basic/src/domain/ports/ShortLinkRepository.ts

Los puertos no son solo repositorios. Todo lo que no es determinista o vive
fuera del proceso entra por uno:

<<< @/../examples/hexagonal-basic/src/domain/ports/Clock.ts

<<< @/../examples/hexagonal-basic/src/domain/ports/CodeGenerator.ts

### Reglas de un puerto

- **Habla en modelos del dominio.** Recibe y devuelve `ShortLink`, no filas,
  ni documentos, ni respuestas HTTP.
- **Se nombra por lo que es para el negocio**, no por la tecnología:
  `ShortLinkRepository`, no `ShortLinkPostgresDao`.
- **Tiene solo lo que algún caso de uso usa.** No se añade un método "por si
  acaso".
- **"No existe" no es un error.** Un método de búsqueda devuelve `null`; quien
  decide si eso es un problema es el caso de uso.
- **Las fallas técnicas sí son errores del dominio** (`ShortLinkStoreUnavailable`),
  y el adaptador es quien las traduce.

## Qué no va en el dominio

| No | Dónde va |
|---|---|
| `import` de cualquier paquete o módulo de la plataforma | Detrás de un puerto, en `infrastructure` |
| Validar el formato de una petición HTTP | `presentation` |
| Decidir el orden de los pasos de una operación | `application` |
| Convertir a JSON, a filas o a DTO | El adaptador correspondiente |

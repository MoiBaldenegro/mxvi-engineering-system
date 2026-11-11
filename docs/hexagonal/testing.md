---
title: Pruebas
---

# Pruebas

La arquitectura existe en buena parte para que probar sea barato. Cada capa
tiene su tipo de prueba, y la mayor parte del comportamiento se prueba **sin
red, sin base de datos y sin framework**.

## Primero la prueba

El comportamiento se describe con una prueba antes de escribir el código: se
escribe, se ve fallar por la razón correcta, se implementa y se ve pasar.

## Qué se prueba en cada capa

| Capa | Tipo de prueba | Con qué |
|---|---|---|
| `domain` (reglas) | Unitaria | Entradas y salidas; nada más |
| `application` | Unitaria del caso de uso | Adaptadores en memoria y dobles de los puertos |
| `infrastructure` | Contrato del puerto | La tecnología real del adaptador (un archivo temporal, una base de pruebas) |
| `presentation` | Del adaptador de entrada | El protocolo real (una petición HTTP) contra casos de uso con adaptadores en memoria |

## Casos de uso

Se arman con el adaptador en memoria y dobles deterministas para el reloj y el
generador de códigos.

<<< @/../examples/hexagonal-basic/src/application/CreateShortLink.test.ts

Los dobles compartidos viven en `test/`:

<<< @/../examples/hexagonal-basic/src/test/fakes.ts

- **Dobles, no librerías de mocks.** Un doble es una clase pequeña que
  implementa el puerto. Se lee y se depura como cualquier otra.
- **Se comprueba el resultado y el estado**, no qué métodos se llamaron.
- **Cada camino de error tiene su prueba:** entrada inválida, "no existe".

## Contrato de un puerto

La misma batería de pruebas se ejecuta contra **todos** los adaptadores de un
puerto. Si un adaptador nuevo la pasa, la aplicación funciona con él sin
cambios.

<<< @/../examples/hexagonal-basic/src/infrastructure/ShortLinkRepository.contract.test.ts

Las pruebas propias de un adaptador (aquí, el archivo corrupto) van aparte del
contrato común.

## Adaptadores de entrada

Se prueban por su protocolo: una petición real contra el adaptador, con los
casos de uso armados con adaptadores en memoria.

<<< @/../examples/hexagonal-basic/src/presentation/http/shortLinkHttpHandler.test.ts

Aquí se comprueba la traducción: rutas, formato de la respuesta y qué código
corresponde a cada error. Las reglas de negocio ya se probaron en los casos de
uso y no se repiten.

## Reglas

- Las pruebas van junto al código: `X.ts` y `X.test.ts`.
- Las pruebas de `domain` y `application` no usan red, disco ni hora real.
- Las pruebas pueden importar de cualquier capa (necesitan armar el sistema);
  el [verificador de capas](/tools/check-layers) las ignora.
- Una prueba describe un comportamiento con una frase: `reports an unknown
  code as not found`.
- Nada se da por terminado con pruebas en rojo.

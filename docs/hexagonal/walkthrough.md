---
title: Ejemplo guiado
---

# Ejemplo guiado

El proyecto de referencia es un **acortador de enlaces**: crea un código corto
para una URL y redirige a quien lo visita, contando las visitas. Está en
`examples/hexagonal-basic/` y cumple el nivel 1 completo.

Este recorrido construye la operación "crear un enlace corto" en el orden en
que conviene hacerlo: **de adentro hacia afuera**.

## 0. La intención

> Dada una URL http(s), quiero un código corto que redirija a ella.
> Si la URL no es válida, quiero saberlo.

## 1. El modelo y sus reglas

Primero los datos del concepto y la regla que no depende de nada externo.

<<< @/../examples/hexagonal-basic/src/domain/ShortLink.ts

<<< @/../examples/hexagonal-basic/src/domain/shortLinkRules.ts

## 2. Los errores

Lo que puede salir mal, con nombre propio.

<<< @/../examples/hexagonal-basic/src/domain/errors/ShortLinkErrors.ts

## 3. Los puertos

¿Qué necesita la operación del mundo exterior? Guardar el enlace, un código
nuevo y la hora. Tres puertos.

<<< @/../examples/hexagonal-basic/src/domain/ports/ShortLinkRepository.ts

<<< @/../examples/hexagonal-basic/src/domain/ports/CodeGenerator.ts

<<< @/../examples/hexagonal-basic/src/domain/ports/Clock.ts

## 4. La prueba del caso de uso

Antes del código: qué debe pasar con una URL válida y con una inválida. Se usa
el adaptador en memoria y dobles deterministas.

<<< @/../examples/hexagonal-basic/src/application/CreateShortLink.test.ts

## 5. El caso de uso

Lo mínimo para que la prueba pase.

<<< @/../examples/hexagonal-basic/src/application/CreateShortLink.ts

En este punto la operación **ya funciona y está probada**, sin HTTP, sin
archivos y sin framework.

## 6. Los adaptadores de salida

Una implementación real por puerto. La de archivo traduce su formato y sus
fallas:

<<< @/../examples/hexagonal-basic/src/infrastructure/file/JsonFileShortLinkRepository.ts

Y la prueba de contrato garantiza que se comporta igual que la de memoria:

<<< @/../examples/hexagonal-basic/src/infrastructure/ShortLinkRepository.contract.test.ts

## 7. El adaptador de entrada

HTTP hacia adentro, errores del dominio hacia HTTP.

<<< @/../examples/hexagonal-basic/src/presentation/http/shortLinkHttpHandler.ts

## 8. La raíz de composición

Se elige el adaptador de cada puerto y se arranca.

<<< @/../examples/hexagonal-basic/src/container.ts

<<< @/../examples/hexagonal-basic/src/main.ts

## 9. Verificar

```bash
npm run examples:typecheck   # compila
npm run examples:test        # pruebas del ejemplo
npm run examples:layers      # regla de dependencias
```

## Probarlo a mano

```bash
node --import tsx examples/hexagonal-basic/src/main.ts

curl -X POST localhost:3000/links -d '{"url":"https://example.com/docs"}'
# {"code":"q3ZkP1","url":"https://example.com/docs"}

curl -i localhost:3000/q3ZkP1
# HTTP/1.1 302 Found
# Location: https://example.com/docs
```

Con `DATA_FILE=links.json` los enlaces se guardan en ese archivo; sin la
variable, en memoria. Ese cambio ocurre solo en la raíz de composición.

## El orden, resumido

1. Modelo y reglas puras.
2. Errores.
3. Puertos.
4. Prueba del caso de uso.
5. Caso de uso.
6. Adaptadores de salida y su prueba de contrato.
7. Adaptador de entrada y su prueba.
8. Raíz de composición.
9. Verificar capas.

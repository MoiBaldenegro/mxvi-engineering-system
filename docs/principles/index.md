---
title: Principios
---

# Principios

El MXVI Engineering System define **cómo se construye** un producto del
ecosistema MXVI: su arquitectura, la estructura de carpetas, las convenciones de
código y las pruebas. Es el hermano del
[MXVI Design System](https://moibaldenegro.github.io/mxvi-design-system/), que
define cómo se ve.

## La idea

**Una forma de construir. Varios niveles.** No todas las aplicaciones necesitan
la misma arquitectura. En lugar de un único estándar pesado, hay
[niveles](/levels/) que van de menos a más: cada uno es una arquitectura
completa y el siguiente le añade herramientas sin contradecirlo.

## Principios no negociables

Valen para todos los niveles.

1. **Las dependencias apuntan hacia adentro.** El dominio no conoce a nadie; la
   aplicación conoce al dominio; la infraestructura y la presentación conocen a
   ambos. Nunca al revés.
2. **El dominio y la aplicación no importan frameworks.** Ni librerías HTTP, ni
   ORM, ni el framework web. Se pueden ejecutar y probar con el lenguaje solo.
3. **Todo lo externo entra por un puerto.** Base de datos, APIs, reloj, azar,
   sistema de archivos: la aplicación los ve como interfaces escritas en
   términos del dominio.
4. **Un solo lugar arma el sistema.** La raíz de composición decide qué
   adaptador implementa cada puerto. Cambiar de base de datos se hace ahí.
5. **Los errores son parte del diseño.** Cada módulo declara los errores que
   puede reportar. Los adaptadores traducen las fallas externas a esos errores
   y la entrada los traduce a su protocolo.
6. **Primero la prueba.** El comportamiento se describe con una prueba antes de
   escribir el código, y la aplicación se prueba sin red ni base de datos.
7. **El nivel más bajo que resuelva el problema.** La complejidad se añade
   cuando la aplicación la pide, no por adelantado.

## Referencia viva

Cada nivel tiene un **proyecto de referencia** en este repositorio
(`examples/`). No es un ejemplo decorativo:

- El código que muestra la documentación se incluye directamente desde esos
  archivos, así que no puede quedar desactualizado.
- En cada cambio se compila, se ejecutan sus pruebas y se revisa su regla de
  dependencias con el [verificador de capas](/tools/check-layers).

Si la documentación y el código de referencia se contradicen, manda el código
y se corrige la documentación.

## Cómo está organizado

| Sección | Qué responde |
|---|---|
| [Principios](/principles/) | Qué vale siempre, en cualquier nivel. |
| [Niveles](/levels/) | Qué arquitecturas hay y cuál elegir. |
| [Nivel 1 · Hexagonal básico](/hexagonal/) | Cómo se construye con ese nivel, pieza por pieza. |
| [Verificador de capas](/tools/check-layers) | Cómo comprobar la regla de dependencias. |
| [Recursos de IA](/ai/) | Cómo darle estas reglas a un agente. |

## Lenguaje

Los ejemplos están en **TypeScript** porque es el lenguaje de los productos
actuales, pero las reglas no dependen de él: capas, puertos, adaptadores y
raíz de composición se aplican igual en cualquier lenguaje con interfaces o
algo equivalente.

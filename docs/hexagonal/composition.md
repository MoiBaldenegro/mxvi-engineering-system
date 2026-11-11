---
title: Raíz de composición
---

# Raíz de composición

La raíz de composición es **el único lugar que conoce todas las piezas**: crea
los adaptadores, se los pasa a los casos de uso y entrega estos a la entrada.
Vive fuera de las cuatro capas.

<<< @/../examples/hexagonal-basic/src/container.ts

Y el punto de entrada lee la configuración, pide el grafo armado y arranca:

<<< @/../examples/hexagonal-basic/src/main.ts

## Reglas

- **Es el único lugar con `new` de adaptadores.** Si un caso de uso o un
  controlador crea un adaptador, la regla de dependencias ya se rompió.
- **Los casos de uso se tipan contra el puerto**, y aquí se decide la clase
  concreta (`const repository: ShortLinkRepository = ...`).
- **La configuración entra por aquí** (variables de entorno, archivos) y llega
  a los adaptadores como parámetros. Los casos de uso no leen el entorno.
- **Expone los casos de uso con un tipo** (`UseCases`) para que la entrada y
  las pruebas reciban exactamente lo mismo.
- **No tiene lógica de negocio.** Solo decide qué implementación va en cada
  puerto.

## Qué se gana

- Cambiar de almacenamiento es cambiar una línea aquí.
- Las pruebas arman su propio grafo con adaptadores en memoria usando la misma
  función o una equivalente.
- Leer este archivo dice de qué depende el sistema en producción.

## Con un contenedor de inyección

Si el framework trae su propio contenedor, **el módulo del framework es la
raíz de composición**. Las reglas son las mismas:

- El módulo vive en la raíz del módulo de negocio (`characters.module.ts`),
  fuera de las capas, porque importa de todas.
- Los casos de uso siguen siendo clases normales, sin decoradores del
  framework. El módulo los registra con una fábrica que les pasa sus puertos.
- Cada puerto se registra con un token y la clase del adaptador que lo
  implementa.

## En un frontend

La raíz de composición es la función que crea los casos de uso
(`createUseCases`) y el punto donde se entregan a la interfaz, normalmente un
proveedor de contexto montado en el arranque. Los componentes piden casos de
uso al proveedor; no importan el contenedor ni los adaptadores.

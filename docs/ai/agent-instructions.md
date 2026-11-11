---
title: Instrucciones para agentes
---

# MXVI Engineering System — instrucciones para agentes

Estas reglas definen cómo se escribe código en un proyecto que sigue el MXVI
Engineering System. Trátalas como el contrato de arquitectura del proyecto.

## Antes de escribir código

1. **Identifica el nivel del proyecto.** Lo dice su `AGENTS.md` o `README`. Si
   no lo dice, pregunta; no lo supongas. Hoy solo existe el **nivel 1 ·
   hexagonal básico**.
2. **Identifica la variante de aplicación** que usa el proyecto: casos de uso
   (una clase con `execute` por operación) o servicios de aplicación. Mira la
   carpeta `application/` y sigue lo que ya hay.
3. **Identifica el acomodo de carpetas:** por capa (`src/domain/...`) o por
   módulo (`src/<módulo>/domain/...`). No los mezcles.
4. Lee la página del nivel que corresponde a tu tarea (ver
   [Estrategia de contexto](/ai/context-strategy)).

## Reglas no negociables (nivel 1)

1. Cuatro capas: `domain`, `application`, `infrastructure`, `presentation`.
2. `domain` solo importa `domain`. `application` solo importa `domain` y
   `application`. Ninguna importa paquetes ni módulos de la plataforma.
3. `infrastructure` y `presentation` importan hacia adentro y nunca entre sí.
4. Todo lo externo (datos, APIs, hora, azar, archivos, entorno) entra por un
   puerto en `domain/ports/`, implementado en `infrastructure/`.
5. `presentation` solo llama casos de uso. Nunca un repositorio ni un
   adaptador.
6. Solo la raíz de composición (`container`, `main` o el módulo del framework)
   crea adaptadores.
7. Los adaptadores de salida traducen las fallas de su tecnología a errores
   del dominio. Los de entrada traducen los errores del dominio a su protocolo,
   en un solo lugar.
8. Buscar algo que puede no existir devuelve `null`; el caso de uso decide si
   es un error.

## No hagas esto

- No añadas piezas de niveles superiores: agregados, objetos de valor,
  servicios de dominio, comandos, consultas, buses ni eventos. En el nivel 1
  el dominio es datos planos, funciones puras, errores y puertos.
- No pongas decoradores ni tipos del framework en `domain` o `application`.
- No uses `new Date()`, `Math.random()`, `crypto` ni variables de entorno en
  `domain` o `application`.
- No llames a un caso de uso desde otro.
- No añadas métodos a un puerto que ningún caso de uso usa.
- No devuelvas tipos de la base de datos, del ORM o de una API desde un
  puerto.
- No inventes contenido de los niveles 2 y 3: todavía no están definidos.

## Orden de trabajo

De adentro hacia afuera, con la prueba primero:

1. Modelo y reglas puras del dominio.
2. Errores.
3. Puertos.
4. Prueba del caso de uso (verla fallar).
5. Caso de uso.
6. Adaptadores de salida y su prueba de contrato.
7. Adaptador de entrada y su prueba.
8. Registro en la raíz de composición.
9. Verificación.

## Pruebas

- Casos de uso: con adaptadores en memoria y dobles escritos a mano
  (`FixedClock`, `InMemory…`), sin librerías de mocks, sin red ni disco.
- Adaptadores de salida: la misma prueba de contrato para todos los
  adaptadores de un puerto.
- Adaptadores de entrada: por su protocolo real, con casos de uso armados en
  memoria.
- Las pruebas van junto al código (`X.test.ts`).

## Nombres

Código en inglés. Casos de uso `VerboSustantivo` con `execute`; puertos por su
rol (`ShortLinkRepository`, `Clock`); adaptadores con tecnología + puerto
(`JsonFileShortLinkRepository`); errores por lo que pasó (`ShortLinkNotFound`).
Detalle en [Nombres](/hexagonal/naming).

## Verificación

Antes de terminar:

1. Compila y pasa todas las pruebas del proyecto.
2. Ejecuta el verificador de capas: `node check-layers.mjs src` (o el comando
   que el proyecto defina). Debe terminar sin violaciones.
3. Repasa la [checklist](/hexagonal/checklist).

## Qué reportar

Al terminar, indica:

- nivel y variante de aplicación;
- casos de uso añadidos o cambiados;
- puertos y adaptadores nuevos;
- pruebas añadidas;
- resultado de las pruebas y del verificador de capas;
- cualquier desviación de estas reglas y por qué.

Si la tarea no se puede hacer sin romper una regla, detente y explícalo en
lugar de romperla.

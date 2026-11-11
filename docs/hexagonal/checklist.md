---
title: Checklist
---

# Checklist

Antes de dar por terminada una funcionalidad en el nivel 1.

## Capas

- [ ] `domain` no importa nada fuera de `domain`, ni paquetes.
- [ ] `application` solo importa `domain` y `application`, sin paquetes.
- [ ] `presentation` no importa `infrastructure`, ni al revés.
- [ ] `node check-layers.mjs src` termina sin violaciones.

## Dominio

- [ ] Los modelos son datos planos con nombres del negocio.
- [ ] Las reglas sin dependencias externas son funciones puras.
- [ ] Cada situación de error que alguien distingue tiene su clase.
- [ ] Cada puerto habla en modelos del dominio y solo tiene métodos en uso.

## Aplicación

- [ ] Cada operación es un caso de uso con un `execute` (o un método de un
      servicio de aplicación, si el proyecto eligió esa variante).
- [ ] Recibe datos simples y puertos por constructor; no objetos del framework.
- [ ] No usa `new Date()`, azar ni lectura del entorno: lo pide por un puerto.
- [ ] Reporta problemas con errores del dominio.

## Adaptadores

- [ ] Cada adaptador de salida implementa un puerto y traduce su formato.
- [ ] Las fallas de la tecnología se traducen a errores del dominio.
- [ ] Los adaptadores de entrada solo llaman casos de uso.
- [ ] La traducción de errores al protocolo está en un solo lugar por
      adaptador de entrada.

## Composición

- [ ] Solo la raíz de composición crea adaptadores.
- [ ] La configuración entra por la raíz de composición.

## Pruebas

- [ ] La prueba se escribió antes y se vio fallar.
- [ ] Cada caso de uso tiene pruebas del camino normal y de cada error.
- [ ] Cada adaptador de salida pasa la prueba de contrato de su puerto.
- [ ] Cada adaptador de entrada tiene una prueba por su protocolo.
- [ ] Todas las pruebas pasan.

## Nombres

- [ ] Archivos, clases y métodos siguen [Nombres](/hexagonal/naming).
- [ ] No hay nombres de tecnología en `domain` ni en `application`.

## Para reportar

Al terminar, indica: el nivel (1) y la variante de aplicación, los casos de
uso añadidos o cambiados, los puertos y adaptadores nuevos, las pruebas
añadidas y el resultado del verificador de capas.

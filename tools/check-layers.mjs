#!/usr/bin/env node
// MXVI Engineering System — verificador de capas (nivel 1: hexagonal básico).
//
// Comprueba la regla de dependencias leyendo los import de cada archivo:
//
//   domain          solo importa domain                       (sin paquetes)
//   application     importa domain y application              (sin paquetes)
//   infrastructure  importa domain, application e infrastructure
//   presentation    importa domain, application y presentation
//
// infrastructure y presentation también pueden importar archivos que no están
// en ninguna capa (configuración, tokens de inyección); domain y application no.
//
// La capa de un archivo es la primera carpeta de su ruta que se llame como una
// capa: sirve para src/domain/... y para src/<módulo>/domain/... Los archivos
// fuera de las capas (main.ts, container.ts, la raíz de composición) y los
// tests (*.test.*, *.spec.*, carpetas test/ y __tests__/) no se revisan.
//
// Uso:   node check-layers.mjs [carpeta ...]      (por defecto: src)
// Sale con código 1 si encuentra alguna violación. Sin dependencias: Node >= 18.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LAYERS = ['domain', 'application', 'infrastructure', 'presentation'];

/** Capas que cada capa puede importar. */
export const ALLOWED = {
  domain: ['domain'],
  application: ['domain', 'application'],
  infrastructure: ['domain', 'application', 'infrastructure'],
  presentation: ['domain', 'application', 'presentation'],
};

/** Capas que no pueden importar paquetes ni módulos de la plataforma. */
export const PURE_LAYERS = ['domain', 'application'];

const SOURCE = /\.(?:[cm]?[jt]sx?)$/;
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$/;
const TEST_DIRS = new Set(['test', 'tests', '__tests__', '__mocks__']);
const IMPORT =
  /(?:^|[\s;])(?:import|export)\s+(?:type\s+)?(?:[^'"`;]*?\sfrom\s+)?['"]([^'"]+)['"]|(?:import|require)\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Capa de una ruta relativa a la raíz revisada, o null si no está en ninguna. */
export function layerOf(relativePath) {
  const segments = relativePath.split(/[\\/]/);
  if (segments.some((segment) => TEST_DIRS.has(segment))) return null;
  return segments.slice(0, -1).find((segment) => LAYERS.includes(segment)) ?? null;
}

/** Imports de un archivo fuente: [{ specifier, line }]. Ignora los comentarios. */
export function importsOf(source) {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`])\/\/[^\n]*/g, (comment, prefix) => prefix + ' '.repeat(comment.length - prefix.length));
  const found = [];
  for (const match of code.matchAll(IMPORT)) {
    const specifier = match[1] ?? match[2];
    const line = code.slice(0, match.index + match[0].indexOf(specifier)).split('\n').length;
    found.push({ specifier, line });
  }
  return found;
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name === 'node_modules' || name.startsWith('.')) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : SOURCE.test(name) ? [path] : [];
  });
}

/** Revisa una carpeta y devuelve sus violaciones. */
export function checkLayers(rootDir) {
  const root = resolve(rootDir);
  const violations = [];

  for (const file of walk(root)) {
    const path = relative(root, file);
    const layer = layerOf(path);
    if (layer === null || TEST_FILE.test(file)) continue;

    for (const { specifier, line } of importsOf(readFileSync(file, 'utf8'))) {
      const where = `${join(rootDir, path).split(sep).join('/')}:${line}`;

      if (!specifier.startsWith('.')) {
        if (PURE_LAYERS.includes(layer)) {
          violations.push(`${where}  ${layer} no puede importar el paquete "${specifier}"`);
        }
        continue;
      }

      const target = relative(root, resolve(dirname(file), specifier));
      if (target.startsWith('..')) continue; // fuera de la carpeta revisada
      const targetLayer = layerOf(`${target}/x`) ?? layerOf(target);

      if (targetLayer === null) {
        if (PURE_LAYERS.includes(layer)) {
          violations.push(`${where}  ${layer} no puede importar "${specifier}" (fuera de las capas)`);
        }
      } else if (!ALLOWED[layer].includes(targetLayer)) {
        violations.push(`${where}  ${layer} no puede importar ${targetLayer} ("${specifier}")`);
      }
    }
  }

  return violations;
}

function main(argv) {
  const roots = argv.length ? argv : ['src'];
  const violations = roots.flatMap((root) => checkLayers(root));

  if (violations.length) {
    console.error(`Capas ✘ ${violations.length} violación(es) de la regla de dependencias:\n`);
    for (const violation of violations) console.error(`  ${violation}`);
    console.error('\ndomain → nada · application → domain · infrastructure y presentation → hacia adentro.');
    process.exit(1);
  }

  console.log(`Capas ✔ ${roots.join(', ')} cumple la regla de dependencias.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}

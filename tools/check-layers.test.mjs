import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { checkLayers, importsOf, layerOf } from './check-layers.mjs';

function project(files) {
  const root = mkdtempSync(join(tmpdir(), 'layers-'));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

test('layerOf finds the layer by layer and by module layouts', () => {
  assert.equal(layerOf('domain/ports/Clock.ts'), 'domain');
  assert.equal(layerOf('characters/infrastructure/http/Adapter.ts'), 'infrastructure');
  assert.equal(layerOf('container.ts'), null);
  assert.equal(layerOf('test/fakes.ts'), null);
});

test('importsOf reads static, type, re-export and dynamic imports, not comments', () => {
  const source = [
    "import a from './a.ts';",
    "import type { B } from '../b';",
    "export { c } from './c';",
    "// import fake from './comment';",
    "const d = await import('./d.js');",
    "/* import other from './block'; */",
  ].join('\n');

  assert.deepEqual(
    importsOf(source).map((item) => [item.specifier, item.line]),
    [['./a.ts', 1], ['../b', 2], ['./c', 3], ['./d.js', 5]],
  );
});

test('accepts a project that follows the dependency rule', () => {
  const root = project({
    'domain/Thing.ts': 'export interface Thing { id: string }',
    'domain/ports/Things.ts': "import type { Thing } from '../Thing.ts';\nexport interface Things { all(): Thing[] }",
    'application/ListThings.ts': "import type { Things } from '../domain/ports/Things.ts';\nexport const run = (t: Things) => t.all();",
    'infrastructure/MemoryThings.ts': "import { readFileSync } from 'node:fs';\nimport type { Things } from '../domain/ports/Things.ts';\nimport '../config/env.ts';",
    'config/env.ts': 'export const env = {};',
    'presentation/cli.ts': "import { run } from '../application/ListThings.ts';",
    'container.ts': "import './infrastructure/MemoryThings.ts';\nimport './presentation/cli.ts';",
    'application/ListThings.test.ts': "import '../infrastructure/MemoryThings.ts';",
  });

  assert.deepEqual(checkLayers(root), []);
});

test('reports every kind of violation with file and line', () => {
  const root = project({
    'domain/Thing.ts': "import { z } from 'zod';\nimport '../application/ListThings.ts';",
    'application/ListThings.ts': "import '../infrastructure/MemoryThings.ts';\nimport axios from 'axios';",
    'infrastructure/MemoryThings.ts': "import '../presentation/cli.ts';",
    'presentation/cli.ts': "import '../infrastructure/MemoryThings.ts';",
    'orders/domain/Order.ts': "import '../../container.ts';",
    'container.ts': '',
  });

  const violations = checkLayers(root).map((line) => line.slice(line.indexOf('  ') + 2)).sort();

  assert.deepEqual(violations, [
    'application no puede importar el paquete "axios"',
    'application no puede importar infrastructure ("../infrastructure/MemoryThings.ts")',
    'domain no puede importar "../../container.ts" (fuera de las capas)',
    'domain no puede importar application ("../application/ListThings.ts")',
    'domain no puede importar el paquete "zod"',
    'infrastructure no puede importar presentation ("../presentation/cli.ts")',
    'presentation no puede importar infrastructure ("../infrastructure/MemoryThings.ts")',
  ]);
});

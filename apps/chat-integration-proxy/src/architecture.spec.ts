// Architecture boundary guards for the whole app (design.md "Allowed Dependencies" /
// "依存の向き"). This file deliberately lives at the top of `src/` rather than inside one
// layer's directory: it spans every layer, and burying it in one of them would suggest it
// only guards that layer.
//
// Two independent guards, because one does not imply the other:
//   1. layer order   — a file may only import its own layer or a layer to its LEFT.
//   2. Chat SDK origin — `chat` / `@chat-adapter/*` / `chat-adapter-mattermost` may only be
//      imported from `src/platform/**`. The Chat SDK is not a layer, so a file that is
//      perfectly layer-order-correct (e.g. `orchestration/`, near the right end of the
//      chain) can still import it directly without breaking guard 1.
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC_DIR = resolve(dirname(fileURLToPath(import.meta.url)));

/**
 * design.md: 「**依存の向き**（左のものだけを import してよい）:
 * types → capabilities → db → platform → command → relation → growi → orchestration → routes」
 *
 * A file may import from its own layer (barrels re-export their siblings) or from any layer
 * to its left. `types/` being reachable from everywhere is a consequence of it being the
 * leftmost entry, not a separate exemption.
 */
const LAYER_ORDER = [
  'types',
  'capabilities',
  'db',
  'platform',
  'command',
  'relation',
  'growi',
  'orchestration',
  'routes',
] as const;

type Layer = (typeof LAYER_ORDER)[number];

/**
 * Directories under `src/` that are not part of the ordered chain.
 * - `runtime/`: design.md 「`runtime/` は最も外側。上のどこからも import されない」 — it may
 *   import anything, and nothing in the chain may import it.
 * - `generated/`: Prisma's generated client output, not hand-written source.
 */
const OUTERMOST_DIR = 'runtime';
const EXCLUDED_DIRS = ['generated'];

/** A file that belongs to no layer: `src/*.ts` and `src/runtime/**`. Same rules as runtime. */
const OUTERMOST = 'outermost';

const listSourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      return EXCLUDED_DIRS.includes(relative(SRC_DIR, full))
        ? []
        : listSourceFiles(full);
    }
    return entry.isFile() && entry.name.endsWith('.ts') ? [full] : [];
  });

const layerOf = (absolutePath: string): Layer | typeof OUTERMOST => {
  // A specifier may name the layer directory itself (`from '../types'`), so the layer name
  // counts whether or not a path segment follows it. Anything else under src/ — a file
  // directly in src/, or runtime/ — is outside the ordered chain.
  const head = relative(SRC_DIR, absolutePath).split(sep)[0];
  return (LAYER_ORDER as readonly string[]).includes(head)
    ? (head as Layer)
    : OUTERMOST;
};

/**
 * Import specifiers of a file: `import`/`export ... from '…'`, side-effect `import '…'`, and
 * dynamic `import('…')`.
 *
 * The first two patterns are anchored to the start of a line AND forbid matching across a
 * newline (`[^'"\n]*` instead of `[^'"]*`): a line that opens with `import`/`export`/`}` can
 * only be turned into a match by a `from '...'` clause on THAT SAME line, never by text found
 * later in the file (e.g. inside a following comment or doc block). This matches the import
 * style used throughout this app; it is not a general TypeScript parser. One known gap this
 * accepts: a multi-line `import { ... } from '...'` whose closing `}` and `from '...'` end up
 * on different lines would no longer be matched — but `pnpm exec biome check` reformats such
 * an import onto a single closing line in this codebase, so no legal source file here can take
 * that shape.
 */
const STATEMENT_PATTERNS = [
  /^\s*(?:import|export)\b[^'"\n]*\bfrom\s*['"]([^'"]+)['"]/gm,
  /^\s*\}[^'"\n]*\bfrom\s*['"]([^'"]+)['"]/gm, // closing line of a multi-line import/export
  /^\s*import\s*['"]([^'"]+)['"]/gm, // side-effect import
  /\bimport\(\s*['"`]([^'"`]+)['"`]\s*\)/g, // dynamic import (quote, double-quote, or backtick)
];

const importSpecifiersOf = (absolutePath: string): string[] => {
  const source = readFileSync(absolutePath, 'utf8');
  // Deduplicated: a multi-line statement matches both the opening and the closing pattern,
  // and one specifier reported twice only makes a failure harder to read.
  return [
    ...new Set(
      STATEMENT_PATTERNS.flatMap((pattern) =>
        [...source.matchAll(pattern)].map(([, specifier]) => specifier),
      ),
    ),
  ];
};

const toDisplayPath = (absolutePath: string): string =>
  `src/${relative(SRC_DIR, absolutePath).split(sep).join('/')}`;

const SOURCE_FILES = listSourceFiles(SRC_DIR);

/**
 * Writes `source` to a throwaway `.ts` file OUTSIDE `src/` and returns its absolute path, so
 * `importSpecifiersOf()` can be exercised on a real file without the fixture's own literal text
 * being picked up by the `src/` walk (`SOURCE_FILES`) that the layer-order and Chat SDK tests
 * below rely on.
 */
const writeFixture = (source: string): string => {
  const dir = mkdtempSync(join(tmpdir(), 'chat-proxy-architecture-'));
  const path = join(dir, 'fixture.ts');
  writeFileSync(path, source);
  return path;
};

describe('importSpecifiersOf: what must NOT be flagged', () => {
  // Both of these are real, biome-clean shapes: an `export`/`import` statement followed on a
  // LATER line by unrelated text that happens to contain `from '...'`. Before the STATEMENT_PATTERNS
  // fix, `[^'"]*` matched across the newline and misread the comment as the statement's own
  // `from` clause.
  it("does not read a comment on the line after an export as that export's import source", () => {
    const fixture = writeFixture(
      `export const a = 1;\n// moved from '../routes/old.js'\n`,
    );

    expect(importSpecifiersOf(fixture)).not.toContain('../routes/old.js');
  });

  it('does not read a doc comment after an export as a Chat SDK import', () => {
    const fixture = writeFixture(
      `export const X = 1;\n/** Re-exported from 'chat' for convenience. */\n`,
    );

    expect(importSpecifiersOf(fixture)).not.toContain('chat');
  });
});

describe('importSpecifiersOf: what MUST be flagged', () => {
  it('recognizes a backtick-quoted dynamic import', () => {
    // Built via concatenation, not a literal `import(\`...\`)` substring: the dynamic-import
    // pattern is intentionally NOT line-anchored (it must catch a call anywhere on a line), so
    // a literal occurrence of that text in THIS file would be picked up by the very check this
    // fixture exercises (this file is itself walked as part of src/).
    const DYNAMIC_IMPORT_CALL = 'import';
    const fixture = writeFixture(
      `export const load = () => ${DYNAMIC_IMPORT_CALL}(\`chat\`);\n`,
    );

    expect(importSpecifiersOf(fixture)).toContain('chat');
  });
});

describe('layer order', () => {
  it('has at least the currently implemented layers to check', () => {
    // Guards against the walker silently finding nothing (a broken glob would make every
    // assertion below vacuously pass).
    expect(SOURCE_FILES.length).toBeGreaterThan(0);
    expect(new Set(SOURCE_FILES.map(layerOf))).toContain('types');
  });

  it('every directory under src/ is a declared layer, runtime/, or generated/', () => {
    // Without this, a new top-level directory would fall through to OUTERMOST and escape
    // the layer-order guard entirely.
    const known = [...LAYER_ORDER, OUTERMOST_DIR, ...EXCLUDED_DIRS];
    const unknown = readdirSync(SRC_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !known.includes(entry.name))
      .map((entry) => entry.name);

    expect(unknown).toEqual([]);
  });

  it('never imports a layer to the right of its own, nor runtime/', () => {
    const violations = SOURCE_FILES.flatMap((file) => {
      const importerLayer = layerOf(file);
      if (importerLayer === OUTERMOST) return []; // runtime/ and src/*.ts may import anything

      return importSpecifiersOf(file)
        .filter((specifier) => specifier.startsWith('.'))
        .flatMap((specifier) => {
          const resolved = resolve(dirname(file), specifier);
          if (relative(SRC_DIR, resolved).startsWith('..')) return []; // outside src/
          const importedLayer = layerOf(resolved);
          const allowed =
            importedLayer !== OUTERMOST &&
            LAYER_ORDER.indexOf(importedLayer) <=
              LAYER_ORDER.indexOf(importerLayer);
          return allowed
            ? []
            : [
                `${toDisplayPath(file)} (${importerLayer}) imports '${specifier}' (${importedLayer})`,
              ];
        });
    });

    expect(violations).toEqual([]);
  });
});

describe('Chat SDK import origin', () => {
  /**
   * design.md Allowed Dependencies: these may be used from `src/platform/**` only.
   * `@growi/chat` is explicitly allowed from every layer and is NOT part of this list.
   */
  const RESTRICTED_PACKAGES = [
    'chat',
    '@chat-adapter/slack',
    '@chat-adapter/discord',
    '@chat-adapter/teams',
    '@chat-adapter/state-pg',
    'chat-adapter-mattermost',
  ];
  const PLATFORM_DIR = `platform${sep}`;

  const isRestricted = (specifier: string): boolean =>
    // `@chat-adapter/*` is matched by prefix so that a newly added adapter is restricted
    // without editing this list.
    specifier.startsWith('@chat-adapter/') ||
    RESTRICTED_PACKAGES.some(
      (pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`),
    );

  it('is imported from src/platform/** only', () => {
    const violations = SOURCE_FILES.filter(
      (file) => !relative(SRC_DIR, file).startsWith(PLATFORM_DIR),
    ).flatMap((file) =>
      importSpecifiersOf(file)
        .filter(isRestricted)
        .map((specifier) => `${toDisplayPath(file)} imports '${specifier}'`),
    );

    expect(violations).toEqual([]);
  });

  it('does not restrict @growi/chat', () => {
    expect(isRestricted('@growi/chat')).toBe(false);
    expect(isRestricted('@growi/chat/dist/interfaces')).toBe(false);
  });
});

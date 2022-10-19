/**
 * @typedef {import('mdast').Root} Root
 */

import fs from 'node:fs';
import path from 'node:path';

import { isHidden } from 'is-hidden';
import { remark } from 'remark';
import test from 'tape';
import { readSync } from 'to-vfile';
import { unified } from 'unified';

import { remarkGrowiPlugin } from '../src/remark-growi-plugin.js';

test('directive()', (t) => {
  t.doesNotThrow(() => {
    remark().use(remarkGrowiPlugin).freeze();
  }, 'should not throw if not passed options');

  t.doesNotThrow(() => {
    unified().use(remarkGrowiPlugin).freeze();
  }, 'should not throw if without parser or compiler');

  t.end();
});

test('fixtures', (t) => {
  const base = path.join('test', 'fixtures');
  const entries = fs.readdirSync(base).filter(d => !isHidden(d));

  t.plan(entries.length);

  let index = -1;
  while (++index < entries.length) {
    const fixture = entries[index];
    t.test(fixture, (st) => {
      const file = readSync(path.join(base, fixture, 'input.md'));
      const input = String(file);
      const outputPath = path.join(base, fixture, 'output.md');
      const treePath = path.join(base, fixture, 'tree.json');
      const proc = remark().use(remarkGrowiPlugin).freeze();
      const actual = proc.parse(file);
      /** @type {string} */
      let output;
      /** @type {Root} */
      let expected;

      try {
        expected = JSON.parse(String(fs.readFileSync(treePath)));
      }
      catch {
        // New fixture.
        fs.writeFileSync(treePath, `${JSON.stringify(actual, null, 2)}\n`);
        expected = actual;
      }

      try {
        output = fs.readFileSync(outputPath, 'utf8');
      }
      catch {
        output = input;
      }

      st.deepEqual(actual, expected, 'tree');
      st.equal(String(proc.processSync(file)), output, 'process');

      st.end();
    });
  }
});

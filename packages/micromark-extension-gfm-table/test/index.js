import {URL} from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import test from 'tape'
import {micromark} from 'micromark'
import {createGfmFixtures} from 'create-gfm-fixtures'
import {gfmTable as syntax, gfmTableHtml as html} from '../dev/index.js'

test('markdown -> html (micromark)', (t) => {
  t.deepEqual(
    micromark('| a |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p>| a |</p>',
    'should not support a table w/ the head row ending in an eof (1)'
  )

  t.deepEqual(
    micromark('| a', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p>| a</p>',
    'should not support a table w/ the head row ending in an eof (2)'
  )

  t.deepEqual(
    micromark('a |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p>a |</p>',
    'should not support a table w/ the head row ending in an eof (3)'
  )

  t.deepEqual(
    micromark('| a |\n| - |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support a table w/ a delimiter row ending in an eof (1)'
  )

  t.deepEqual(
    micromark('| a\n| -', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support a table w/ a delimiter row ending in an eof (2)'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n| b |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support a table w/ a body row ending in an eof (1)'
  )

  t.deepEqual(
    micromark('| a\n| -\n| b', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support a table w/ a body row ending in an eof (2)'
  )

  t.deepEqual(
    micromark('a|b\n-|-\nc|d', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>c</td>\n<td>d</td>\n</tr>\n</tbody>\n</table>',
    'should support a table w/ a body row ending in an eof (3)'
  )

  t.deepEqual(
    micromark('| a  \n| -\t\n| b |     ', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support rows w/ trailing whitespace (1)'
  )

  t.deepEqual(
    micromark('| a | \n| - |', {extensions: [syntax], htmlExtensions: [html]}),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support rows w/ trailing whitespace (2)'
  )

  t.deepEqual(
    micromark('| a |\n| - | ', {extensions: [syntax], htmlExtensions: [html]}),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support rows w/ trailing whitespace (3)'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n| b | ', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support rows w/ trailing whitespace (4)'
  )

  t.deepEqual(
    micromark('||a|\n|-|-|', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th></th>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support empty first header cells'
  )

  t.deepEqual(
    micromark('|a||\n|-|-|', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th></th>\n</tr>\n</thead>\n</table>',
    'should support empty last header cells'
  )

  t.deepEqual(
    micromark('a||b\n-|-|-', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th></th>\n<th>b</th>\n</tr>\n</thead>\n</table>',
    'should support empty header cells'
  )

  t.deepEqual(
    micromark('|a|b|\n|-|-|\n||c|', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td></td>\n<td>c</td>\n</tr>\n</tbody>\n</table>',
    'should support empty first body cells'
  )

  t.deepEqual(
    micromark('|a|b|\n|-|-|\n|c||', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>c</td>\n<td></td>\n</tr>\n</tbody>\n</table>',
    'should support empty last body cells'
  )

  t.deepEqual(
    micromark('a|b|c\n-|-|-\nd||e', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n<th>c</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>d</td>\n<td></td>\n<td>e</td>\n</tr>\n</tbody>\n</table>',
    'should support empty body cells'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n- b', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<ul>\n<li>b</li>\n</ul>',
    'should support a list after a table'
  )

  t.deepEqual(
    micromark('> | a |\n| - |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<p>| a |\n| - |</p>\n</blockquote>',
    'should not support a lazy delimiter row (1)'
  )

  t.deepEqual(
    micromark('> a\n> | b |\n| - |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<p>a\n| b |\n| - |</p>\n</blockquote>',
    'should not support a lazy delimiter row (2)'
  )

  t.deepEqual(
    micromark('| a |\n> | - |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p>| a |</p>\n<blockquote>\n<p>| - |</p>\n</blockquote>',
    'should not support a lazy delimiter row (3)'
  )

  t.deepEqual(
    micromark('> a\n> | b |\n|-', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<p>a\n| b |\n|-</p>\n</blockquote>',
    'should not support a lazy delimiter row (4)'
  )

  t.deepEqual(
    micromark('> | a |\n> | - |\n| b |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n</blockquote>\n<p>| b |</p>',
    'should not support a lazy body row (1)'
  )

  t.deepEqual(
    micromark('> a\n> | b |\n> | - |\n| c |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<p>a</p>\n<table>\n<thead>\n<tr>\n<th>b</th>\n</tr>\n</thead>\n</table>\n</blockquote>\n<p>| c |</p>',
    'should not support a lazy body row (2)'
  )

  t.deepEqual(
    micromark('> | A |\n> | - |\n> | 1 |\n| 2 |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<table>\n<thead>\n<tr>\n<th>A</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>1</td>\n</tr>\n</tbody>\n</table>\n</blockquote>\n<p>| 2 |</p>',
    'should not support a lazy body row (3)'
  )

  const doc = '   - d\n    - e'

  t.deepEqual(
    micromark(doc, {extensions: [syntax], htmlExtensions: [html]}),
    micromark(doc),
    'should not change how lists and lazyness work'
  )

  t.deepEqual(
    micromark('| a |\n   | - |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should form a table if the delimiter row is indented w/ 3 spaces'
  )

  t.deepEqual(
    micromark('| a |\n    | - |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p>| a |\n| - |</p>',
    'should not form a table if the delimiter row is indented w/ 4 spaces'
  )

  t.deepEqual(
    micromark('| a |\n    | - |', {
      extensions: [syntax, {disable: {null: ['codeIndented']}}],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should form a table if the delimiter row is indented w/ 4 spaces and indented code is turned off'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n> block quote?', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<blockquote>\n<p>block quote?</p>\n</blockquote>',
    'should be interrupted by a block quote'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n>', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<blockquote>\n</blockquote>',
    'should be interrupted by a block quote (empty)'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n- list?', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<ul>\n<li>list?</li>\n</ul>',
    'should be interrupted by a list'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n-', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<ul>\n<li></li>\n</ul>',
    'should be interrupted by a list (empty)'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n<!-- HTML? -->', {
      allowDangerousHtml: true,
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<!-- HTML? -->',
    'should be interrupted by HTML (flow)'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n\tcode?', {
      allowDangerousHtml: true,
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<pre><code>code?\n</code></pre>',
    'should be interrupted by code (indented)'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n```js\ncode?', {
      allowDangerousHtml: true,
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<pre><code class="language-js">code?\n</code></pre>\n',
    'should be interrupted by code (fenced)'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n***', {
      allowDangerousHtml: true,
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<hr />',
    'should be interrupted by a thematic break'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n# heading?', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<h1>heading?</h1>',
    'should be interrupted by a heading (ATX)'
  )

  t.deepEqual(
    micromark('| a |\n| - |\nheading\n=', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>heading</td>\n</tr>\n<tr>\n<td>=</td>\n</tr>\n</tbody>\n</table>',
    'should *not* be interrupted by a heading (setext)'
  )

  t.deepEqual(
    micromark('| a |\n| - |\nheading\n---', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>heading</td>\n</tr>\n</tbody>\n</table>\n<hr />',
    'should *not* be interrupted by a heading (setext), but interrupt if the underline is also a thematic break'
  )

  // t.deepEqual(
  //   micromark('| a |\n| - |\nheading\n-', {
  //     extensions: [syntax],
  //     htmlExtensions: [html]
  //   }),
  //   '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>heading</td>\n</tr>\n</tbody>\n</table>\n<ul>\n<li></li>\n</ul>',
  //   'should *not* be interrupted by a heading (setext), but interrupt if the underline is also an empty list item bullet'
  // )

  t.end()
})

test('fixtures', async (t) => {
  const base = new URL('fixtures/', import.meta.url)

  await createGfmFixtures(base, {rehypeStringify: {closeSelfClosing: true}})

  const files = fs.readdirSync(base).filter((d) => /\.md$/.test(d))
  let index = -1

  while (++index < files.length) {
    const name = path.basename(files[index], '.md')
    const input = fs.readFileSync(new URL(name + '.md', base))
    let expected = String(fs.readFileSync(new URL(name + '.html', base)))
    let actual = micromark(input, {
      allowDangerousHtml: true,
      allowDangerousProtocol: true,
      extensions: [syntax],
      htmlExtensions: [html]
    })

    if (actual && !/\n$/.test(actual)) {
      actual += '\n'
    }

    if (name === 'some-escapes') {
      expected = expected
        .replace(/C \| Charlie/, 'C \\')
        .replace(/E \\\| Echo/, 'E \\\\')
    }

    t.deepEqual(actual, expected, name)
  }

  t.end()
})

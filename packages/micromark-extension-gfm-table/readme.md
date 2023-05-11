# micromark-extension-gfm-table

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[micromark][] extension to support GFM [tables][].

## Contents

*   [What is this?](#what-is-this)
*   [When to use this](#when-to-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`gfmTable`](#gfmtable)
    *   [`gfmTableHtml`](#gfmtablehtml)
*   [Authoring](#authoring)
*   [HTML](#html)
*   [CSS](#css)
*   [Syntax](#syntax)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package contains extensions that add support for tables enabled by
GFM to [`micromark`][micromark].
It matches how tables work on `github.com`.

## When to use this

These tools are all low-level.
In many cases, you want to use [`remark-gfm`][plugin] with remark instead.

Even when you want to use `micromark`, you likely want to use
[`micromark-extension-gfm`][micromark-extension-gfm] to support all GFM
features.
That extension includes this extension.

When working with `mdast-util-from-markdown`, you must combine this package with
[`mdast-util-gfm-table`][util].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install micromark-extension-gfm-table
```

In Deno with [`esm.sh`][esmsh]:

```js
import {gfmTable, gfmTableHtml} from 'https://esm.sh/micromark-extension-gfm-table@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {gfmTable, gfmTableHtml} from 'https://esm.sh/micromark-extension-gfm-table@1?bundle'
</script>
```

## Use

```js
import {micromark} from 'micromark'
import {gfmTable, gfmTableHtml} from 'micromark-extension-gfm-table'

const output = micromark('| a |\n| - |', {
  extensions: [gfmTable],
  htmlExtensions: [gfmTableHtml]
})

console.log(output)
```

Yields:

```html
<table>
<thead>
<tr>
<th>a</th>
</tr>
</thead>
</table>
```

## API

This package exports the identifiers `gfmTable` and `gfmTableHtml`.
There is no default export.

The export map supports the endorsed [`development` condition][condition].
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `gfmTable`

Syntax extension for micromark (passed in `extensions`).

### `gfmTableHtml`

HTML extension for micromark (passed in `htmlExtensions`).

## Authoring

###### Align

When authoring markdown with tables, it can get a bit hard to make them look
well.
You can align the pipes (`|`) in rows nicely, which makes it easier to spot
problems, but aligning gets cumbersome for tables with many rows or columns,
or when they change frequently, especially if data in cells have varying
lengths.
To illustrate, when some cell increases in size which makes it longer than all
other cells in that column, you’d have to pad every other cell as well, which
can be a lot of work, and will introduce a giant diff in Git.

###### Initial and final pipes

In some cases, GFM tables can be written without initial or final pipes:

```markdown
name  | letter
----- | ------
alpha | a
bravo | b
```

These tables do not parse in certain other cases, making them fragile and hard
to get right.
Due to this, it’s recommended to always include initial and final pipes.

###### Escaped pipes in code

GitHub applies one weird, special thing in tables that markdown otherwise never
does: it allows character escapes (not character references) of pipes (not other
characters) in code in cells.
It’s weird, because markdown, per CommonMark, does not allow character escapes
in code.
GitHub only applies this change in code in tables:

```markdown
| `a\|b\-` |
| - |

`a\|b\-`
```

Yields:

```html
<table>
<thead>
<tr>
<th><code>a|b\-</code></th>
</tr>
</thead>
</table>
<p><code>a\|b\-</code></p>
```

> 👉 **Note**: observe that the escaped pipe in the table does not result in
> another column, and is not present in the resulting code.
> Other escapes, and pipe escapes outside tables, do nothing.

This behavior solves a real problem, so you might resort to using it.
It might not work in other markdown parsers though.

## HTML

GFM tables relate to several tabular data HTML elements:
See [*§ 4.9.1 The `table` element*][html-table],
[*§ 4.9.5 The `tbody` element*][html-tbody],
[*§ 4.9.6 The `thead` element*][html-thead],
[*§ 4.9.8 The `tr` element*][html-tr],
[*§ 4.9.9 The `td` element*][html-td], and
[*§ 4.9.10 The `th` element*][html-th]
in the HTML spec for more info.

GitHub provides the alignment information from the delimiter row on each `<td>`
and `<th>` element with an `align` attribute.
This feature stems from ancient times in HTML, and still works, but is
considered a [non-conforming feature][html-non-conform], which must not be used
by authors.

## CSS

The following CSS is needed to make tables look a bit like GitHub.
For the complete actual CSS see
[`sindresorhus/github-markdown-css`][github-markdown-css]

```css
/* Light theme. */
:root {
  --color-canvas-default: #ffffff;
  --color-canvas-subtle: #f6f8fa;
  --color-border-default: #d0d7de;
  --color-border-muted: hsla(210, 18%, 87%, 1);
}

/* Dark theme. */
@media (prefers-color-scheme: dark) {
  :root {
    --color-canvas-default: #0d1117;
    --color-canvas-subtle: #161b22;
    --color-border-default: #30363d;
    --color-border-muted: #21262d;
  }
}

table {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  margin-top: 0;
  margin-bottom: 16px;
  width: max-content;
  max-width: 100%;
  overflow: auto;
}

tr {
  background-color: var(--color-canvas-default);
  border-top: 1px solid var(--color-border-muted);
}

tr:nth-child(2n) {
  background-color: var(--color-canvas-subtle);
}

td,
th {
  padding: 6px 13px;
  border: 1px solid var(--color-border-default);
}

th {
  font-weight: 600;
}

table img {
  background-color: transparent;
}
```

## Syntax

Tables form with, roughly, the following BNF:

```bnf
; Restriction: number of cells in first row must match number of cells in delimiter row.
table ::= row eol delimiter_row 0.*( eol row )

; Restriction: Line cannot be blank.
row ::= [ '|' ] cell 0.*( '|' cell ) [ '|' ]
delimiter_row ::= [ '|' ] delimiter_cell 0.*( '|' delimiter_cell ) [ '|' ]

cell ::= 0.*space_or_tab 0.*( cell_text | cell_escape ) 0.*space_or_tab
cell_text ::= code - eol - '|' - '\\' - ''
cell_escape ::= '\\' ( '|' | '\\' )
delimiter_cell ::= 0.*space_or_tab [ ':' ] 1*'-' [ ':' ] 0.*space_or_tab
```

## Types

This package is fully typed with [TypeScript][].
There are no additional exported types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
It also works in Deno and modern browsers.

## Security

This package is safe.

## Related

*   [`syntax-tree/mdast-util-gfm-table`][util]
    — support GFM tables in mdast
*   [`syntax-tree/mdast-util-gfm`][mdast-util-gfm]
    — support GFM in mdast
*   [`remarkjs/remark-gfm`][plugin]
    — support GFM in remark

## Contribute

See [`contributing.md` in `micromark/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/micromark/micromark-extension-gfm-table/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-gfm-table/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-gfm-table.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-gfm-table

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-gfm-table.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-gfm-table

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-gfm-table.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-gfm-table

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[npm]: https://docs.npmjs.com/cli/install

[esmsh]: https://esm.sh

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/main/contributing.md

[support]: https://github.com/micromark/.github/blob/main/support.md

[coc]: https://github.com/micromark/.github/blob/main/code-of-conduct.md

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[condition]: https://nodejs.org/api/packages.html#packages_resolving_user_conditions

[micromark]: https://github.com/micromark/micromark

[micromark-extension-gfm]: https://github.com/micromark/micromark-extension-gfm

[util]: https://github.com/syntax-tree/mdast-util-gfm-table

[mdast-util-gfm]: https://github.com/syntax-tree/mdast-util-gfm

[plugin]: https://github.com/remarkjs/remark-gfm

[tables]: https://github.github.com/gfm/#tables-extension-

[html-table]: https://html.spec.whatwg.org/multipage/tables.html#the-table-element

[html-tbody]: https://html.spec.whatwg.org/multipage/tables.html#the-tbody-element

[html-thead]: https://html.spec.whatwg.org/multipage/tables.html#the-thead-element

[html-tr]: https://html.spec.whatwg.org/multipage/tables.html#the-tr-element

[html-td]: https://html.spec.whatwg.org/multipage/tables.html#the-td-element

[html-th]: https://html.spec.whatwg.org/multipage/tables.html#the-th-element

[html-non-conform]: https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features

[github-markdown-css]: https://github.com/sindresorhus/github-markdown-css

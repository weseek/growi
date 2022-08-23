/**
 * @typedef {import('../src/micromark-extension-growi-plugin/index.js').HtmlOptions} HtmlOptions
 * @typedef {import('../src/micromark-extension-growi-plugin/index.js').Handle} Handle
 */

import { htmlVoidElements } from 'html-void-elements';
import { micromark } from 'micromark';
import test from 'tape';

import { DirectiveType } from '../src/mdast-util-growi-plugin/consts.js';
import { directive as syntax, directiveHtml as html } from '../src/micromark-extension-growi-plugin/index.js';

const own = {}.hasOwnProperty;

test('micromark-extension-directive (syntax)', (t) => {
  t.test('text', (t) => {
    t.equal(
      micromark('\\$a', options()),
      '<p>$a</p>',
      'should support an escaped colon which would otherwise be a directive',
    );

    t.equal(
      micromark('\\$$a', options()),
      '<p>$</p>',
      'should support a directive after an escaped colon',
    );

    // t.equal(
    //   micromark('a :$b', options()),
    //   '<p>a :$b</p>',
    //   'should not support a directive after a colon',
    // );

    t.equal(
      micromark('$', options()),
      '<p>$</p>',
      'should not support a colon not followed by an alpha',
    );

    t.equal(
      micromark('a $a', options()),
      '<p>a </p>',
      'should support a colon followed by an alpha',
    );

    t.equal(
      micromark('$9', options()),
      '<p>$9</p>',
      'should not support a colon followed by a digit',
    );

    t.equal(
      micromark('$-', options()),
      '<p>$-</p>',
      'should not support a colon followed by a dash',
    );

    t.equal(
      micromark('$_', options()),
      '<p>$_</p>',
      'should not support a colon followed by an underscore',
    );

    t.equal(
      micromark('a $a9', options()),
      '<p>a </p>',
      'should support a digit in a name',
    );

    t.equal(
      micromark('a $a-b', options()),
      '<p>a </p>',
      'should support a dash in a name',
    );

    t.equal(
      micromark('$a-', options()),
      '<p>$a-</p>',
      'should *not* support a dash at the end of a name',
    );

    t.equal(
      micromark('a $a_b', options()),
      '<p>a </p>',
      'should support an underscore in a name',
    );

    t.equal(
      micromark('$a_', options()),
      '<p>$a_</p>',
      'should *not* support an underscore at the end of a name',
    );

    t.equal(
      micromark('$a$', options()),
      '<p>$a$</p>',
      'should *not* support a colon right after a name',
    );

    t.equal(
      micromark('_$directive_', options()),
      '<p><em>$directive</em></p>',
      'should not interfere w/ emphasis (`_`)',
    );

    t.equal(
      micromark('$a[', options()),
      '<p>[</p>',
      'should support a name followed by an unclosed `[`',
    );

    t.equal(
      micromark('$a(', options()),
      '<p>(</p>',
      'should support a name followed by an unclosed `{`',
    );

    t.equal(
      micromark('$a[b', options()),
      '<p>[b</p>',
      'should support a name followed by an unclosed `[` w/ content',
    );

    t.equal(
      micromark('$a(b', options()),
      '<p>(b</p>',
      'should support a name followed by an unclosed `{` w/ content',
    );

    t.equal(
      micromark('a $a[]', options()),
      '<p>a </p>',
      'should support an empty label',
    );

    t.equal(
      micromark('a $a[ \t]', options()),
      '<p>a </p>',
      'should support a whitespace only label',
    );

    t.equal(
      micromark('$a[\n]', options()),
      '<p></p>',
      'should support an eol in an label',
    );

    t.equal(
      micromark('$a[a b c]asd', options()),
      '<p>asd</p>',
      'should support content in an label',
    );

    t.equal(
      micromark('$a[a *b* c]asd', options()),
      '<p>asd</p>',
      'should support markdown in an label',
    );

    t.equal(
      micromark('a $b[c :d[e] f] g', options()),
      '<p>a  g</p>',
      'should support a directive in an label',
    );

    t.equal(
      micromark('$a[]asd', options()),
      '<p>asd</p>',
      'should support content after a label',
    );

    t.equal(
      micromark('a $a()', options()),
      '<p>a </p>',
      'should support empty attributes',
    );

    t.equal(
      micromark('a $a( \t)', options()),
      '<p>a </p>',
      'should support whitespace only attributes',
    );

    t.equal(
      micromark('$a(\n)', options()),
      '<p></p>',
      'should support an eol in attributes',
    );

    t.equal(
      micromark('a $a(a b c)', options()),
      '<p>a </p>',
      'should support attributes w/o values',
    );

    t.equal(
      micromark('a $a(a=b c=d)', options()),
      '<p>a </p>',
      'should support attributes w/ unquoted values',
    );

    t.equal(
      micromark('a $a(.a .b)', options()),
      '<p>a </p>',
      'should support attributes w/ class shortcut',
    );

    t.equal(
      micromark('a $a(.a.b)', options()),
      '<p>a </p>',
      'should support attributes w/ class shortcut w/o whitespace between',
    );

    t.equal(
      micromark('a $a(#a #b)', options()),
      '<p>a </p>',
      'should support attributes w/ id shortcut',
    );

    t.equal(
      micromark('a $a(#a#b)', options()),
      '<p>a </p>',
      'should support attributes w/ id shortcut w/o whitespace between',
    );

    t.equal(
      micromark('a $a(#a.b.c#d e f=g #h.i.j)', options()),
      '<p>a </p>',
      'should support attributes w/ shortcuts combined w/ other attributes',
    );

    t.equal(
      micromark('$a(..b)', options()),
      '<p>(..b)</p>',
      'should not support an empty shortcut (`.`)',
    );

    t.equal(
      micromark('$a(.#b)', options()),
      '<p>(.#b)</p>',
      'should not support an empty shortcut (`#`)',
    );

    t.equal(
      micromark('$a(.)', options()),
      '<p>(.)</p>',
      'should not support an empty shortcut (`}`)',
    );

    t.equal(
      micromark('$a(.a=b)', options()),
      '<p>(.a=b)</p>',
      'should not support certain characters in shortcuts (`=`)',
    );

    t.equal(
      micromark('$a(.a"b)', options()),
      '<p>(.a&quot;b)</p>',
      'should not support certain characters in shortcuts (`"`)',
    );

    t.equal(
      micromark('$a(.a<b)', options()),
      '<p>(.a&lt;b)</p>',
      'should not support certain characters in shortcuts (`<`)',
    );

    t.equal(
      micromark('a $a(.a💚b)', options()),
      '<p>a </p>',
      'should support most characters in shortcuts',
    );

    t.equal(
      micromark('a $a(_)', options()),
      '<p>a </p>',
      'should support an underscore in attribute names',
    );

    t.equal(
      micromark('a $a(xml:lang)', options()),
      '<p>a </p>',
      'should support a colon in attribute names',
    );

    t.equal(
      micromark('a $a(a="b" c="d e f")', options()),
      '<p>a </p>',
      'should support double quoted attributes',
    );

    t.equal(
      micromark("a $a(a='b' c='d e f')", options()),
      '<p>a </p>',
      'should support single quoted attributes',
    );

    t.equal(
      micromark('a $a(a = b c\t=\t\'d\' f  =\r"g")', options()),
      '<p>a </p>',
      'should support whitespace around initializers',
    );

    t.equal(
      micromark('$a(b==)', options()),
      '<p>(b==)</p>',
      'should not support `=` to start an unquoted attribute value',
    );

    t.equal(
      micromark('$a(b=)', options()),
      '<p>(b=)</p>',
      'should not support a missing attribute value after `=`',
    );

    t.equal(
      micromark("$a(b=c')", options()),
      "<p>(b=c')</p>",
      'should not support an apostrophe in an unquoted attribute value',
    );

    t.equal(
      micromark('$a(b=c`)', options()),
      '<p>(b=c`)</p>',
      'should not support a grave accent in an unquoted attribute value',
    );

    t.equal(
      micromark('a $a(b=a💚b)', options()),
      '<p>a </p>',
      'should support most other characters in unquoted attribute values',
    );

    t.equal(
      micromark('$a(b="c', options()),
      '<p>(b=&quot;c</p>',
      'should not support an EOF in a quoted attribute value',
    );

    t.equal(
      micromark('a $a(b="a💚b")', options()),
      '<p>a </p>',
      'should support most other characters in quoted attribute values',
    );

    t.equal(
      micromark('$a(b="\nc\r  d")', options()),
      '<p></p>',
      'should support EOLs in quoted attribute values',
    );

    t.equal(
      micromark('$a(b="c"', options()),
      '<p>(b=&quot;c&quot;</p>',
      'should not support an EOF after a quoted attribute value',
    );

    t.end();
  });

  t.test('leaf', (t) => {
    t.equal(micromark('$b', options()), '', 'should support a directive');

    t.equal(
      micromark(':', options()),
      '<p>:</p>',
      'should not support one colon',
    );

    t.equal(
      micromark('::', options()),
      '<p>::</p>',
      'should not support two colons not followed by an alpha',
    );

    t.equal(
      micromark('$a', options()),
      '',
      'should support two colons followed by an alpha',
    );

    t.equal(
      micromark('$9', options()),
      '<p>$9</p>',
      'should not support two colons followed by a digit',
    );

    t.equal(
      micromark('$-', options()),
      '<p>$-</p>',
      'should not support two colons followed by a dash',
    );

    t.equal(
      micromark('$a9', options()),
      '',
      'should support a digit in a name',
    );

    t.equal(
      micromark('$a-b', options()),
      '',
      'should support a dash in a name',
    );

    // == Resolved as text directive
    // t.equal(
    //   micromark('$a[', options()),
    //   '<p>$a[</p>',
    //   'should not support a name followed by an unclosed `[`',
    // );

    // == Resolved as text directive
    // t.equal(
    //   micromark('$a{', options()),
    //   '<p>$a{</p>',
    //   'should not support a name followed by an unclosed `{`',
    // );

    // == Resolved as text directive
    // t.equal(
    //   micromark('$a[b', options()),
    //   '<p>$a[b</p>',
    //   'should not support a name followed by an unclosed `[` w/ content',
    // );

    // == Resolved as text directive
    // t.equal(
    //   micromark('$a{b', options()),
    //   '<p>$a{b</p>',
    //   'should not support a name followed by an unclosed `{` w/ content',
    // );

    t.equal(micromark('$a[]', options()), '', 'should support an empty label');

    t.equal(
      micromark('$a[ \t]', options()),
      '',
      'should support a whitespace only label',
    );

    // == Resolved as text directive
    // t.equal(
    //   micromark('$a[\n]', options()),
    //   '<p>$a[\n]</p>',
    //   'should not support an eol in an label',
    // );

    t.equal(
      micromark('$a[a b c]', options()),
      '',
      'should support content in an label',
    );

    t.equal(
      micromark('$a[a *b* c]', options()),
      '',
      'should support markdown in an label',
    );

    // == Resolved as text directive
    // t.equal(
    //   micromark('$a[]asd', options()),
    //   '<p>$a[]asd</p>',
    //   'should not support content after a label',
    // );

    t.equal(
      micromark('$a()', options()),
      '',
      'should support empty attributes',
    );

    t.equal(
      micromark('$a( \t)', options()),
      '',
      'should support whitespace only attributes',
    );

    // == Resolved as text directive
    // t.equal(
    //   micromark('$a(\n)', options()),
    //   '<p>$a(\n)</p>',
    //   'should not support an eol in attributes',
    // );

    t.equal(
      micromark('$a(a b c)', options()),
      '',
      'should support attributes w/o values',
    );

    t.equal(
      micromark('$a(a=b c=d)', options()),
      '',
      'should support attributes w/ unquoted values',
    );

    t.equal(
      micromark('$a(.a .b)', options()),
      '',
      'should support attributes w/ class shortcut',
    );

    t.equal(
      micromark('$a(#a #b)', options()),
      '',
      'should support attributes w/ id shortcut',
    );

    t.equal(
      micromark('$a(.a💚b)', options()),
      '',
      'should support most characters in shortcuts',
    );

    t.equal(
      micromark('$a(a="b" c="d e f")', options()),
      '',
      'should support double quoted attributes',
    );

    t.equal(
      micromark("$a(a='b' c='d e f')", options()),
      '',
      'should support single quoted attributes',
    );

    t.equal(
      micromark("$a(a = b c\t=\t'd')", options()),
      '',
      'should support whitespace around initializers',
    );

    // == Resolved as text directive
    // t.equal(
    //   micromark('$a(f  =\rg)', options()),
    //   '<p>$a(f  =\rg)</p>',
    //   'should not support EOLs around initializers',
    // );

    // == Resolved as text directive
    // t.equal(
    //   micromark('$a(b==)', options()),
    //   '<p>$a(b==)</p>',
    //   'should not support `=` to start an unquoted attribute value',
    // );

    t.equal(
      micromark('$a(b=a💚b)', options()),
      '',
      'should support most other characters in unquoted attribute values',
    );

    // == Resolved as text directive
    // t.equal(
    //   micromark('$a(b="c', options()),
    //   '<p>$a(b=&quot;c</p>',
    //   'should not support an EOF in a quoted attribute value',
    // );

    t.equal(
      micromark('$a(b="a💚b")', options()),
      '',
      'should support most other characters in quoted attribute values',
    );

    // == Resolved as text directive
    // t.equal(
    //   micromark('$a(b="\nc\r  d")', options()),
    //   '<p>$a(b=&quot;\nc\rd&quot;)</p>',
    //   'should not support EOLs in quoted attribute values',
    // );

    // t.equal(
    //   micromark('$a(b="c"', options()),
    //   '<p>$a(b=&quot;c&quot;</p>',
    //   'should not support an EOF after a quoted attribute value',
    // );

    t.equal(
      micromark('$a(b=c) \t ', options()),
      '',
      'should support whitespace after directives',
    );

    t.equal(
      micromark('$a(b=c)\n>a', options()),
      '<blockquote>\n<p>a</p>\n</blockquote>',
      'should support a block quote after a leaf',
    );

    t.equal(
      micromark('$a(b=c)\n```js\na', options()),
      '<pre><code class="language-js">a\n</code></pre>\n',
      'should support code (fenced) after a leaf',
    );

    t.equal(
      micromark('$a(b=c)\n    a', options()),
      '<pre><code>a\n</code></pre>',
      'should support code (indented) after a leaf',
    );

    t.equal(
      micromark('$a(b=c)\n[a]: b', options()),
      '',
      'should support a definition after a leaf',
    );

    t.equal(
      micromark('$a(b=c)\n# a', options()),
      '<h1>a</h1>',
      'should support a heading (atx) after a leaf',
    );

    t.equal(
      micromark('$a(b=c)\na\n=', options()),
      '<h1>a</h1>',
      'should support a heading (setext) after a leaf',
    );

    t.equal(
      micromark('$a(b=c)\n<!-->', options()),
      '<!-->',
      'should support html after a leaf',
    );

    t.equal(
      micromark('$a(b=c)\n* a', options()),
      '<ul>\n<li>a</li>\n</ul>',
      'should support a list after a leaf',
    );

    t.equal(
      micromark('$a(b=c)\na', options()),
      '<p>a</p>',
      'should support a paragraph after a leaf',
    );

    t.equal(
      micromark('$a(b=c)\n***', options()),
      '<hr />',
      'should support a thematic break after a leaf',
    );

    t.equal(
      micromark('>a\n$a(b=c)', options()),
      '<blockquote>\n<p>a</p>\n</blockquote>\n',
      'should support a block quote before a leaf',
    );

    t.equal(
      micromark('```js\na\n```\n$a(b=c)', options()),
      '<pre><code class="language-js">a\n</code></pre>\n',
      'should support code (fenced) before a leaf',
    );

    t.equal(
      micromark('    a\n$a(b=c)', options()),
      '<pre><code>a\n</code></pre>\n',
      'should support code (indented) before a leaf',
    );

    t.equal(
      micromark('[a]: b\n$a(b=c)', options()),
      '',
      'should support a definition before a leaf',
    );

    t.equal(
      micromark('# a\n$a(b=c)', options()),
      '<h1>a</h1>\n',
      'should support a heading (atx) before a leaf',
    );

    t.equal(
      micromark('a\n=\n$a(b=c)', options()),
      '<h1>a</h1>\n',
      'should support a heading (setext) before a leaf',
    );

    t.equal(
      micromark('<!-->\n$a(b=c)', options()),
      '<!-->\n',
      'should support html before a leaf',
    );

    t.equal(
      micromark('* a\n$a(b=c)', options()),
      '<ul>\n<li>a</li>\n</ul>\n',
      'should support a list before a leaf',
    );

    t.equal(
      micromark('a\n$a(b=c)', options()),
      '<p>a</p>\n',
      'should support a paragraph before a leaf',
    );

    t.equal(
      micromark('***\n$a(b=c)', options()),
      '<hr />\n',
      'should support a thematic break before a leaf',
    );

    t.equal(
      micromark('> $a\nb', options({ '*': h })),
      '<blockquote><a></a>\n</blockquote>\n<p>b</p>',
      'should not support lazyness (1)',
    );

    t.equal(
      micromark('> a\n$b', options({ '*': h })),
      '<blockquote>\n<p>a</p>\n</blockquote>\n<b></b>',
      'should not support lazyness (2)',
    );

    t.end();
  });

  t.end();
});

test('micromark-extension-directive (compile)', (t) => {
  t.equal(
    micromark(
      [
        'a $abbr',
        'a $abbr[HTML]',
        'a $abbr(title="HyperText Markup Language")',
        'a $abbr[HTML](title="HyperText Markup Language")',
      ].join('\n\n'),
      options({ abbr }),
    ),
    [
      '<p>a <abbr></abbr></p>',
      '<p>a <abbr>HTML</abbr></p>',
      '<p>a <abbr title="HyperText Markup Language"></abbr></p>',
      '<p>a <abbr title="HyperText Markup Language">HTML</abbr></p>',
    ].join('\n'),
    'should support a directives (abbr)',
  );

  t.equal(
    micromark(
      [
        'Text:',
        'a $youtube',
        'a $youtube[Cat in a box a]',
        'a $youtube(v=1)',
        'a $youtube[Cat in a box b](v=2)',
        'Leaf:',
        '$youtube',
        '$youtube[Cat in a box c]',
        '$youtube(v=3)',
        '$youtube[Cat in a box d](v=4)',
      ].join('\n\n'),
      options({ youtube }),
    ),
    [
      '<p>Text:</p>',
      '<p>a </p>',
      '<p>a </p>',
      '<p>a <iframe src="https://www.youtube.com/embed/1" allowfullscreen></iframe></p>',
      '<p>a <iframe src="https://www.youtube.com/embed/2" allowfullscreen title="Cat in a box b"></iframe></p>',
      '<p>Leaf:</p>',
      '<iframe src="https://www.youtube.com/embed/3" allowfullscreen></iframe>',
      '<iframe src="https://www.youtube.com/embed/4" allowfullscreen title="Cat in a box d"></iframe>',
    ].join('\n'),
    'should support directives (youtube)',
  );

  t.equal(
    micromark('a $youtube[Cat in a box]\n$br a', options({ youtube, '*': h })),
    '<p>a <youtube>Cat in a box</youtube>\n<br> a</p>',
    'should support fall through directives (`*`)',
  );

  t.equal(
    micromark('a $a[$img(src="x" alt=y)](href="z")', options({ '*': h })),
    '<p>a <a href="z"><img src="x" alt="y"></a></p>',
    'should support fall through directives (`*`)',
  );

  t.end();
});

test('content', (t) => {
  t.equal(
    micromark('a $abbr[x\\&y&amp;z]', options({ abbr })),
    '<p>a <abbr>x&amp;y&amp;z</abbr></p>',
    'should support character escapes and character references in label',
  );

  t.equal(
    micromark('a $abbr[x\\[y\\]z]', options({ abbr })),
    '<p>a <abbr>x[y]z</abbr></p>',
    'should support escaped brackets in a label',
  );

  t.equal(
    micromark('a $abbr[x[y]z]', options({ abbr })),
    '<p>a <abbr>x[y]z</abbr></p>',
    'should support balanced brackets in a label',
  );

  t.equal(
    micromark(
      'a $abbr[1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]',
      options({ abbr }),
    ),
    '<p>a <abbr>1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]</abbr></p>',
    'should support balanced brackets in a label, 32 levels deep',
  );

  t.equal(
    micromark(
      '$abbr[1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[33[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]',
      options({ abbr }),
    ),
    '<p><abbr></abbr>[1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[33[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]</p>',
    'should *not* support balanced brackets in a label, 33 levels deep',
  );

  t.equal(
    micromark('$abbr[a\nb\rc]', options({ abbr })),
    '<p><abbr>a\nb\rc</abbr></p>',
    'should support EOLs in a label',
  );

  t.equal(
    micromark('$abbr[\na\r]', options({ abbr })),
    '<p><abbr>\na\r</abbr></p>',
    'should support EOLs at the edges of a label (1)',
  );

  t.equal(
    micromark('$abbr[\n]', options({ abbr })),
    '<p><abbr>\n</abbr></p>',
    'should support EOLs at the edges of a label (2)',
  );

  // == does not work but I don't know why.. -- 2022.08.12 Yuki Takei
  // t.equal(
  //   micromark('$abbr[a\n$abbr[b]\nc]', options({ abbr })),
  //   '<p>a <abbr>a\n<abbr>b</abbr>\nc</abbr> a</p>',
  //   'should support EOLs around nested directives',
  // );

  t.equal(
    micromark('$abbr[$abbr[\n]]', options({ abbr })),
    '<p><abbr><abbr>\n</abbr></abbr></p>',
    'should support EOLs inside nested directives (1)',
  );

  t.equal(
    micromark('$abbr[$abbr[a\nb]]', options({ abbr })),
    '<p><abbr><abbr>a\nb</abbr></abbr></p>',
    'should support EOLs inside nested directives (2)',
  );

  t.equal(
    micromark('$abbr[$abbr[\nb\n]]', options({ abbr })),
    '<p><abbr><abbr>\nb\n</abbr></abbr></p>',
    'should support EOLs inside nested directives (3)',
  );

  t.equal(
    micromark('$abbr[$abbr[\\\n]]', options({ abbr })),
    '<p><abbr><abbr><br />\n</abbr></abbr></p>',
    'should support EOLs inside nested directives (4)',
  );

  t.equal(
    micromark('a $abbr[a *b* **c** d]', options({ abbr })),
    '<p>a <abbr>a <em>b</em> <strong>c</strong> d</abbr></p>',
    'should support markdown in a label',
  );

  t.equal(
    micromark('a $abbr(title=a&apos;b)', options({ abbr })),
    '<p>a <abbr title="a\'b"></abbr></p>',
    'should support character references in unquoted attribute values',
  );

  t.equal(
    micromark('a $abbr(title="a&apos;b")', options({ abbr })),
    '<p>a <abbr title="a\'b"></abbr></p>',
    'should support character references in double attribute values',
  );

  t.equal(
    micromark("a $abbr(title='a&apos;b')", options({ abbr })),
    '<p>a <abbr title="a\'b"></abbr></p>',
    'should support character references in single attribute values',
  );

  t.equal(
    micromark('a $abbr(title="a&somethingelse;b")', options({ abbr })),
    '<p>a <abbr title="a&amp;somethingelse;b"></abbr></p>',
    'should support unknown character references in attribute values',
  );

  t.equal(
    micromark('$span(a\nb)', options({ '*': h })),
    '<p><span a="" b=""></span></p>',
    'should support EOLs between attributes',
  );

  t.equal(
    micromark('$span(\na\n)', options({ '*': h })),
    '<p><span a=""></span></p>',
    'should support EOLs at the edges of attributes',
  );

  t.equal(
    micromark('$span(a\r= b)', options({ '*': h })),
    '<p><span a="b"></span></p>',
    'should support EOLs before initializer',
  );

  t.equal(
    micromark('$span(a=\r\nb)', options({ '*': h })),
    '<p><span a="b"></span></p>',
    'should support EOLs after initializer',
  );

  t.equal(
    micromark('$span(a=b\nc)', options({ '*': h })),
    '<p><span a="b" c=""></span></p>',
    'should support EOLs between an unquoted attribute value and a next attribute name',
  );

  t.equal(
    micromark('$span(a="b\nc")', options({ '*': h })),
    '<p><span a="b\nc"></span></p>',
    'should support EOLs in a double quoted attribute value',
  );

  t.equal(
    micromark("$span(a='b\nc')", options({ '*': h })),
    '<p><span a="b\nc"></span></p>',
    'should support EOLs in a single quoted attribute value',
  );

  t.equal(
    micromark('a $span(#a#b)', options({ '*': h })),
    '<p>a <span id="b"></span></p>',
    'should support `id` shortcuts',
  );

  t.equal(
    micromark('a $span(id=a id="b" #c#d)', options({ '*': h })),
    '<p>a <span id="d"></span></p>',
    'should support `id` shortcuts after `id` attributes',
  );

  t.equal(
    micromark('a $span(.a.b)', options({ '*': h })),
    '<p>a <span class="a b"></span></p>',
    'should support `class` shortcuts',
  );

  t.equal(
    micromark('a $span(class=a class="b c" .d.e)', options({ '*': h })),
    '<p>a <span class="a b c d e"></span></p>',
    'should support `class` shortcuts after `class` attributes',
  );

  t.test('spec for growi plugin', (t) => {
    t.equal(
      micromark('a $lsx(/Sandbox)', options()),
      '<p>a </p>',
      'should support name with slash',
    );

    t.equal(
      micromark('a $lsx(key=value, reverse)', options()),
      '<p>a </p>',
      'should support name=value and an attribute w/o value',
    );

    t.equal(
      micromark('a $lsx(key=value, reverse, reverse2)', options()),
      '<p>a </p>',
      'should support consecutive attributes w/o value',
    );

    t.equal(
      micromark('a $lsx(/Sandbox, key=value, reverse)', options()),
      '<p>a </p>',
      'should support name=value after an empty value attribute',
    );

    t.end();
  });

  t.end();
});

/** @type {Handle} */
function abbr(d) {
  if (d.type !== DirectiveType.Text) return false;

  this.tag('<abbr');

  if (d.attributes && 'title' in d.attributes) {
    this.tag(` title="${this.encode(d.attributes.title)}"`);
  }

  this.tag('>');
  this.raw(d.label || '');
  this.tag('</abbr>');
}

/** @type {Handle} */
function youtube(d) {
  const attrs = d.attributes || {};
  const v = attrs.v;
  /** @type {string} */
  let prop;

  if (!v) return false;

  const list = [
    `src="https://www.youtube.com/embed/${this.encode(v)}"`,
    'allowfullscreen',
  ];

  if (d.label) {
    list.push(`title="${this.encode(d.label)}"`);
  }

  // eslint-disable-next-line no-restricted-syntax
  for (prop in attrs) {
    if (prop !== 'v') {
      list.push(`${this.encode(prop)}="${this.encode(attrs[prop])}"`);
    }
  }

  this.tag(`<iframe ${list.join(' ')}>`);

  if (d.content) {
    this.lineEndingIfNeeded();
    this.raw(d.content);
    this.lineEndingIfNeeded();
  }

  this.tag('</iframe>');
}

/** @type {Handle} */
function h(d) {
  const content = d.content || d.label;
  const attrs = d.attributes || {};
  /** @type {Array.<string>} */
  const list = [];
  /** @type {string} */
  let prop;

  // eslint-disable-next-line no-restricted-syntax
  for (prop in attrs) {
    if (own.call(attrs, prop)) {
      list.push(`${this.encode(prop)}="${this.encode(attrs[prop])}"`);
    }
  }

  this.tag(`<${d.name}`);
  if (list.length > 0) this.tag(` ${list.join(' ')}`);
  this.tag('>');

  if (content) {
    if (d.type === 'containerGrowiPluginDirective') this.lineEndingIfNeeded();
    this.raw(content);
    if (d.type === 'containerGrowiPluginDirective') this.lineEndingIfNeeded();
  }

  if (!htmlVoidElements.includes(d.name)) this.tag(`</${d.name}>`);
}

/**
 * @param {HtmlOptions} [options]
 */
function options(options) {
  return {
    allowDangerousHtml: true,
    extensions: [syntax()],
    htmlExtensions: [html(options)],
  };
}

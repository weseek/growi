<div class="panel panel-default">
  <div class="panel-body">

# Table of contents

```
@[toc]
```

@[toc]

  </div>
</div>

# :pencil: Block Elements

## Headers Heading

Write `#` per level at the beginnning

```
# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6
```

### Header 3

#### Header 4

##### Header 5

###### Header 6

## Block paragraph

It will be paragraph in between blank line

```
paragraph1
(Blank line)
paragraph2
```

paragraph1

paragraph2

## Br break(new line)

Write two  half spaces`` before break 
***This behavior is Editable by option***

```
hoge
fuga(two space)
piyo
```

hoge
fuga
piyo

## Blockquotes quotes

Write`>`at the beginning. Write multiple `>` quotes for nest.
先頭に`>`を記述します。ネストは`>`を多重に記述します。

```
> qupte
> qupte
>> multiple quote
```

> qupte
> qupte
>> multiple qupte

## Code

`` `back quote` `` three back qupte or wrap three of tildes

```
print 'hoge'
```

### syntax highlight and file name

- corresponding [highlight.js Demo](https://highlightjs.org/static/demo/) of common category


~~~
```javascript:mersenne-twister.js
function MersenneTwister(seed) {
  if (arguments.length == 0) {
    seed = new Date().getTime();
  }

  this._mt = new Array(624);
  this.setSeed(seed);
}
```
~~~

```javascript:mersenne-twister.js
function MersenneTwister(seed) {
  if (arguments.length == 0) {
    seed = new Date().getTime();
  }

  this._mt = new Array(624);
  this.setSeed(seed);
}
```

### Inline code

It will be Inline code wrapped word by `` `Back quote` ``

```
This is `Inline Code`.
```

This is  `Inline Code`.

## pre arranged text

It can show code block by four half space or tab

```
    class Hoge
        def hoge
            print 'hoge'
        end
    end
```

    class Hoge
        def hoge
            print 'hoge'
        end
    end

## Hr Horizon

Write three Underscores `_`, or asterisks`*`.

```
***
___
---
```

***
___
---



# :pencil: Typography

## Strong

### em

wrap by asterisks`*` or unserscore`_`.

```
This is *Italic* .
This is _Italic_ .
```

This is *Italic* .
This is _Italic_ .

### strong

Wrap by two asterisks`*`or unserscores`_`

```
This is **bold**.
This is __bold__.
```

This is **bold**.
This is __bold__.

### em + strong

アスタリスク`*`もしくはアンダースコア`_`3個で文字列を囲みます。

```
これは ***イタリック＆ボールド*** です
これは ___イタリック＆ボールド___ です
```

これは ***イタリック＆ボールド*** です
これは ___イタリック＆ボールド___ です

# :pencil: Images

`![Alt文字列](URL)` で`<img>`タグを挿入できます。

```markdown
![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")
```

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

画像の大きさなどの指定をする場合はimgタグを使用します。

```html
<img src="https://octodex.github.com/images/dojocat.jpg" width="200px">
```

<img src="https://octodex.github.com/images/dojocat.jpg" width="200px">


# :pencil: Link

## Markdown 標準

`[表示テキスト](URL)`でリンクに変換されます。

```
[Google](https://www.google.co.jp/)
```

[Google](https://www.google.co.jp/)

## Crowi 互換

```
[/Sandbox]
&lt;/user/admin1>
```

[/Sandbox]
</user/admin1>

## Pukiwiki like linker

(available by [weseek/growi-plugin-pukiwiki-like-linker
](https://github.com/weseek/growi-plugin-pukiwiki-like-linker) )

最も柔軟な Linker です。
記述中のページを基点とした相対リンクと、表示テキストに対するリンクを同時に実現できます。

```
[[./Bootstrap3]]
Bootstrap3のExampleは[[こちら>./Bootstrap3]]
```

[[../user]]
Bootstrap3のExampleは[[こちら>./Bootstrap3]]

# :pencil: Lists

## Ul 箇条書きリスト

ハイフン`-`、プラス`+`、アスタリスク`*`のいずれかを先頭に記述します。
ネストはタブで表現します。

```
- リスト1
    - リスト1_1
        - リスト1_1_1
        - リスト1_1_2
    - リスト1_2
- リスト2
- リスト3
```

- リスト1
    - リスト1_1
        - リスト1_1_1
        - リスト1_1_2
    - リスト1_2
- リスト2
- リスト3

## Ol 番号付きリスト

`番号.`を先頭に記述します。ネストはタブで表現します。
番号は自動的に採番されるため、すべての行を1.と記述するのがお勧めです。

```
1. 番号付きリスト1
    1. 番号付きリスト1-1
    1. 番号付きリスト1-2
1. 番号付きリスト2
1. 番号付きリスト3
```

1. 番号付きリスト1
    1. 番号付きリスト1-1
    1. 番号付きリスト1-2
1. 番号付きリスト2
1. 番号付きリスト3


## タスクリスト

```
- [ ] タスク 1
    - [x] タスク 1.1
    - [ ] タスク 1.2
- [x] タスク2
```

- [ ] タスク 1
    - [x] タスク 1.1
    - [ ] タスク 1.2
- [x] タスク2


# :pencil: Table

## Markdown 標準

```markdown
| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       | This        | This         |
| column     | column      | column       |
| will       | will        | will         |
| be         | be          | be           |
| left       | right       | center       |
| aligned    | aligned     | aligned      |

OR

Left align | Right align | Center align
:--|--:|:-:
This       | This        | This
column     | column      | column
will       | will        | will
be         | be          | be
left       | right       | center
aligned    | aligned     | aligned
```

| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       | This        | This         |
| column     | column      | column       |
| will       | will        | will         |
| be         | be          | be           |
| left       | right       | center       |
| aligned    | aligned     | aligned      |

## TSV (crowi-plus 独自記法)

```
::: tsv
Content Cell  Content Cell
Content Cell  Content Cell
:::
```

::: tsv
Content Cell Content Cell
Content Cell Content Cell
:::

## TSV ヘッダ付き (crowi-plus 独自記法)

```
::: tsv-h
First Header Second Header
Content Cell Content Cell
Content Cell Content Cell
:::
```

::: tsv-h
First Header Second Header
Content Cell Content Cell
Content Cell Content Cell
:::

## CSV (crowi-plus 独自記法)

```
::: csv
Content Cell,Content Cell
Content Cell,Content Cell
:::
```

::: csv
Content Cell,Content Cell
Content Cell,Content Cell
:::

## CSV ヘッダ付き (crowi-plus 独自記法)

```
::: csv-h
First Header,Second Header
Content Cell,Content Cell
Content Cell,Content Cell
:::
```

::: csv-h
First Header,Second Header
Content Cell,Content Cell
Content Cell,Content Cell
:::


# :pencil: Footnote

脚注への参照[^1]を書くことができます。また、インラインの脚注^[インラインで記述できる脚注です]を入れる事も出来ます。

長い脚注は[^longnote]のように書くことができます。

[^1]: 1つめの脚注への参照です。

[^longnote]: 脚注を複数ブロックで書く例です。

    後続の段落はインデントされて、前の脚注に属します。


# :pencil: Emoji

See [emojione](https://www.emojione.com/)

:smiley: :smile: :laughing: :innocent: :drooling_face:

:family: :family_man_boy: :family_man_girl: :family_man_girl_girl: :family_woman_girl_girl:

:thumbsup: :thumbsdown: :open_hands: :raised_hands: :point_right:

:apple: :green_apple: :strawberry: :cake: :hamburger:

:basketball: :football: :baseball: :volleyball: :8ball:

:hearts: :broken_heart: :heartbeat: :heartpulse: :heart_decoration:

:watch: :gear: :gem: :wrench: :envelope:


# :heavy_plus_sign: More..

- Try to attach Bootstrap3 Tags?
    - :arrow_right: [/Sandbox/Bootstrap3]
- Try to draw Diagrams?
    - :arrow_right: [/Sandbox/Diagrams]
- Try to write Math Formulas?
    - :arrow_right: [/Sandbox/Math]

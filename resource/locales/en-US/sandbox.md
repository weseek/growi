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

Write `#` per level at the beginning

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

Paragraphs are created by inserting blank lines.

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

Write `>` at the beginning. Write multiple `>` quotes for nest.

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

Enclose the string with one asterisk `*` or one underscore `_`.

```
This is *Italic* .
This is _Italic_ .
```

This is *Italic* .
This is _Italic_ .

### strong

Enclose the string with two asterisks `*` or underscores `_`.

```
This is **bold**.
This is __bold__.
```

This is **bold**.
This is __bold__.

### em + strong

Enclose the string with three asterisks `*` or underscores `_`.

```
This is ***Italic&Bold***.
This is ___Italic&Bold___.
```

This is ***Italic&Bold***.
This is ___Italic&Bold___.

# :pencil: Images

You can insert `<img>` tag using `![Alt string](URL)`.

```markdown
![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")
```

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Use the img tag to set the size of the image.

```html
<img src="https://octodex.github.com/images/dojocat.jpg" width="200px">
```

<img src="https://octodex.github.com/images/dojocat.jpg" width="200px">


# :pencil: Link

## Markdown standard

You can convert to link using `[Display text](URL)`.

```
[Google](https://www.google.co.jp/)
```

[Google](https://www.google.co.jp/)

## Crowi compatibility

```
[/Sandbox]
&lt;/user/admin1>
```

[/Sandbox]
</user/admin1>

## Pukiwiki like linker

(available by [weseek/growi-plugin-pukiwiki-like-linker
](https://github.com/weseek/growi-plugin-pukiwiki-like-linker) )

This is the most flexible linker.
You can show relative link based on the page being described and display-text link at the same time.

```
[[./Bootstrap3]]
Example of Bootstrap3 is[[here>./Bootstrap3]]
```

[[../user]]
Example of Bootstrap3 is[[here>./Bootstrap3]]

# :pencil: Lists

## Ul Bulleted list

Enter either hyphen `-`, plus` + `, or asterisk` * `at the beginning.
Nests are represented by tabs.

```
- List1
    - List1_1
        - List1_1_1
        - List1_1_2
    - List1_2
- List2
- List3
```

- List1
    - List1_1
        - List1_1_1
        - List1_1_2
    - List1_2
- List2
- List3

## Ol Numbered List

Describe `number.` at the beginning. Nests are represented by tabs.
The number is automatically assigned, so it is recommended to write all lines as 1.

```
1. Numbered list 1
    1. Numbered list 1-1
    1. Numbered list 1-2
1. Numbered list 2
1. Numbered list 3
```

1. Numbered list 1
    1. Numbered list 1-1
    1. Numbered list 1-2
1. Numbered list 2
1. Numbered list 3


## Task list

```
- [ ] Task 1
    - [x] Task 1.1
    - [ ] Task 1.2
- [x] Task2
```

- [ ] Task 1
    - [x] Task 1.1
    - [ ] Task 1.2
- [x] Task2


# :pencil: Table

## Markdown Standard

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

## TSV (crowi-plus original notation)

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

## TSV with header (crowi-plus original notation)

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

## CSV (crowi-plus original notation)

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

## CSV with header (crowi-plus original notation)

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

You can write a reference [^1] to a footnote. You can also add an inline footnote^[Inline_footnote].

Long footnotes can be written as [^longnote].

[^1]: A_reference_to_the_first_footnote.

[^longnote]: An_example_of_writing_a_footnote_in_multiple_blocks.

    Subsequent paragraphs are indented and belong to the previous footnote.


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

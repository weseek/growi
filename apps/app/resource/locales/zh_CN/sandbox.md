# :memo: Table of Contents

Add `ToC` after some `#` signs.
`Table of Contents` or `Table-of-Contents` is also OK.

```
# ToC
```

## ToC

# :memo: Block Elements

## Headers

Add one `#` per level at the start of the line

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

Pararaphs are created by inserting a newline character
A paragraph can be created by pressing Enter at the end of the previous paragraph.

```
paragraph1
(Blank line)
paragraph2
```

paragraph1

paragraph2

## Br new line

Add two spaces before break.
***This behaviour can be modified in the options menu.***

```
hoge
fuga(two spaces)
piyo
```

hoge
fuga
piyo

## Blockquotes

Add one `>` per level at the start of the line

```
> quote
> quote
>> nested quotes
```

> quote
> quote
>> nested quotes

## Code

Wrap code with three back quotes or tildes.

```
print 'hoge'
```

### Syntax highlight and file name

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

Words wrapped by `` `back quotes` `` will be formatted as inline code.

```
This is `Inline Code`.
```

This is  `Inline Code`.

## Pre-arranged text

Code blocks should be preceded by four spaces or one tab.

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

## Horizontal Line

Write three underscores `_`, or asterisks`*`.

```
***
___
---
```

***
___
---



# :memo: Typography

## Strong Text

### Italic

To italicize text, add One asterisk or underscores before and after a word or phrase.

```
This is *Italic* .
This is _Italic_ .
```

This is *Italic* .
This is _Italic_ .

### Bold

To bold text, add two asterisks or underscores before and after a word or phrase.

```
This is **bold**.
This is __bold__.
```

This is **bold**.
This is __bold__.

### Bold + Italic

To bold and italicize text, add three asterisks or underscores before and after a word or phrase.

```
This is ***Italic & Bold***.
This is ___Italic & Bold___.
```

This is ***Italic & Bold***.
This is ___Italic & Bold___.

# :memo: Images

You can insert `<img>` tag using `![description](URL)`.

```markdown
![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")
```

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

The size of the image can be set by using an HTML image tag

```html
<img src="https://octodex.github.com/images/dojocat.jpg" width="200px">
```

<img src="https://octodex.github.com/images/dojocat.jpg" width="200px">


# :memo: Link

## Markdown standard

You can create links using `[Display text](URL)`.

```
[Google](https://www.google.co.jp/)
```

[Google](https://www.google.co.jp/)

## Pukiwiki like linker

This is the most flexible linker.
Both the page description and link address can be displayed on the page.

```
[[./Bootstrap4]]
Example of Bootstrap4 is [[here>./Bootstrap4]]
```

[[./Bootstrap4]]  
Example of Bootstrap4 is [[here>./Bootstrap4]]

# :memo: Lists

## Ul Bulleted list

To create an unordered list, add dashes (-), asterisks (*), or plus signs (+) in front of line items. 
Items can be nested using indentation.

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

To create an ordered list, add line items with numbers followed by periods. 
The numbers don’t have to be in numerical order, but the list should start with the number one.

```
1. Number list 1
    1. Number list 1-1
    1. Number list 1-2
1. Number list 2
1. Number list 3
```

1. Number list 1
    1. Number list 1-1
    1. Number list 1-2
1. Number list 2
1. Number list 3


## Check list

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


# :memo: Table

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

## TSV

~~~
``` tsv
Content Cell	Content Cell
Content Cell	Content Cell
```
~~~

``` tsv
Content Cell	Content Cell
Content Cell	Content Cell
```

## TSV with header

~~~
``` tsv-h
First Header	Second Header
Content Cell	Content Cell
Content Cell	Content Cell
```
~~~

``` tsv-h
First Header	Second Header
Content Cell	Content Cell
Content Cell	Content Cell
```

## CSV

~~~
``` csv
Content Cell,Content Cell
Content Cell,Content Cell
```
~~~

``` csv
Content Cell,Content Cell
Content Cell,Content Cell
```

## CSV with header

~~~
``` csv-h
First Header,Second Header
Content Cell,Content Cell
Content Cell,Content Cell
```
~~~

``` csv-h
First Header,Second Header
Content Cell,Content Cell
Content Cell,Content Cell
```


# :memo: Footnote

You can write a reference [^1] to a footnote.

Long footnotes can be written as [^longnote].

[^1]: A_reference_to_the_first_footnote.

[^longnote]: An_example_of_writing_a_footnote_in_multiple_blocks.

    Subsequent paragraphs are indented and belong to the previous footnote.


# :memo: Emoji

:smiley: :smile: :laughing: :innocent: :drooling_face:

:family: :man-boy: :man-girl: :man-girl-girl: :woman-girl-girl:

:+1: :-1: :open_hands: :raised_hands: :point_right:

:apple: :green_apple: :strawberry: :cake: :hamburger:

:basketball: :football: :baseball: :volleyball: :8ball:

:hearts: :broken_heart: :heartbeat: :heartpulse: :heart_decoration:

:watch: :gear: :gem: :wrench: :email:


# :heavy_plus_sign: More..

- Try to attach Bootstrap4 Tags?
    - :arrow_right: [/Sandbox/Bootstrap4]
- Try to draw Diagrams?
    - :arrow_right: [/Sandbox/Diagrams]
- Try to write Math Formulas?
    - :arrow_right: [/Sandbox/Math]

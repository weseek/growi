<div class="panel panel-default">
  <div class="panel-body">

# 目次

```
@[toc]
```

@[toc]

  </div>
</div>

# :pencil: Block Elements

## Headers 見出し

先頭に`#`をレベルの数だけ記述します。

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

## Block 段落

空白行を挟むことで段落となります。aaaa

```
段落1
(空行)
段落2
```

段落1

段落2

## Br 改行

改行の前に半角スペース`  `を2つ記述します。
***この挙動は、オプションで変更可能です***

```
hoge
fuga(スペース2つ)
piyo
```

hoge
fuga
piyo

## Blockquotes 引用

先頭に`>`を記述します。ネストは`>`を多重に記述します。

```
> 引用
> 引用
>> 多重引用
```

> 引用
> 引用
>> 多重引用

## Code コード

`` `バッククオート` `` 3つ、あるいはダッシュ`~`３つで囲みます。

```
print 'hoge'
```

### シンタックスハイライトとファイル名

- [highlight.js Demo](https://highlightjs.org/static/demo/) の common カテゴリ内の言語に対応しています


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

### インラインコード

`` `バッククオート` `` で単語を囲むとインラインコードになります。

```
これは `インラインコード`です。
```

これは `インラインコード`です。

## pre 整形済みテキスト

半角スペース4個もしくはタブで、コードブロックをpre表示できます

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

## Hr 水平線

アンダースコア`_` 、アスタリスク`*`を3つ以上連続して記述します。

```
***
___
---
```

***
___
---



# :pencil: Typography

## 強調
### em

アスタリスク`*`もしくはアンダースコア`_`1個で文字列を囲みます。

```
これは *イタリック* です
これは _イタリック_ です
```

これは *イタリック* です
これは _イタリック_ です

### strong

アスタリスク`*`もしくはアンダースコア`_`2個で文字列を囲みます。

```
これは **ボールド** です
これは __ボールド__ です
```

これは **ボールド** です
これは __ボールド__ です

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
Content Cell 	Content Cell
Content Cell 	Content Cell
:::
```

::: tsv
Content Cell	Content Cell
Content Cell	Content Cell
:::

## TSV ヘッダ付き (crowi-plus 独自記法)

```
::: tsv-h
First Header	Second Header
Content Cell	Content Cell
Content Cell	Content Cell
:::
```

::: tsv-h
First Header	Second Header
Content Cell	Content Cell
Content Cell	Content Cell
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


# :pencil: Math

See [MathJax](https://www.mathjax.org/).

## Inline Formula

When $a \ne 0$, there are two solutions to \(ax^2 + bx + c = 0\) and they are
  $$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$

## The Lorenz Equations

$$
\begin{align}
\dot{x} & = \sigma(y-x) \\
\dot{y} & = \rho x - y - xz \\
\dot{z} & = -\beta z + xy
\end{align}
$$


## The Cauchy-Schwarz Inequality

$$
\left( \sum_{k=1}^n a_k b_k \right)^{\!\!2} \leq
 \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)
$$

## A Cross Product Formula

$$
\mathbf{V}_1 \times \mathbf{V}_2 =
 \begin{vmatrix}
  \mathbf{i} & \mathbf{j} & \mathbf{k} \\
  \frac{\partial X}{\partial u} & \frac{\partial Y}{\partial u} & 0 \\
  \frac{\partial X}{\partial v} & \frac{\partial Y}{\partial v} & 0 \\
 \end{vmatrix}
$$


## The probability of getting $\left(k\right)$ heads when flipping $\left(n\right)$ coins is:

$$
P(E) = {n \choose k} p^k (1-p)^{ n-k}
$$

## An Identity of Ramanujan

$$
\frac{1}{(\sqrt{\phi \sqrt{5}}-\phi) e^{\frac25 \pi}} =
     1+\frac{e^{-2\pi}} {1+\frac{e^{-4\pi}} {1+\frac{e^{-6\pi}}
      {1+\frac{e^{-8\pi}} {1+\ldots} } } }
$$

## A Rogers-Ramanujan Identity

$$
1 +  \frac{q^2}{(1-q)}+\frac{q^6}{(1-q)(1-q^2)}+\cdots =
    \prod_{j=0}^{\infty}\frac{1}{(1-q^{5j+2})(1-q^{5j+3})},
     \quad\quad \text{for $|q|<1$}.
$$

## Maxwell's Equations

$$
\begin{align}
  \nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} & = \frac{4\pi}{c}\vec{\mathbf{j}} \\
  \nabla \cdot \vec{\mathbf{E}} & = 4 \pi \rho \\
  \nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} & = \vec{\mathbf{0}} \\
  \nabla \cdot \vec{\mathbf{B}} & = 0
\end{align}
$$

<!-- Reset MathJax -->
<div class="clearfix"></div>


# :pencil: UML Diagrams

See [PlantUML](http://plantuml.com/).

## シーケンス図

@startuml
skinparam sequenceArrowThickness 2
skinparam roundcorner 20
skinparam maxmessagesize 60
skinparam sequenceParticipant underline

actor User
participant "First Class" as A
participant "Second Class" as B
participant "Last Class" as C

User -> A: DoWork
activate A

A -> B: Create Request
activate B

B -> C: DoWork
activate C
C --> B: WorkDone
destroy C

B --> A: Request Created
deactivate B

A --> User: Done
deactivate A

@enduml

<!-- Reset PlantUML -->
<div class="clearfix"></div>


## クラス図

@startuml

class BaseClass

namespace net.dummy #DDDDDD {
    .BaseClass <|-- Person
    Meeting o-- Person

    .BaseClass <|- Meeting
}

namespace net.foo {
  net.dummy.Person  <|- Person
  .BaseClass <|-- Person

  net.dummy.Meeting o-- Person
}

BaseClass <|-- net.unused.Person

@enduml

<!-- Reset PlantUML -->
<div class="clearfix"></div>


## コンポーネント図

@startuml

package "Some Group" {
  HTTP - [First Component]
  [Another Component]
}

node "Other Groups" {
  FTP - [Second Component]
  [First Component] --> FTP
}

cloud {
  [Example 1]
}


database "MySql" {
  folder "This is my folder" {
    [Folder 3]
  }
  frame "Foo" {
    [Frame 4]
  }
}


[Another Component] --> [Example 1]
[Example 1] --> [Folder 3]
[Folder 3] --> [Frame 4]

@enduml

<!-- Reset PlantUML -->
<div class="clearfix"></div>


## ステート図


@startuml
scale 600 width

[*] -> State1
State1 --> State2 : Succeeded
State1 --> [*] : Aborted
State2 --> State3 : Succeeded
State2 --> [*] : Aborted
state State3 {
  state "Accumulate Enough Data\nLong State Name" as long1
  long1 : Just a test
  [*] --> long1
  long1 --> long1 : New Data
  long1 --> ProcessData : Enough Data
}
State3 --> State3 : Failed
State3 --> [*] : Succeeded / Save Result
State3 --> [*] : Aborted

@enduml

<!-- Reset PlantUML -->
<div class="clearfix"></div>

# :pencil: blockdiag

See [blockdiag](http://blockdiag.com/).

## blockdiag

<!-- Resize blockdiag -->
<div style="max-width: 600px">

::: blockdiag
blockdiag {
   A -> B -> C -> D;
   A -> E -> F -> G;
}
:::

</div>

## seqdiag

<!-- Resize blockdiag -->
<div style="max-width: 600px">

::: seqdiag
seqdiag {
  browser  -> webserver [label = "GET /index.html"];
  browser <-- webserver;
  browser  -> webserver [label = "POST /blog/comment"];
              webserver  -> database [label = "INSERT comment"];
              webserver <-- database;
  browser <-- webserver;
}
:::

</div>

## actdiag

<!-- Resize blockdiag -->
<div style="max-width: 600px">

::: actdiag
actdiag {
  write -> convert -> image

  lane user {
     label = "User"
     write [label = "Writing reST"];
     image [label = "Get diagram IMAGE"];
  }
  lane actdiag {
     convert [label = "Convert reST to Image"];
  }
}
:::

</div>

## nwdiag

<!-- Resize blockdiag -->
<div style="max-width: 600px">

::: nwdiag
nwdiag {
  network dmz {
      address = "210.x.x.x/24"

      web01 [address = "210.x.x.1"];
      web02 [address = "210.x.x.2"];
  }
  network internal {
      address = "172.x.x.x/24";

      web01 [address = "172.x.x.1"];
      web02 [address = "172.x.x.2"];
      db01;
      db02;
  }
}
:::

</div>

## rackdiag

<!-- Resize blockdiag -->
<div style="max-width: 600px">

::: rackdiag
rackdiag {
  // define height of rack
  8U;

  // define rack items
  1: UPS [2U];
  3: DB Server
  4: Web Server
  5: Web Server
  6: Web Server
  7: Load Balancer
  8: L3 Switch
}
:::

</div>

## packetdiag

<!-- Resize blockdiag -->
<div style="max-width: 600px">

::: packetdiag
packetdiag {
  colwidth = 32
  node_height = 72

  0-15: Source Port
  16-31: Destination Port
  32-63: Sequence Number
  64-95: Acknowledgment Number
  96-99: Data Offset
  100-105: Reserved
  106: URG [rotate = 270]
  107: ACK [rotate = 270]
  108: PSH [rotate = 270]
  109: RST [rotate = 270]
  110: SYN [rotate = 270]
  111: FIN [rotate = 270]
  112-127: Window
  128-143: Checksum
  144-159: Urgent Pointer
  160-191: (Options and Padding)
  192-223: data [colheight = 3]
}
:::

</div>

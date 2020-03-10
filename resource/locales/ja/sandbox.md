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
# 見出し1
## 見出し2
### 見出し3
#### 見出し4
##### 見出し5
###### 見出し6
```

### 見出し3
#### 見出し4
##### 見出し5
###### 見出し6

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

`` `バッククオート` `` 3つ、あるいはチルダ`~`３つで囲みます。

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


# :pencil: diagrams.net(旧 Draw.io)

See [diagrams.net](https://diagrams.net)

## アクティビティ図

::: drawio
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
:::

## クラス図

::: drawio
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
:::


## AWS 構成図

::: drawio
3Zhdb5swFIZ/TS4XYRswuUzSr0mtVqmtejkZOASvgJHtfO3Xz+YjgdJqiaa1SbnBvD7G9vv4IJsRmeeba8nK9E7EkI2wE29G5GKEMfa9wNyssq0VhFyvVhaSx422Fx74b2hEp1GXPAbVC9RCZJqXfTESRQGR7mlMSrHuhyUi6/dasgUMhIeIZUP1mcc6rdUA071+A3yRtj0jf1LX5KwNbmaiUhaLdUcilyMyl0LoupRv5pBZ91pf6nZX79TuBiah0G80eFIgf4S/rCfYyVhowFRBI+xFIi9FYZthr3WvVaqYGxZy2+xRsugFpCndPN7dmtu0LJtuMxZBaswE2Te4HR7ezXA3cqW3ravGi9IW883CrpsxWyt3nIuQ24BZwrNsLjIhq2CSJOBHkdGVluIFOjUxnYSOY2pWIDU30G7tPO+F4pqLwsSEQmuRmwCmynp1JHwDZoizerS2HWzeNRR1JnENIgcttyakafANuQ3aZnG7Ph37vk8d6pAgoBO3rl131k3TIO0smVZjjZGLXUd7mKbQ2Ng+dvD+M+6n7xatUqDVgXTJ8XQVGZLFlJqEeYtsUl2fRRb7Y+QEJCCIBhQ5ExL0OBPHOReyqsre6VKnRjM+Vu4dxtg9nnEkFgXXYgh6ThFBV6cHmgRj10XUo9jByA1c90vk8/TeJvQ107Bm2wNpe8fTZiX/uWg6GRD3psSZeadH/C+p7RNvTAhxzaedUuoFwbkgf34w4i3Lw5gdSNw/nnhWvf9nsiyimtWBH/TCjPSzgCP/FXH3SwC/YJqFTMGBsOnxsONtwXIRh0PK1q/Z5PRymzgni3qwfW86X7FsCS113KcSLeXKWnNhd7hQxFN7nNlnk1GuuO2yqo+ZSqtg9BYXPwogTHYuQzw49Lzy2AxELGUEnc28OXgxuQA93AF2SEjIzB5j1X/7EdYNfJqcuU/uB/nUnpfP1ijvo4xC52SUNzTK/yij8DkZ5Q+Nov/HKPO4/2lT1XX+fZHLPw==
:::



# :pencil: PlantUML

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

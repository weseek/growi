---
marp: true
---

Marp
===

![h:250](https://avatars1.githubusercontent.com/u/20685754?v=4)

##### Markdown プレゼンテーションのエコシステム

###### by Marp チーム ([@marp-team][marp-team])

[marp-team]: https://github.com/marp-team
[marpit]: https://github.com/marp-team/marpit
[marp-core]: https://github.com/marp-team/marp-core
[marp-cli]: https://github.com/marp-team/marp-cli
[marp-vscode]: https://github.com/marp-team/marp-vscode

---

# 特徴

- :memo: **プレーンな Markdown 記法でスライドデッキを記述する** (CommonMark)
- :factory: [Marpit framework][marpit]上にビルトする: スライドデッキを作成するための真新しい洗練されたフレームワーク
- :gear: [Marp Core][marp-core]: npmを通じてコアエンジンやビルトインテーマを使いやすくする
- :tv: [Marp CLI][marp-cli]: マークうダウン形式をHTML、PDF、PPTX、画像に変換する
- :vs: [Marp for VS Code][marp-vscode]: 編集中のデッキをライブプレビューする
- and more...

---

# スライドの記述のしかた

やり方はとてもシンプルです。ハイフン記号 (e.g. `---`)でページを分割します。

```markdown
# スライド 1

本文

---

# スライド 2

本文
```

---

# Directives

Marp では美しいスライド作成を支援するため、**"Directives"**　という拡張構文を用意しています。

Markdown 記法の本文の前に挿入します:

```
---
theme: default
---
```

または本文のどこかにHTML形式で記述します:

```html
<!-- theme: default -->
```

https://marpit.marp.app/directives

---

## [グローバル Directives](https://marpit.marp.app/directives?id=global-directives)

- `theme` : テーマを選ぶ
- `size` : スライドのサイズを `16:9` か `4:3` で選択する *(Marpit frameworkを除く)* 
- [`headingDivider`](https://marpit.marp.app/directives?id=heading-divider) : 任意の見出しの前にスライドのページ区切りを挿入する

```
---
theme: gaia
size: 4:3
---

# 内容
```

> Marp では以下の[built-in themes in Marp Core](https://github.com/marp-team/marp-core/tree/master/themes#readme)が利用可能 : `default` `gaia` `uncover`.

---

## [ローカル Directives](https://marpit.marp.app/directives?id=local-directives)

スライドページ毎に設定できる値一覧

- `paginate` : `true`でページ数を表示する
- `header` : ヘッダーの内容を指定する
- `footer` : フッターの内容を指定する
- `class` : 現在のスライドにHTMLのクラス設定をする
- `color` : 文字色を指定する
- `backgroundColor` : 背景色を指定する

---

### スポット Directives

ローカル構文は**任意のページとそれ以降のページ**に適用されます。 

`_class`のようにアンダーバーと接頭辞を使うことで一つのページに適用できます。

![bg right 95%](https://marpit.marp.app/assets/directives.png)

---

### 活用例

このページは [defined in Marp built-in theme](https://github.com/marp-team/marp-core/tree/master/themes#readme)で色彩を反転させています。

<!-- _class: invert -->

```html
<!-- _class: invert -->
```

---

# [画像イメージのための構文](https://marpit.marp.app/image-syntax)

You can resize image size and apply filters through keywords: `width` (`w`), `height` (`h`), and filter CSS keywords.

```markdown
![width:100px height:100px](image.png)
```

```markdown
![blur sepia:50%](filters.png)
```

Please refer [resizing image syntax](https://marpit.marp.app/image-syntax?id=resizing-image) and [a list of CSS filters](https://marpit.marp.app/image-syntax?id=image-filters).

![w:100px h:100px](https://avatars1.githubusercontent.com/u/20685754?v=4) ![w:100 h:100 blur sepia:50%](https://avatars1.githubusercontent.com/u/20685754?v=4)

---

# [背景イメージのための構文](https://marpit.marp.app/image-syntax?id=slide-backgrounds)

You can set background image for a slide by using `bg` keyword.

```markdown
![bg opacity](https://yhatt-marp-cli-example.netlify.com/assets/gradient.jpg)
```

![bg opacity](https://yhatt-marp-cli-example.netlify.com/assets/gradient.jpg)

---

## Multiple backgrounds ([Marpit's advanced backgrounds](https://marpit.marp.app/image-syntax?id=advanced-backgrounds))

Marp can use multiple background images.

```markdown
![bg blur:3px](https://fakeimg.pl/800x600/fff/ccc/?text=A)
![bg blur:3px](https://fakeimg.pl/800x600/eee/ccc/?text=B)
![bg blur:3px](https://fakeimg.pl/800x600/ddd/ccc/?text=C)
```

Also can change alignment direction by including `vertical` keyword.

![bg blur:3px](https://fakeimg.pl/800x600/fff/ccc/?text=A)
![bg blur:3px](https://fakeimg.pl/800x600/eee/ccc/?text=B)
![bg blur:3px](https://fakeimg.pl/800x600/ddd/ccc/?text=C)

---

## [Split background](https://marpit.marp.app/image-syntax?id=split-backgrounds)

Marp can use [Deckset](https://docs.deckset.com/English.lproj/Media/01-background-images.html#split-slides) style split background(s).

Make a space for background by `bg` + `left` / `right` keywords.

```markdown
![bg right](image.jpg)
```

![bg right](https://images.unsplash.com/photo-1568488789544-e37edf90eb67?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=720&ixlib=rb-1.2.1&q=80&w=640)

<!-- _footer: "*Photo by [Mohamed Nohassi](https://unsplash.com/@coopery?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)*" -->

---

## [Fragmented list](https://marpit.marp.app/fragmented-list)

Marp will parse a list with asterisk marker as the fragmented list for appearing contents one by one. (_**Only for exported HTML** by [Marp CLI][marp-cli] / [Marp for VS Code][marp-vscode]_)

```markdown
# Bullet list

- One
- Two
- Three

---

# Fragmented list

* One
* Two
* Three
```

---

## Math typesetting (only for [Marp Core][marp-core])

[KaTeX](https://katex.org/) math typesetting such as $ax^2+bc+c$ can use with [Pandoc's math syntax](https://pandoc.org/MANUAL.html#math).

$$I_{xx}=\int\int_Ry^2f(x,y)\cdot{}dydx$$

```tex
$ax^2+bc+c$
```
```tex
$$I_{xx}=\int\int_Ry^2f(x,y)\cdot{}dydx$$
```

---

## Auto-scaling (only for [Marp Core][marp-core])

*Several built-in themes* are supported auto-scaling for code blocks and math typesettings.

```text
Too long code block will be scaled-down automatically. ------------>
```
```text
Too long code block will be scaled-down automatically. ------------------------>
```
```text
Too long code block will be scaled-down automatically. ------------------------------------------------>
```

---

##### <!--fit--> Auto-fitting header (only for [Marp Core][marp-core])
##### <!--fit--> is available by annotating `<!--fit-->` in headings.

<br />

```html
## <!--fit--> Auto-fitting header (only for Marp Core)
```

---

## [Theme CSS](https://marpit.marp.app/theme-css)

Marp uses `<section>` as the container of each slide. And others are same as styling for plain Markdown. The customized theme can use in [Marp CLI][marp-cli] and [Marp for VS Code][marp-vscode].

```css
/* @theme your-theme */

@import 'default';

section {
  /* Specify slide size */
  width: 960px;
  height: 720px;
}

h1 {
  font-size: 30px;
  color: #c33;
}
```

---

## [Tweak style in Markdown](https://marpit.marp.app/theme-css?id=tweak-style-through-markdown)

`<style>` tag in Markdown will work in the context of theme CSS.

```markdown
---
theme: default
---

<style>
section {
  background: yellow;
}
</style>

Re-painted yellow background, ha-ha.
```

> You can also add custom styling by class like `section.custom-class { ... }`.
> Apply style through `<!-- _class: custom-class -->`.

---

## [Scoped style](https://marpit.marp.app/theme-css?id=scoped-style)

If you want one-shot styling for current page, you can use `<style scoped>`.

```markdown
<style scoped>
a {
  color: green;
}
</style>

![Green link!](https://marp.app/)
```

<style scoped>
a { color: green; }
</style>

---

# Enjoy writing slides! :v: <!--fit-->

##### ![w:1em h:1em](https://avatars1.githubusercontent.com/u/20685754?v=4)  Marp: Markdown presentation ecosystem — https://marp.app/

###### by Marp Team ([@marp-team][marp-team])
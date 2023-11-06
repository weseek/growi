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

Marp では美しいスライド作成を支援するため、**"Directives"**　という拡張機能を用意しています。

Markdown 記法の本文の前に挿入します:

```
---
theme: default
---
```

または本文のどこかに HTML 形式で記述します:

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

> Marp では以下の [built-in themes in Marp Core](https://github.com/marp-team/marp-core/tree/master/themes#readme) が利用可能 : `default` `gaia` `uncover`.

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

`_class` のようにアンダーバーと接頭辞を使うことで一つのページに適用できます。

![bg right 95%](https://marpit.marp.app/assets/directives.png)

---

### 活用例

このページは [defined in Marp built-in theme](https://github.com/marp-team/marp-core/tree/master/themes#readme) で色彩を反転させています。

<!-- _class: invert -->

```html
<!-- _class: invert -->
```

---

# [画像イメージのための構文](https://marpit.marp.app/image-syntax)

以下のキーワードを使って、画像サイズの変更やフィルターを適用できます
 : `width` (`w`)、`height` (`h`)、CSS のフィルター

```markdown
![width:100px height:100px](image.png)
```

```markdown
![blur sepia:50%](filters.png)
```

[resizing image syntax](https://marpit.marp.app/image-syntax?id=resizing-image) と [a list of CSS filters](https://marpit.marp.app/image-syntax?id=image-filters)を指定してください。

![w:100px h:100px](https://avatars1.githubusercontent.com/u/20685754?v=4) ![w:100 h:100 blur sepia:50%](https://avatars1.githubusercontent.com/u/20685754?v=4)

---

# [背景イメージのための構文](https://marpit.marp.app/image-syntax?id=slide-backgrounds)

 `bg` でスライドに背景イメージを設定できます。

```markdown
![bg opacity](https://yhatt-marp-cli-example.netlify.com/assets/gradient.jpg)
```

![bg opacity](https://yhatt-marp-cli-example.netlify.com/assets/gradient.jpg)

---

## 複数の背景イメージを利用する ([Marpit's advanced backgrounds](https://marpit.marp.app/image-syntax?id=advanced-backgrounds))

Marp では複数の背景イメージを利用できます。

```markdown
![bg blur:3px](https://fakeimg.pl/800x600/fff/ccc/?text=A)
![bg blur:3px](https://fakeimg.pl/800x600/eee/ccc/?text=B)
![bg blur:3px](https://fakeimg.pl/800x600/ddd/ccc/?text=C)
```

 `vertical` で文字列の方向を変えることも可能です。

![bg blur:3px](https://fakeimg.pl/800x600/fff/ccc/?text=A)
![bg blur:3px](https://fakeimg.pl/800x600/eee/ccc/?text=B)
![bg blur:3px](https://fakeimg.pl/800x600/ddd/ccc/?text=C)

---

## [背景を分割する](https://marpit.marp.app/image-syntax?id=split-backgrounds)

Marp では背景を分割する[Deckset](https://docs.deckset.com/English.lproj/Media/01-background-images.html#split-slides) を利用できます。

 `bg` + `left` / `right` で背景イメージを配置するスぺースを指定可能です。

```markdown
![bg right](image.jpg)
```

![bg right](https://images.unsplash.com/photo-1568488789544-e37edf90eb67?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=720&ixlib=rb-1.2.1&q=80&w=640)

<!-- _footer: "*Photo by [Mohamed Nohassi](https://unsplash.com/@coopery?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)*" -->

---

## [フラグメントリスト](https://marpit.marp.app/fragmented-list)

Marp ではアスタリスク記号をつけることで、各コンテンツをフラグメントリストとして分類します。 (_**HTML 形式のエクスポートのみ** by [Marp CLI][marp-cli] / [Marp for VS Code][marp-vscode]_)

```markdown
# 箇条書きリスト

- 1
- 2
- 3

---

# フラグメントリスト

* 1
* 2
* 3
```

---

## Math typesetting ( [Marp Core][marp-core] のみ)

[KaTeX](https://katex.org/) math typesetting は $ax^2+bc+c$ のように [Pandoc's math syntax](https://pandoc.org/MANUAL.html#math)で利用できます。

$$I_{xx}=\int\int_Ry^2f(x,y)\cdot{}dydx$$

```tex
$ax^2+bc+c$
```
```tex
$$I_{xx}=\int\int_Ry^2f(x,y)\cdot{}dydx$$
```

---

## オートスケーリング ( [Marp Core][marp-core] のみ)

*Several built-in themes* ではコードブロックと typesettings でオートスケーリングされます。

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

##### <!--fit--> ヘッダーの自動調整 ( [Marp Core][marp-core] のみ)
##### <!--fit--> `<!--fit-->` のような注釈をヘッダーに入れることで利用可能です。

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
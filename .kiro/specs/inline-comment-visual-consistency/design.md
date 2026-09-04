# Technical Design: inline-comment-visual-consistency

## Overview

実装済みのインラインコメント機能の表示部分を、GROWI 本体の見た目の仕組みに合わせ直す。変更は3つの領域に分かれる。

1. 作成 UI（作成の起点ボタン、入力フォーム、操作ボタン群）に Bootstrap 5 のクラスとテーマ由来の CSS カスタムプロパティを与える
2. 本文中のハイライト色を、テーマ側から上書きできる 1 つのカスタムプロパティに寄せ、選択中・入力中・保存後の3状態で同じ色にする
3. インラインコメントの一覧項目を通常コメントと同じ箱で表示し、1つの一覧に混ぜて並べる

アンカーの計算、あいまい一致、再アンカー、選択→起点→フォームの2段階の流れは変更しない。

### Amend target

- 対象スペック: `.kiro/specs/inline-comment/`
- 戻す先: `requirements.md`（Requirement 11/12/13 を末尾に追加）、`design.md`（Components and Interfaces / File Structure Plan / Data Contracts）、`research.md`（下記 Design Rationale を移す）

### Goals

- テーマを切り替えたときに、インラインコメント関連の表示がすべて追随する
- ハイライト色の指定箇所を 1 つのカスタムプロパティに集約し、テーマが上書きできるようにする
- コメントの箱の見た目を持つ場所を 1 つにし、インラインコメントと通常コメントで共有する

### Non-Goals

- `CodeMirrorEditorComment` のエディタ本体の作り替え（決定5参照。ツールバー・行番号の余白のみ非表示にする最小限の型追加のみ行う）
- 通常コメント側の振る舞いの変更（見た目も変えない）
- インラインコメントの編集・削除の追加

---

## 現状の計測結果（変更の根拠）

モックアップと実装画面から画素値を直接読み取った値。design.md にこの表を残すのは、「テーマ由来の値に置き換える」という指示だけでは、どの要素がどれだけずれているのかが実装時に伝わらないため。

### 作成の起点ボタン

| 項目 | モックアップ `01-selection-popup.png` | 実装 `screenshot-01-selection-popup.png` |
|---|---|---|
| 背景 | `#FFFFFF` | `#EFEFEF` |
| 境界線 | 1px `#E4E3E1`〜`#E7E6E4` | 上左 2px `#545454` / 下右 2px `#000000`（立体的な段差） |
| 角丸 | 約 4px | なし（0px） |
| 文字色 | `#716F6D` | ほぼ黒 |
| 箱の寸法 | 幅 約153px × 高さ 約32px | 幅 約83px × 高さ 約31px |
| アイコン | ラベル左に枠付きアイコン1つ | なし |
| ラベル | 「コメントする」（翻訳キー経由） | `Comment`（ベタ書き） |
| 表示位置 | 選択行の**上**、約11px 空けて | 選択行の**下**、次の行に重なる |

実装側の `#EFEFEF` ＋ 上左 `#545454` / 下右 `#000000` の段差は、Chrome が CSS クラスの付いていない `<button>` に与える既定の見た目そのもの。実際 `SelectionActionButton.tsx` の JSX は `<button type="button" data-testid="..." onClick={onCommit}>Comment</button>` で、`className` が 1 つも付いていない。

### 入力フォーム

| 項目 | モックアップ `02` / `03` | 実装 `screenshot-02` / `screenshot-03` |
|---|---|---|
| 外枠 | 1px `#ACD1E2`（薄い青）、角丸 約4px | 1px `#E7E7E5`、角丸あり（`rounded` = `0.375rem`）、影あり（`shadow-sm`） |
| 背景 | `#FFFFFF` | `#FFFFFF` |
| 高さ | 1行時 約61px / 2行時 約80px | 2行時 約220px |
| 幅 | 本文カラム全幅（`03` で 約1023px） | 内容に応じた幅（約585px） |
| 行番号の余白 | なし | あり（`#FAF9F8` の帯に「1」「2」） |
| 編集ツールバー | なし | あり（+ / Aa / 絵文字 / 表 / 図 / 貼り付け / 案内 の7個） |
| 投稿者アイコン | 入力欄の左に円形 約32px | なし |
| 折りたたみ操作 | 入力欄の左端に下向き山形の記号 | なし |
| メンション操作 | 白背景・薄い灰色の枠（`#E4E3E1`）・記号は灰色（`#AEACAA`）の四角ボタン | 濃い灰色の塗り（`#767371`）＝ reactstrap の `DropdownToggle` 既定（`btn btn-secondary`） |
| 送信操作 | 青の塗り（`#377AAC`）＋白い三角の記号 | 文字だけの `Comment` ボタン、CSS クラスなし（無効時は灰色文字） |
| 取り消し操作 | なし（モックアップは送信のみ） | 文字だけの `Cancel` ボタン、CSS クラスなし |
| 引用文の表示 | フォーム内には出ない | 枠なし・字下げなしの素の文字列として先頭に出る |

`InlineCommentForm.tsx` の外側の箱だけは `bg-body border rounded shadow-sm p-2` が付いていて、これはすでにテーマに追随する（`--bs-body-bg` / `--bs-border-color` 由来）。壊れているのは中身の `inline-comment-form-quote` と `inline-comment-form-actions`、および 2 つの `<button>` で、この 3 つのクラス名に対応する CSS 規則はリポジトリ内に存在しない（`grep -rn 'inline-comment' --include='*.scss'` の結果が 0 件）。

### ハイライト色 — 状態ごとに3種類

| 状態 | モックアップ | 実装（実測） | 実装の仕組み |
|---|---|---|---|
| テキスト選択中（起点ボタン表示中） | `#F9EFBC` | `#3367D1` | ブラウザ既定の `::selection`。機能側は何もしていない |
| 入力フォームを開き、入力欄にカーソルを移した後 | `#F9EFBC` | `#FFFFFF`（何も塗られない） | ブラウザ上の選択が解除され、代わりに塗るものが無い |
| 保存済みコメントの対象範囲 | `#F9EFBC` | `#FAF5E8` | `::highlight(growi-inline-comment)` に `var(--bs-warning-bg-subtle, rgba(255, 193, 7, 0.35))` |

3 状態それぞれを別に計測した結果なので、「保存済みのハイライト色だけ直す」と、選択中は青のまま、入力中は無色のままになる。

`--bs-warning-bg-subtle` がテーマに追随しないことも確認済み。`packages/core-styles/scss/bootstrap/theming/_root.scss` は `@if $color == 'primary' or $color == 'secondary'` で絞り込んでいるため、`warning` 系の `-bg-subtle` はテーマ側の明るい配色では一切再生成されない。16 のテーマのどれを選んでも `#faf5e8` のまま。

### 一覧項目

| 項目 | モックアップ `04` | 実装 `screenshot-04` |
|---|---|---|
| 箱の背景 | `#F9F9F7`（塗りつぶし） | 塗りなし（`#FFFFFF` のまま） |
| 箱の境界線 | 1px `#EFEFEE` | なし |
| 角丸 | 約 8px | なし |
| 箱の幅 | 本文カラム全幅（約1058px） | 箱そのものが無い |
| 投稿者アイコン | 円形 約28px | なし |
| 投稿者名 | 太字 `#3E3B38` | なし |
| 投稿日時 | `#AEACAA`、本文より小さい、時計の記号付き | なし |
| 種別の見出し | 記号＋太字「Inline Comment」 | なし |
| 引用文 | 左に 3px の淡い黄色（`#EFE8B8`）の縦線、文字は `#716F6D` | なし（一覧項目には引用文が出ない） |
| 本文 | `#3E3B38` | `#403C39`（`RevisionRenderer` 由来、ほぼ同じ） |
| 未解決の表示 | なし | 濃い山吹色（`#C99818`）の丸い札 |
| 解決トグル | なし | 灰色の枠線ボタン（`#F1F1F1` 背景） |
| 返信の入力欄 | 通常コメントと同じ箱に「Reply...」 | 素の `<textarea>` と青い `Reply` ボタン（`#58AACB`） |
| 一覧内の位置 | 通常コメントと同じ一覧の中 | 「Commments」見出しの**上**、区切り線の外側 |

一覧内の位置は `PageView.tsx` の 271〜277 行で決まっている。`<InlineCommentList>` は `<Comments>` の兄弟要素として、`page-comments-row mt-5 py-4 border-top` の外・`<h4>Comments</h4>` の前に置かれている。見出しも区切り線も持たない位置なので、本文とコメント欄のあいだに宛先不明の塊が出る形になっている。

### 各対比の判定

| 画面 | 判定 | 最大の理由（1行） |
|---|---|---|
| 01 作成の起点 | 一致しない | CSS クラスの付いていない `<button>` で、ブラウザ既定の見た目がそのまま出ている |
| 02 フォーム展開 | 一致しない | 高さ 61px の1行の入力欄に対し、行番号の余白と7個のツールバーを含む 220px の縦長の板が出ている |
| 03 複数行入力 | 一致しない | 02 と同じ。加えて対象範囲のハイライトが完全に消える |
| 04 一覧 | 一致しない | 箱そのもの（背景・枠・角丸）と投稿者アイコン・名前・日時のすべてが無い |

---

## Boundary Commitments

### This Spec Owns

- `SelectionActionButton` の見た目と文言
- `InlineCommentForm` の引用表示・操作ボタン群の見た目と文言
- `InlineCommentHighlight` のハイライト色の出どころ
- 作成中の範囲を示すハイライト（新規）
- `InlineCommentList` の一覧項目の構造
- コメントの箱を担う共有コンポーネント `CommentCard` の切り出し
- `InlineCommentService.listByPageId()` の応答に投稿者情報を足すこと
- `PageComment` が 2 種類のコメントを 1 つの一覧に並べること

### Out of Boundary

- アンカーの計算・照合・再アンカー（`AnchorResolver`, `quote-matcher`, `rendered-text`, `normalized-offset-mapping`）
- 選択の監視と 3 段階の状態遷移（`use-text-selection`, `SelectionCapture` の状態機械そのもの）
- 表示位置の計算（`SelectionPopover`, `use-popper-position`, `selection-virtual-element`）
- 作成・返信・解決の API の入出力（投稿者情報の追加を除く）
- `CodeMirrorEditorComment` および `packages/editor` の中身（ただし決定5により、既存の`hideToolbar`を`CodeMirrorEditorProps`型へ公開する1点のみ許可する。エディタ本体のロジック・拡張構成には手を入れない）
- 未解決・解決済みの札の配色（`bg-warning text-dark` のまま。理由は下記 `InlineCommentItem` の節）
- 返信入力欄を素の `<textarea>` から別の部品に替えること
- `Comment.module.scss` の中身（`CommentCard` の設計により無変更で済む）

### Allowed Dependencies

- `apps/app/src/client/components/PageComment/_comment-inheritance.scss` の共有定義（`%bg-comment` / `%comment-section` / `%user-picture`）
- `@growi/ui/dist/components` の `UserPicture`
- `apps/app/src/components/User/Username.tsx`
- `apps/app/src/client/components/FormattedDistanceDate.jsx`
- `apps/app/src/styles/_marker.scss` の `--grw-marker-bg` / `--grw-marker-bg-yellow`
- `@growi/core/dist/models` の `serializeUserSecurely`

### Revalidation Triggers

- `_comment-inheritance.scss` の `%bg-comment` / `%comment-section` の中身が変わったとき（両方のコメントの箱が同時に変わる）
- `packages/core-styles/scss/bootstrap/theming/_root.scss` の primary/secondary の絞り込みが外れたとき（`--bs-warning-*` がテーマ対応になり、専用トークンを持つ理由が薄れる）
- `Comments` / `PageComment` の呼び出し元が増えたとき（共有リンク画面に混ざらないことを再確認する）

---

## Architecture

### 決定1: ハイライトは 1 つのトークンと 2 つの仕組みで塗る

**新しいトークンを 1 つ置く。**

```scss
// apps/app/src/styles/_marker.scss の末尾に追記
// （このファイルは apps/app/src/styles/style-app.scss:29 の `@import 'marker';`
//  経由で文書全体に読み込まれるので、CSS モジュールの局所化を受けない）
:root {
  // 既定では検索キーワードのマーカー色をそのまま使う。
  // テーマ側でこのプロパティを上書きすれば、検索マーカーとは別の色にできる。
  --grw-inline-comment-marker-bg: var(--grw-marker-bg, var(--grw-marker-bg-yellow));
}
```

`--grw-marker-bg` / `--grw-marker-bg-yellow` はどちらも `[data-bs-theme=light|dark]` 配下や `:root[data-bs-theme=...]` 配下で宣言されているが、CSS カスタムプロパティの値の解決は使う側の要素で起きるので、`:root` に置いた 1 段の間接参照でも正しくテーマの値に解決される。

なぜ `--grw-marker-bg` を直接使わず 1 段はさむのか。テーマは検索マーカーの色を目的に `--grw-marker-bg` を上書きしている（16 テーマ中 12 テーマが cyan / red / blue / green に変えている）。インラインコメントのハイライトを直接そこに縛ると、「検索マーカーは水色にしたいが、インラインコメントは黄色のままにしたい」という指定ができなくなる。1 段はさむと、既定では要望どおり検索マーカーと同じ色になり、必要なテーマだけ別の色にできる。間接参照は 1 段で、消費側は 2 か所しかない。

**塗る仕組みは 2 つ必要で、片方だけでは足りない。**

CSS のハイライトの描画順は「カスタムハイライト（`::highlight()`）＜ 綴り・文法 ＜ 対象テキスト ＜ 選択（`::selection`）」で、`::selection` が最も手前になる。したがってテキストを選択している最中は、`::highlight()` に何を指定してもブラウザ既定の青（実測 `#3367D1`）が上に乗る。選択中も黄色にするには `::selection` 側も指定する。

一方、入力フォームを開いて入力欄にカーソルを移すと文書上の選択が解除されるため（実測: `screenshot-03` の対象行は `#FFFFFF`）、`::selection` だけでは入力中に何も塗られない。`SelectionCapture` は `composing` の段で `committedRange`（`liveRange.cloneRange()` の結果）を保持しているので、これを `CSS.highlights` に登録すれば入力中も塗れる。

```
selecting  段: ::selection で塗る（+ 保険として ::highlight にも liveRange を登録）
composing  段: ::highlight(growi-inline-comment-pending) に committedRange を登録して塗る
保存済み    : ::highlight(growi-inline-comment) に解決済み Range を登録して塗る（既存）
```

3 つとも同じ `--grw-inline-comment-marker-bg` を読むので、色は 1 か所で決まる。

**検索マーカーの「ペンで塗った」見え方は引き継げない。** 検索側は `linear-gradient(transparent 40%, <色> 40%)` で行の下 60% だけを塗っている（`SearchPageBase.module.scss:11-14`）。理由は 2 つあり、どちらも技術的に確定している。(1) `::highlight()` が指定できるのは `color` / `background-color` / 文字装飾 / 影に限られ、`background-image` は使えないのでグラデーションが描けない。(2) モックアップ側の塗りは行の箱を上から下まで一様に塗っている（`01-selection-popup.png` の `x=300` 縦走査で `y229`〜`y255` がすべて `#F9EFBC`）。よってグラデーションではなく平らな塗りにする。共通化するのは色の値だけ。

**既定色の値については Open Question 1 を参照。**

### 決定2: コメントの箱は「枠だけを持つコンポーネント」を切り出して両者で使う

通常コメントの箱の見た目は、すでに `_comment-inheritance.scss` の `%bg-comment` / `%comment-section` / `%user-picture` に 1 か所で置かれていて、`Comment.module.scss` と `CommentEditor.module.scss` の 2 つの CSS モジュールが `@use './comment-inheritance'` して `@extend` している。つまり「複数のモジュールから同じプレースホルダを `@extend` する」形はこのリポジトリで実際に動いている。プレースホルダ自身は CSS を出力しないので、3 つ目のモジュールが加わっても重複した規則は増えない。

そこで、箱と見出し行だけを持つ `CommentCard` を切り出し、中身は差し込みで受け取る形にする。

```
apps/app/src/client/components/PageComment/CommentCard/
├── index.ts            ← CommentCard と CommentCardProps だけを再公開
├── CommentCard.tsx     ← CSS モジュールを持たない
└── CommentCard.spec.tsx
```

**`CommentCard` は自分の CSS モジュールを持たない。** ここが設計の要になる。

`Comment.module.scss` の規則はすべて `.comment-styles { :global(.page-comment) { … } }` の入れ子で書かれている。もし `CommentCard` が自分のモジュールクラス（`.comment-card-styles`）を最も外側に置き、`Comment.tsx` がそれに置き換わると、`page-comment-newer` の不透明度、`page-comment-revision` の色、`page-comment-meta` の色、`page-comment-body .wiki` の段落余白のどれも一致しなくなる。さらに `CommentCard.module.scss` の側は、自分では描いていない要素（リビジョンへのリンクは `headerEnd` で外から来る）の規則を持つことになる。モジュールの効く範囲と、差し込み口の切れ目がずれる。

そこで `CommentCard` は `.page-comment` から下の DOM だけを描き、外側のモジュールの入れ物は使う側がそれぞれ用意する。使う側のモジュールが `comment-inheritance` を `@use` して `%bg-comment` / `%comment-section` / `%user-picture` を `@extend` する。これは `Comment.module.scss` と `CommentEditor.module.scss` がすでにやっている形そのもので、3 つ目が加わるだけ。プレースホルダは自分では CSS を出力しないので、規則が重複して増えることもない。

結果として `Comment.tsx` の `.comment-styles` の入れ物はそのまま残り、`Comment.module.scss` の既存の規則は 1 つも書き換えずに一致し続ける。インラインコメント側は 3 つ目の入れ物として `InlineCommentItem.module.scss` を持つ。

```jsx
// Comment.tsx — 外側の入れ物は今のまま
<div className={styles['comment-styles']}>
  <CommentCard … />
</div>

// InlineCommentItem.tsx — 自分のモジュールの入れ物を持つ
<div className={styles['inline-comment-item-styles']}>
  <CommentCard … />
</div>
```

```scss
// InlineCommentItem.module.scss（新規）
@use 'client/components/PageComment/comment-inheritance';

.inline-comment-item-styles {
  :global(.page-comment) {
    :global(.bg-comment) { @extend %bg-comment; }
    :global(.user-picture) { @extend %user-picture; }
    :global(.page-comment-main) { @extend %comment-section; }
    // 通常コメント側にしか無い規則（リビジョンリンクの色など）は写さない
  }

  :global(.inline-comment-quote) {
    border-left: 3px solid var(--grw-inline-comment-marker-bg);
  }
}
```

`apps/app/next.config.ts:51` が `loadPaths: [path.resolve(__dirname, 'src')]` を設定しているので、`@use 'client/components/PageComment/comment-inheritance'` の形でどこからでも解決できる（`Comment.module.scss:2` の `@use 'styles/variables'` がすでにこの解決に頼っている）。

なお `_comment-inheritance.scss` はこれで 3 つのモジュールから使われることになるが、置き場所は `client/components/PageComment/` のままにする。移すと既存 2 つの `@use` を書き換えることになり、この amend の対象（インラインコメントの見た目）から外れた差分が増える。

```ts
export type CommentCardProps = {
  /** アンカーリンクの対象になる id（通常コメントは comment の _id） */
  id?: string;
  /**
   * 投稿者。UserPicture / Username にそのまま渡す（この2つのコンポーネントは
   * どちらも既に「投稿者情報が無い」場合の見た目を自前で持っている ——
   * UserPicture は既定アイコン、Username は "(anyone)" — ので、CommentCard
   * 側で「渡さない」判断はしない。通常コメントの現在の挙動（isPopulated が
   * false でも UserPicture・Username を常に描く）と、CommentCard を使った後
   * の挙動を一致させるための決定）
   */
  creator: IUserHasId | Ref<IUser> | null | undefined;
  /** 型は Date だが実体は ISO 文字列で届く。FormattedDistanceDate に素通しする */
  createdAt: Date | string;
  /** page-comment に付く修飾クラス（page-comment-me / -newer / -older など） */
  rootClassName?: string;
  /**
   * 見出し行の右側。通常コメントはリビジョンへのリンク、インラインは解決トグル。
   * 右寄せ（ms-auto）や間隔（gap-2 等）は CommentCard 側では付けない —
   * 呼び出し側ごとに必要な余白が異なる（後述）ため、渡す ReactNode 自身に
   * 呼び出し側が包んで指定する。
   */
  headerEnd?: ReactNode;
  /** 本文の前。インラインコメントの引用文がここに入る */
  beforeBody?: ReactNode;
  /** 本文 */
  children: ReactNode;
  /** 本文の後。通常コメントの (edited) 表示や操作ボタン群 */
  footer?: ReactNode;
};
```

`CommentCard` が持つのは次の DOM だけ。現在 `Comment.tsx:158-194` にある構造をそのまま移す（最も外側のモジュールの入れ物は含めない）。

```jsx
<>
  <div id={id} className={`page-comment flex-column ${rootClassName ?? ''}`}>
    <div className="page-comment-main bg-comment rounded mb-2">
      <div className="d-flex align-items-center">
        <UserPicture user={creator} className="me-2" />
        <div className="small fw-bold me-3"><Username user={creator} /></div>
        <Link href={`#${id}`} prefetch={false} className="small page-comment-revision">
          <FormattedDistanceDate id={id} date={createdAt} />
        </Link>
        {headerEnd}
      </div>
      {beforeBody}
      <div className="page-comment-body">{children}</div>
      {footer}
    </div>
  </div>
</>
```

**なぜ `creator === null` で `UserPicture` / `Username` を隠さないのか（この節はレビューで見つかった design.md 自身の矛盾を訂正したもの）。** 現在の `Comment.tsx:161-164` は `creator` が `undefined`（`isPopulated(comment.creator)` が false のとき）でも `UserPicture` と `Username` を無条件に描いている。`UserPicture` は既定アイコンを、`Username` は "(anyone)" を出す作りに既になっているため、これは「何も表示しない」ではなく「代替表示をする」という既存の挙動である。CommentCard がここで `creator != null` 条件を追加して丸ごと隠すと、投稿者が populate されていない通常コメント（レアだが起こり得る）の見た目が変わり、**Requirement 13.9（通常コメントの一覧項目の見た目を変えない）に違反する。** そこで CommentCard は条件分岐をせず、`creator` をそのまま両コンポーネントに渡すだけにする。`UserPicture`（`Partial<IUser> | Ref<IUser> | null` を受け付ける）・`Username`（`IUserHasId | Ref<IUser>` を受け付け、`null`/未 populate は自前で "(anyone)" にフォールバックする）のどちらも `null` を安全に扱えるため、この変更で崩れるものはない。

**なぜ `headerEnd` に `ms-auto` の入れ物を付けないのか（同じくレビューで見つかった矛盾の訂正）。** 通常コメントの現在の見出し行は、リビジョン履歴アイコンを `<span className="ms-2">`（投稿日時のすぐ右、0.5rem 空けて）で包んでいる（`Comment.tsx:175`）。一方インラインコメントの解決トグル（決定6・`InlineCommentItem`側の`headerEnd`)は見出し行の右端に寄せたい。この2つは同じ余白では両立しないので、CommentCard 側で `ms-auto` を固定するのは誤りだった。`headerEnd` はラップせずにそのまま描き、必要な余白（`ms-2` か `ms-auto` か）は各呼び出し側が `headerEnd` に渡す ReactNode 自身に付ける。通常コメント側は `<span className="ms-2">...</span>` を、インラインコメント側（決定6の`InlineCommentItem`のJSXにある`headerEnd`）は `<span className="ms-auto d-flex align-items-center gap-2">...</span>` のように、それぞれ自分の余白を明示する。

**なぜ `Comment.tsx` を共有せず、枠だけを切り出すのか。** `Comment.tsx` は本文の編集・削除、リビジョンへのリンク、返信の扱いを一緒に抱えている。インラインコメントは `revision: Ref<IRevision>` を持たず（持っているのは `anchorOriginRevisionId: string`）、v1 では編集・削除の対象外なので、`Comment.tsx` をそのまま使うとインラインコメント側で使わない分岐を通すことになる。一方、クラス名を写し取って並行実装にすると、`_comment-inheritance.scss` を直したときに片方だけ変わる状態が起き得る（型でもテストでも結び付いていないため気付けない）。差が出るのは見出し行の右端と本文の前後の中身だけで、箱そのものは同一なので、箱を差し込み口付きのコンポーネントとして 1 つ持つのが最も小さい形になる。`coding-style.md` の「共有の抽象を無理に押し付けない」は、振る舞いが分かれる部分（編集・削除・リビジョン）を共有しないことで満たしている。

`Comment.tsx` は `CommentCard` を使う側に書き換える。`headerEnd` にリビジョンへのリンクと吹き出し（`ms-2` の入れ物ごと）、`footer` に `page-comment-meta` と `CommentControl` を渡す。`creator` には現在の `isPopulated(comment.creator) ? comment.creator : undefined` の結果をそのまま渡す（`?? null` で変換しない — `undefined` のままで `UserPicture` / `Username` は現在と同じフォールバックをする）。`rootClassName` には現在の `getRootClassName()` の結果から `'page-comment flex-column'` を除いた修飾部分だけを渡す。通常コメントの出力 DOM は変わらないので、Requirement 13.9 を満たす。

### 決定3: インラインコメントは props で渡し、`PageComment` 自身では取得しない

`Comments`（`apps/app/src/client/components/Comments.tsx`）は `ShareLinkPageView.tsx:46` からも読み込まれている。もし `PageComment` の中で `useSWRxInlineComments(pageId)` を呼ぶと、共有リンク画面でもその取得が走る。API 側は `certifySharedPage` を通していないので実データは返らないが、Requirement 6 の「共有リンク画面にインラインコメントの UI を出さない」を構造として担保できなくなる。

そこで、取得は `PageView.tsx` 側で行い、値として下に渡す。`coding-style.md` の「実行する側は対象の集合を入力として受け取る（自分で `import` しない）」がそのまま当てはまる。

**この取得はすでに `PageView.tsx:179-181` に存在する。** 再アンカーのために `useSWRxInlineComments` が呼ばれていて、共有リンクのときは `null` を渡して取得しない形（`isSharedPageView ? null : (page?._id ?? null)`）になっている。

```ts
const { data: inlineComments } = useSWRxInlineComments(
  isSharedPageView ? null : (page?._id ?? null),
);
```

つまり必要なのは、この `inlineComments` を `Comments` に渡す props を 1 本足すことだけで、新しい取得は要らない。取得が 1 か所のままなので、共有リンクのときに取得しない条件も 1 か所のままになる。

```
PageView.tsx
  ├─ useSWRxInlineComments(isSharedPageView ? null : page._id)   ← 既存。増やさない
  └─ <Comments inlineComments={inlineComments} ... />            ← props を 1 本足す
        └─ <PageComment inlineComments={inlineComments} ... />
              └─ 通常コメントと混ぜて createdAt 昇順に並べる
```

`ShareLinkPageView.tsx` は `inlineComments` を渡さない。省略時は空配列として扱う。

`PageComment.tsx` の並べ替えは、現在の `commentsFromOldest`（`[...comments].reverse()`）を、両方を含む 1 つの配列に置き換える。

**注意: `createdAt` は `Date` 型で宣言されているが、実際には文字列で届く。** `ICommentHasId` も `IInlineComment` も `createdAt: Date` と書いてあるが、値は `apiGet` / `apiv3Get` が返した JSON をそのまま持っているので中身は ISO 形式の文字列。`Comment.tsx:87-91` にこの食い違いを避けるための分岐が入っていて、`// TODO: fix so that comment.createdAt to be type Date` という注記も残っている。

```ts
      typeof comment.createdAt === 'string'
        ? parseISO(comment.createdAt)
        : comment.createdAt;
```

文字列どうしを `-` で引くと `NaN` になり、並べ替えが何もしないのと同じになる。現在の `PageComment.tsx` は `[...comments].reverse()` しかしていないのでこの問題に当たっていないが、今回は日時を比べるので必ず `Date` に直してから比べる。

```ts
type CommentListItem =
  | { kind: 'normal'; sortKey: number; comment: ICommentHasId }
  | { kind: 'inline'; sortKey: number; comment: InlineCommentWithReplies };

/** createdAt は Date 型で宣言されているが実体は ISO 文字列（Comment.tsx:87-91 参照）。 */
const toSortKey = (createdAt: Date | string): number =>
  (typeof createdAt === 'string' ? parseISO(createdAt) : createdAt).valueOf();

// 返信は従来どおり親の下にぶら下げるので、一覧に混ぜるのは起点だけ
const items: CommentListItem[] = [
  ...commentsExceptReply.map(c => ({ kind: 'normal' as const, sortKey: toSortKey(c.createdAt), comment: c })),
  ...inlineComments.map(c => ({ kind: 'inline' as const, sortKey: toSortKey(c.createdAt), comment: c })),
].sort((a, b) => a.sortKey - b.sortKey);
```

`CommentCard` の `createdAt` プロパティも同じ理由で `Date | string` を受け取る形にし、`FormattedDistanceDate` へは今 `Comment.tsx:172` が渡しているのと同じ生の値を渡す（`FormattedDistanceDate` 側が文字列を受け付けている前提を変えない）。

各項目は現在と同じ `page-comment-thread mb-2` のラッパの中に入れる。`InlineCommentList` は一覧の入れ物としての役目を失うので削除し、`InlineCommentItem` を `apps/app/src/features/inline-comment/client/components/InlineCommentItem/` に移して `PageComment` から使う。

`PageView.tsx` の 271〜277 行は次のようになる。

```jsx
<div id="comments-container" ref={commentsContainerRef}>
  <Comments
    pageId={page._id}
    pagePath={pagePath}
    revision={page.revision}
    inlineComments={inlineComments}
  />
</div>
```

---

## Components and Interfaces

### `SelectionActionButton`（見た目のみ変更）

現在: `<button type="button" data-testid="selection-action-button" onClick={onCommit}>Comment</button>`

変更後:

```jsx
<button
  type="button"
  data-testid="selection-action-button"
  className={`btn btn-sm shadow-sm d-inline-flex align-items-center gap-1 ${styles['selection-action-button']}`}
  onClick={onCommit}
>
  <span className="material-symbols-outlined fs-6">add_comment</span>
  {t('inline_comment.start_comment')}
</button>
```

`SelectionActionButton.module.scss`（新規）:

```scss
.selection-action-button {
  // テーマが必ず出力するプロパティだけを使う。
  // --bs-body-bg / --bs-body-color / --bs-border-color / --bs-secondary-bg は
  // core-styles/scss/bootstrap/theming/_root-light.scss と _root-dark.scss が
  // 16 テーマすべてで出力する（primary/secondary の絞り込みを受けない）。
  --bs-btn-bg: var(--bs-body-bg);
  --bs-btn-color: var(--bs-body-color);
  --bs-btn-border-color: var(--bs-border-color);
  --bs-btn-hover-bg: var(--bs-secondary-bg);
  --bs-btn-hover-color: var(--bs-body-color);
  --bs-btn-hover-border-color: var(--bs-border-color);
  --bs-btn-active-bg: var(--bs-tertiary-bg);
  --bs-btn-active-color: var(--bs-body-color);
  --bs-btn-active-border-color: var(--bs-border-color);
}
```

`btn-light` や `btn-secondary` を使わない理由: `light` / `secondary` のうち `secondary` はテーマごとに再生成されるが（`_root.scss` の絞り込みに入っている）実測値は濃い灰色 `#767371` で、モックアップの白背景・薄い枠とは別物。`light` はテーマごとに再生成されないので、テーマを変えても色が変わらない。`--bs-btn-*` を上書きする形は `SwitchingButtonGroup.module.scss:20-46` と `PageTreeItem.module.scss:31-32` がすでに使っている。

### `InlineCommentForm`（引用表示と操作ボタン群を変更）

外側の箱 `bg-body border rounded shadow-sm p-2` はそのまま。中身を次のように変える。

```jsx
<div className="inline-comment-form bg-body border rounded shadow-sm p-2" data-testid="inline-comment-form">
  <blockquote className={`small text-body-secondary mb-2 ps-2 ${styles['inline-comment-form-quote']}`}>
    {anchor.quote}
  </blockquote>
  <CodeMirrorEditorComment editorKey={editorKey} cmProps={cmProps} hideToolbar onSave={submitHandler} />
  {error != null && <span className="text-danger small">{error}</span>}
  <div className="d-flex align-items-center gap-2 mt-2">
    <MentionPickerButton onInsert={insertMention} />
    <button type="button" className="btn btn-sm btn-outline-secondary ms-auto" onClick={onCanceled}>
      {t('Cancel')}
    </button>
    <button
      type="button"
      className="btn btn-sm btn-primary"
      data-testid="inline-comment-submit-button"
      disabled={!canSubmit}
      onClick={submitHandler}
    >
      {t('page_comment.comment')}
    </button>
  </div>
</div>
```

`InlineCommentForm.module.scss`（新規）:

```scss
.inline-comment-form-quote {
  // 引用の左の縦線は、モックアップ 04 の実測 #EFE8B8 と同系。
  // マーカー色と同じ出どころにして、テーマを変えたときに引用線とハイライトが
  // ばらばらにならないようにする。
  border-left: 3px solid var(--grw-inline-comment-marker-bg);
}
```

`hideToolbar`は決定5（`packages/editor`の`CodeMirrorEditorProps`に追加）で新規に渡せるようになるprop。既存の`cmProps`（`useMemo(() => ({ onChange: ... }), [])`）に`basicSetup: { lineNumbers: false, foldGutter: false }`を追加し、行番号・折りたたみの余白も消す。通常コメント入力欄（`CommentEditor.tsx`）はどちらも渡さないため無変更。

`MentionPickerButton` の `DropdownToggle` に `color="link"` と `className="btn-sm text-body-secondary"` を渡し、既定の `btn-secondary`（実測 `#767371`）をやめる。

送信・取り消しに `btn-primary` / `btn-outline-secondary` を使う理由: `--bs-primary` と `--bs-secondary` はテーマごとに再生成される数少ない色（`theming/_root.scss` の絞り込みに入っている 2 つ）で、`--bs-btn-*` 一式も `theming/_buttons-light.scss` / `_buttons-dark.scss` がテーマごとに出力する。つまりこの 2 つのクラスはテーマ切り替えに追随する。

文言は `t()` 経由にする。`t('Cancel')` と `t('page_comment.comment')` は通常コメント入力欄が使っているものと同じキー（`CommentEditor.tsx:297, 310`）なので、そのまま流用する。返信ボタンも既存の `t('page_comment.reply')` を使う。

新規に必要なキーは `inline_comment.start_comment` / `inline_comment.resolved` / `inline_comment.unresolved` / `inline_comment.resolve` / `inline_comment.reopen` / `inline_comment.label`（決定6の種別ラベル、値: `Inline Comment`）の 6 個で、英語ファースト（`en_US` にだけ入れる）で足りる。

なお `page_comment.comment` の英語の値は現在 `"Commment"`（m が 1 つ多い）、`page_comment.comments` は `"Commments"` で、どちらも誤字が入っている。実装画面の見出しに「Commments」と出ているのはこれが理由。本スペックの対象外なので直さないが、流用するキーの値がこうなっていることは把握しておく。

### `InlineCommentHighlight`（色の出どころを変更）

```diff
       {`
         ::highlight(${HIGHLIGHT_NAME}) {
-          background-color: var(--bs-warning-bg-subtle, rgba(255, 193, 7, 0.35));
+          background-color: var(--grw-inline-comment-marker-bg);
         }
       `}
```

`rgba(255, 193, 7, 0.35)` のフォールバックは外す。`--grw-inline-comment-marker-bg` は `_marker.scss` が `:root` に必ず出力するので、フォールバックは到達しない死んだ指定になる（現在の `rgba(...)` もすでに到達していない）。フォールバックを残すと、色の直値がこの機能から消えたことをテストで確かめられなくなる。

Requirement 12.2 の「色の直値を使わない」は、`apps/app/src/features/inline-comment/` 配下を対象に「`#[0-9a-fA-F]{3,8}` / `rgb(` / `rgba(` に一致しない」ことを確かめる単体テストで担保する。現在この配下の直値は `InlineCommentHighlight.tsx:103` の 1 件だけなので、これを外せば 0 件になる。

### `PendingSelectionHighlight`（新規）

`SelectionCapture` が持つ範囲を、作成中のハイライトとして塗る。表示位置も状態も持たず、渡された `Range` を `CSS.highlights` に登録して `::selection` の規則を出すだけにする。`InlineCommentHighlight` と同じ形（`CSS.highlights` ＋ styled-jsx の global）にそろえる。

```
apps/app/src/features/inline-comment/client/components/PendingSelectionHighlight/
├── PendingSelectionHighlight.tsx
└── PendingSelectionHighlight.spec.tsx
```

```ts
type PendingSelectionHighlightProps = {
  /** 作成中の範囲。null のとき何も塗らない */
  range: Range | null;
  /** ::selection の上書きを効かせる対象。本文コンテナに限定する */
  containerRef: RefObject<HTMLElement | null>;
};
```

中身:

```tsx
const PENDING_HIGHLIGHT_NAME = 'growi-inline-comment-pending';
const SCOPE_ATTR = 'data-inline-comment-selection-scope';

// 副作用 1: range を CSS.highlights に登録し、後始末で delete する
//           （InlineCommentHighlight.tsx と同じ形）
// 副作用 2: containerRef.current に SCOPE_ATTR を付け、後始末で外す。
//           本文コンテナ（PageView.tsx:246 の <div ref={pageBodyContainerRef}>）は
//           id も class も持たないので、下の ::selection の規則が狙う目印を
//           この機能の側で付ける。PageView 側に手を入れずに済み、
//           このコンポーネントが消えたときに属性も消える。

return (
  <style jsx global>{`
    /* テキストを選択している最中は ::selection が ::highlight() より手前に
       描かれるため、選択中もマーカー色にするにはこちら側も指定する。
       目印を付けた本文コンテナの中だけに効かせるので、ページの他の場所の
       選択色は変わらない。このコンポーネントは SelectionCapture と一緒に、
       共有リンク画面と未ログイン時にはマウントされない。 */
    [${SCOPE_ATTR}] ::selection {
      background-color: var(--grw-inline-comment-marker-bg);
      color: var(--bs-body-color);
    }
    ::highlight(${PENDING_HIGHLIGHT_NAME}) {
      background-color: var(--grw-inline-comment-marker-bg);
    }
  `}</style>
);
```

`color: var(--bs-body-color)` を添える理由: `::selection` の背景だけを変えると、ブラウザが選択時に当てる文字色（多くの環境で白）が残り、淡い黄色の上に白い文字が乗って読めなくなる。背景と文字色は必ず対で指定する。

`SelectionCapture` からの渡し方（状態機械そのものは変えない）:

```jsx
// stage === 'selecting'
<>
  <PendingSelectionHighlight range={state.liveRange} containerRef={containerRef} />
  <SelectionPopover range={state.liveRange}>...</SelectionPopover>
</>

// stage === 'composing'
<>
  <PendingSelectionHighlight range={state.committedRange} containerRef={containerRef} />
  <SelectionPopover range={state.committedRange}>...</SelectionPopover>
</>
```

`stage === 'idle'` では `SelectionCapture` が `null` を返すので、登録も `::selection` の上書きも消える（Requirement 12.7）。

### `InlineCommentItem`（`InlineCommentList` から移動・構造を変更）

移動先: `apps/app/src/features/inline-comment/client/components/InlineCommentItem/`

```jsx
<CommentCard
  id={comment.id}
  creator={comment.creator}
  createdAt={comment.createdAt}
  rootClassName={isResolved ? 'inline-comment-item-resolved' : undefined}
  headerEnd={
    <span className="ms-auto d-flex align-items-center gap-2">
      <span
        data-testid="inline-comment-status"
        className={`badge ${isResolved ? 'bg-secondary' : 'bg-warning text-dark'}`}
      >
        {isResolved ? t('inline_comment.resolved') : t('inline_comment.unresolved')}
      </span>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleResolveToggle}>
        {isResolved ? t('inline_comment.reopen') : t('inline_comment.resolve')}
      </button>
    </span>
  }
  beforeBody={
    <>
      <div className="small fw-bold text-body-secondary d-flex align-items-center gap-1 mb-1">
        <span className="material-symbols-outlined fs-6">chat</span>
        {t('inline_comment.label')}
      </div>
      <blockquote className={`small text-body-secondary mb-2 ps-2 ${styles['inline-comment-quote']}`}>
        {comment.anchor.quote}
      </blockquote>
    </>
  }
>
  <RevisionRenderer rendererOptions={rendererOptions} markdown={comment.comment} additionalClassName="comment" />
</CommentCard>
```

（種別ラベル行の採否は「決定6」を参照。決定済み。）

3 点を現状から直している。

- `RevisionRenderer` に `additionalClassName="comment"` を渡す。通常コメントは `Comment.tsx:150` で渡しているので、現在は出力クラスが `wiki comment` と `wiki` に分かれ、`Comment.module.scss` の `p` / `blockquote` の余白の規則がインラインコメント側に効いていない。
- 引用文を `beforeBody` に出す（現在は一覧項目に引用文が出ない）。
- 種別ラベル行（`Inline Comment`）を引用文の前に出す（Requirement 13.10、決定6）。

**未解決の札の色は変えない。** `bg-warning text-dark` はそのまま残す。`warning` 系がテーマごとに再生成されない（`theming/_root.scss` の絞り込みが `primary` と `secondary` だけを通すため、16 テーマのどれでも実測 `#C99818` 固定）ことは確かで、記録として残す価値はある。ただし Requirement 11 の対象は作成の起点・入力フォーム・その操作ボタン群で、一覧項目の札は入っていない。Requirement 13.7 も札と解決トグルが共通の箱の中に入ることだけを求めている。加えて `primary` に替えると、送信ボタンの `btn btn-sm btn-primary` と同じ色になり、「Unresolved」が状態ではなく押せる操作のように読める。札の配色を変えるなら、それを求める受け入れ条件を先に立てるべきなので、この amend では触らない（Boundary Context の Out of scope に明記する）。

`InlineCommentReplies` は `ms-4 ms-sm-5 mt-2` の字下げをそのまま残しつつ、各返信を `CommentCard` で包む。返信入力欄の素の `<textarea>` は当面そのままにする（Requirement 13 は起点コメントの見た目の統一を求めていて、返信入力欄の編集体験の変更は別の判断になる）。ただし `Reply` ボタンの文言は既存キーの `t('page_comment.reply')` に置き換える。

### `InlineCommentService.listByPageId()`（応答に投稿者を追加）

Requirement 13.4（アイコン・名前・日時の表示）は CSS では満たせない。`IInlineComment` が持つのは `creatorId: string` だけで、`listByPageId()` の 2 本の `findMany()` は `include` を付けていないため、投稿者の名前も画像も応答に入っていない。

通常コメントと同じ手順にそろえる。`apps/app/src/server/routes/comment.js:159-176` が手本。

```ts
// listByPageId() の 2 本の findMany() に include を足す
const originRows = await this.deps.prisma.comments.findMany({
  where: { pageId, isInline: true, replyToId: null },
  include: { creator: true },
  orderBy: { createdAt: 'asc' },
});
```

```ts
// interfaces/index.ts
export interface IInlineComment {
  id: string;
  pageId: string;
  creatorId: string;
  /** 一覧取得のみで埋まる。秘匿処理を通した投稿者。取得できないときは null */
  creator: IUserHasId | null;
  // ... 以降は変更なし
}
```

`toInlineCommentFromListRow()` で `creator: row.creator != null ? serializeUserSecurely(row.creator) : null` を入れる。`creatorId` は消さず残す（既存の呼び出し側が参照している）。

`create()` と `createReply()` の応答は変えない（作成直後は SWR の `mutate()` で一覧を取り直すため、作成応答に投稿者は要らない）。

---

## File Structure Plan

### 新規

```
apps/app/src/client/components/PageComment/CommentCard/
├── index.ts
├── CommentCard.tsx（CSS モジュールは持たない。決定2参照）
└── CommentCard.spec.tsx

apps/app/src/features/inline-comment/client/components/PendingSelectionHighlight/
├── PendingSelectionHighlight.tsx
└── PendingSelectionHighlight.spec.tsx

apps/app/src/client/components/PageComment/Comment.spec.tsx   ← 新規（Req 13.9 の判定に必要）

apps/app/src/features/inline-comment/client/components/InlineCommentItem/
├── InlineCommentItem.tsx
├── InlineCommentItem.module.scss
├── InlineCommentReplies.tsx
├── InlineCommentItem.spec.tsx
└── InlineCommentReplies.spec.tsx

apps/app/src/features/inline-comment/client/components/SelectionCapture/SelectionActionButton.module.scss
apps/app/src/features/inline-comment/client/components/InlineCommentForm/InlineCommentForm.module.scss
apps/app/src/features/inline-comment/client/no-literal-colors.spec.ts
```

### 変更

| ファイル | 変更 |
|---|---|
| `apps/app/src/styles/_marker.scss` | `--grw-inline-comment-marker-bg` を `:root` に追加 |
| `.../SelectionCapture/SelectionActionButton.tsx` | クラス・アイコン・翻訳キーを追加 |
| `.../SelectionCapture/SelectionCapture.tsx` | `PendingSelectionHighlight` を両段で描く |
| `.../InlineCommentForm/InlineCommentForm.tsx` | 引用・操作ボタン群のクラス、翻訳キー |
| `.../InlineCommentForm/MentionPickerButton.tsx` | `DropdownToggle` を `color="link"` に |
| `.../InlineCommentHighlight/InlineCommentHighlight.tsx` | 色を `--grw-inline-comment-marker-bg` に |
| `.../interfaces/index.ts` | `IInlineComment.creator` を追加 |
| `.../server/service/inline-comment-service.ts` | `include: { creator: true }` と `serializeUserSecurely` |
| `apps/app/src/client/components/PageComment/Comment.tsx` | 内側を `CommentCard` に差し替え。`comment-styles` の入れ物は残す（出力 DOM は同じ） |
| `apps/app/src/client/components/PageComment/Comment.module.scss` | **変更しない**（`CommentCard` がモジュールの入れ物を持たないため、既存の入れ子の規則がそのまま一致する） |
| `apps/app/src/client/components/PageComment.tsx` | `inlineComments` を受け取り、投稿日時順に混ぜる |
| `apps/app/src/client/components/Comments.tsx` | `inlineComments` を受け取って渡す |
| `apps/app/src/components/PageView/PageView.tsx` | `useSWRxInlineComments` をここで呼び、`Comments` に渡す。`<InlineCommentList>` の直接の描画をやめる |
| `apps/app/public/static/locales/en_US/translation.json` | `inline_comment.*` の 6 キー |
| `packages/editor/src/client/components-internal/CodeMirrorEditor/CodeMirrorEditor.tsx` | 公開`CodeMirrorEditorProps`（48〜59行目）に既存の`hideToolbar?: boolean`を追加（実装本体は変更なし。`CodeMirrorEditorReadOnly.tsx`が使う内部実装をそのまま公開するだけ） |
| `apps/app/src/client/components/PageComment/CommentEditor.tsx` | 変更なし（`hideToolbar`を渡さないため見た目・挙動とも無変更であることを確認するテストを追加） |

### 削除

- `apps/app/src/features/inline-comment/client/components/InlineCommentList/`（一覧の入れ物としての役目が `PageComment` に移るため。中の `InlineCommentItem` / `InlineCommentReplies` は上記の新しい場所へ移す）

---

## Requirements Traceability

| Req | 満たす箇所 |
|---|---|
| 11.1, 11.2 | `SelectionActionButton.module.scss`, `InlineCommentForm.module.scss`, `no-literal-colors.spec.ts` |
| 11.3, 11.4 | `--bs-btn-*` の上書きが `--bs-body-bg` / `--bs-border-color` / `--bs-secondary-bg` を読むこと、`btn-primary` / `btn-outline-secondary` の採用 |
| 11.5 | `btn btn-sm btn-primary`（送信）/ `btn btn-sm btn-outline-secondary`（取り消し） |
| 11.6 | `t()` 経由の文言、`en_US/translation.json` の 6 キー（残りは既存キーの流用） |
| 12.1, 12.2, 12.3 | `_marker.scss` の `--grw-inline-comment-marker-bg` |
| 12.4 | `PendingSelectionHighlight` の `::selection` 上書き |
| 12.5, 12.6 | `PendingSelectionHighlight` が `committedRange` を `CSS.highlights` に登録すること |
| 12.7 | `stage === 'idle'` で `SelectionCapture` が `null` を返すこと |
| 12.8 | 3 つの規則がすべて同じカスタムプロパティを読むこと |
| 13.1, 13.2 | `PageComment.tsx` の投稿日時順の並べ替え |
| 13.3, 13.4 | `CommentCard` の共有 |
| 13.5 | `listByPageId()` の `include: { creator: true }` ＋ `serializeUserSecurely` |
| 13.6 | `CommentCard` の `beforeBody` に引用文 |
| 13.7 | `CommentCard` の `headerEnd` に札と解決トグル |
| 13.8 | `inlineComments` を props で受け取る形（`ShareLinkPageView` は渡さない） |
| 13.9 | `Comment.tsx` の出力 DOM が変わらないこと。担保のために `Comment.spec.tsx` を新規に書く（現在テストが無い）。`CommentCard` がモジュールの入れ物を持たない設計により `Comment.module.scss` は無変更 |
| 13.10 | `InlineCommentItem`の`beforeBody`に種別ラベル行（決定6）。`Comment.tsx`は`beforeBody`を渡さないため通常コメント側には現れない |

---

## Testing Strategy

- **色の直値が無いこと**（Req 11.2 / 12.2）: `apps/app/src/features/inline-comment/` 配下の `*.ts` / `*.tsx` / `*.scss` / `*.module.scss` を読み（`*.spec.*` は除く）、`#[0-9a-fA-F]{3,8}` / `rgb(` / `rgba(` に一致しないことを確かめる単体テスト。拡張子に `.scss` を必ず含める — 本設計は同じツリーの下に SCSS モジュールを 3 つ増やすので、今後直値が入り込むならそこが最も入りやすい。現在の該当は 1 件（`InlineCommentHighlight.tsx:103` の `rgba(255, 193, 7, 0.35)`）なので、変更前は落ち、変更後に通る。
- **テーマ追随**（Req 11.3 / 11.4 / 12.3）: 単体テストでは計算後の色を取れないため、Playwright で確かめる。`data-bs-theme` を `light` / `dark` に切り替え、`getComputedStyle` で作成の起点ボタンの `background-color` が変わることを確かめる。テーマ本体の切り替え（`customize:theme`）は管理画面を経由するため、`--grw-marker-bg` を実行時に直接上書きして `::highlight` の色が追随することの確認に代える。
- **3 状態のハイライト**（Req 12.4〜12.8）: Playwright。選択直後 → 起点ボタンを押す → 入力欄をクリック、の各段で対象範囲の背景色を読み、3 つが同じ値であることを確かめる。今の実装では 3 つが `#3367D1` / `#3367D1` / `#FFFFFF` に分かれるので、変更前は落ちる。
- **1 つの一覧**（Req 13.1 / 13.2）: `PageComment.spec.tsx` に、通常コメント 2 件とインラインコメント 1 件を投稿日時が交互になるように与え、`page-comments-list` の子の順序が投稿日時順になることを確かめるテストを足す。
- **同じ箱**（Req 13.3 / 13.4）: `InlineCommentItem.spec.tsx` で、`page-comment-main`・`bg-comment`・`rounded` を持つ要素の中に `UserPicture` と投稿者名と日時が出ることを確かめる。クラス名の文字列一致だけに頼らず、`CommentCard` を通していることを DOM の構造で見る。
- **共有リンクに漏れないこと**（Req 13.8）: `ShareLinkPageView` の経路で `useSWRxInlineComments` に対応する `apiv3Get` が呼ばれないことを確かめる。
- **通常コメントが変わらないこと**（Req 13.9）: **`Comment.tsx` には現在テストが 1 つも無い**（`apps/app/src/client/components/PageComment/` 配下に `*.spec.tsx` が存在しない）。したがって「既存テストを通す」では何も担保できない。`Comment.spec.tsx` をこのスペックの作業として新しく書き、`Comment.tsx` を `CommentCard` を使う形に書き換える**前に**通しておく。確かめる内容は表示されている文字ではなく入れ物の連なり — 最も外側に `comment-styles` のモジュールクラスがあり、その中に `.page-comment` があり、その中に `.page-comment-main.bg-comment.rounded` があり、その中に `d-flex.align-items-center` の見出し行と `.page-comment-body` があること。文字だけを確かめるテストは DOM を作り替えても通ってしまうので、Req 13.9 を判定できない。

---

## Design Decisions（ユーザー判断済み）

以下の3点は、design draft作成時点では判断待ちだったが、ユーザーレビューにより確定した。

### 決定4: 既定のハイライト色は検索マーカー色（`#FFFA90`）をそのまま継承する

口頭指示（「黄色に近いオレンジ」）・モックアップ実測値（`#F9EFBC`）・検索マーカーの既定色（`--grw-marker-bg-yellow` = `#FFFA90`）の3つが食い違っており（透過合成の関係でもない）、上記「決定1」の(a)案で確定した。新しい色の値を1つも決めずに済み、テーマが`--grw-marker-bg`を上書きしていればそれに追随する。仕上がりが濃すぎる場合は`--grw-inline-comment-marker-bg`の既定値だけを差し替えれば済み、実装の形は変わらない。

### 決定5: エディタは据え置き、ツールバー・行番号の余白のみ非表示にする

モックアップの1行入力欄は、GROWIの通常コメント入力欄（`CommentEditor.tsx:332`、同じ`CodeMirrorEditorComment`を使用）とも一致しない。エディタ本体の置き換えは、メンション装飾・自動補完・`Mod-Enter`送信（Requirement 3, 9.4が依存）を壊すリスクがあるため行わない。

中間案（ツールバー・行番号の余白のみ非表示）を採用する。実装:
- `packages/editor`の`CodeMirrorEditor.tsx`には既に`hideToolbar?: boolean`が実装済み（`CodeMirrorEditorReadOnly.tsx:67`が使用中）だが、公開されている`CodeMirrorEditorProps`（48〜59行目）に含まれていないため`CodeMirrorEditorComment`からは渡せない。`CodeMirrorEditorProps`に`hideToolbar`を追加し、`InlineCommentForm.tsx`から`hideToolbar={true}`を渡す
- 行番号・折りたたみの余白は`cmProps={{ basicSetup: { lineNumbers: false, foldGutter: false } }}`で消す（`@uiw/react-codemirror`の既定`basicSetup: true`がこれらの余白の出どころ）
- 通常コメント入力欄（`CommentEditor.tsx`）はこのオプションを渡さないため、見た目・挙動とも無変更

### 決定6: 一覧項目にモックアップ通りの種別ラベル行を表示する

「同じ見た目の箱」という要件（Requirement 13.3）と両立させるため、`CommentCard`の`headerEnd`ではなく、`beforeBody`の引用文よりさらに前に、アイコン＋太字の見出し行（`Inline Comment`。`inline_comment.label`キー）を独立した行として追加する。既存の`headerEnd`（投稿者アイコン・名前・日時）はそのまま共通のまま保ち、通常コメントの箱には何も追加しない（`Comment.tsx`側は`beforeBody`を渡さないため、この見出し行はインラインコメント側にのみ現れる）。Requirement 13.10として要件化済み。

```jsx
// InlineCommentItem.tsx の beforeBody
beforeBody={
  <>
    <div className="small fw-bold text-body-secondary d-flex align-items-center gap-1 mb-1">
      <span className="material-symbols-outlined fs-6">chat</span>
      {t('inline_comment.label')}
    </div>
    <blockquote className={`small text-body-secondary mb-2 ps-2 ${styles['inline-comment-quote']}`}>
      {comment.anchor.quote}
    </blockquote>
  </>
}
```

新規i18nキーに`inline_comment.label`（値: `Inline Comment`）を追加する。

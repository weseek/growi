# Research & Design Decisions

## Summary
- **Feature**: `inline-comment-visual-refresh`
- **Discovery Scope**: Extension（既存コンポーネント3つの見た目の変更として始まり、実際に使ってみたフィードバックにより通常コメントとの共通部品の切り出しまで広がった）
- **Key Findings**:
  - GROWIのBootstrapテーマ（`packages/core-styles`、Bootstrap 5.3.8）は `-subtle`／`-emphasis` トークン（`bg-warning-subtle`／`text-warning-emphasis` 等）を実際に生成しており、承認済みモックアップの「淡色バッジ」表現はこれらのクラスだけで再現できる（新しいハードコード色は不要）
  - 通常コメントの編集・削除UI（`CommentControl.tsx`）は、アイコンボタンを親要素の `:hover` で `visibility: hidden → visible` に切り替えるCSSのみの実装である。「一覧アイテムをこのパターンに寄せる」はこの既存CSS技法をそのまま流用できる
  - `CommentCard` はスロット構成（`headerEnd`／`beforeBody`／`footer`）のみを提供し、それ自体はCSS Moduleを持たない

## Research Log

### Bootstrapの `-subtle`/`-emphasis` トークンの実在確認
- **Context**: モックアップの淡色バッジ（`--unresolved-bg: #fff3d6` 等、モックアップ自身の仮の配色）を、GROWIの実テーマでどう表現するか
- **Sources Consulted**: `node_modules/.pnpm/bootstrap@5.3.8.../dist/css/bootstrap.css`（コンパイル済みCSSを直接grep）
- **Findings**: `.bg-warning-subtle`／`.bg-danger-subtle`／`.bg-success-subtle`／`.rounded-pill`／`.text-warning-emphasis`／`.text-danger-emphasis`／`.text-success-emphasis` はいずれも生成済み
- **Implications**: 「淡色バッジ＋濃い文字色」という2階調の表現を、ハードコード色を一切使わずBootstrapの意味付きクラスだけで実現できる

### Bootstrapに「ホバーで不透明度が変わる」汎用ユーティリティは無い
- **Context**: `.btn-close` と同じ「ホバーで濃くなる」挙動を、編集・削除アイコンボタンにも持たせたかった
- **Findings**: `.link-opacity-*-hover` は `.link-*` 系カラーユーティリティに紐づいており、これらのボタンには使えない。また既存の `opacity-50` ユーティリティは `!important` 付きなので、素の `:hover` 規則を足しても勝てない
- **Implications**: CSS Modules に `opacity: 0.5` ／ `&:hover { opacity: 0.75; }`（Bootstrap自身の `$btn-close-opacity`／`$btn-close-hover-opacity` と同じ値）を直接書き、呼び出し側から `opacity-50` を外す形にした

### ホバー表示のトリガーは「各カードの箱」でなければならない
- **Context**: 「アイテムにホバーすると、そのアイテムの全ての行（起点＋全返信）のボタンが一斉に出る」という挙動が、通常コメントの「行ごとに独立」と食い違っていた
- **Findings**: 通常コメントでは、アイテムも返信も同じ `Comment.tsx` を通る独立したReactインスタンスで、それぞれが自前の `.page-comment > .page-comment-main` を持つ。そのため `.page-comment-main:hover > .page-comment-control` は自然に行単位で独立する。インラインコメント側だけが、起点と返信スレッド全体を包む外側のラッパーをトリガーにしていた
- **Implications**: トリガーを `:global(.page-comment-main):hover`（各 `CommentCard` インスタンス自身の箱、既存の `%comment-section` がすでに適用済み）に変更した。SCSSのセレクタ1行の変更で、起点・各返信それぞれに個別に届くようになる

### `CommentEditor` の `onSubmit` は永続化を完全に差し替える
- **Context**: 一覧側の編集モードを通常コメントと同じ `CommentEditor` に揃えるにあたり、インラインコメント用のAPIで保存できるか
- **Findings**: `CommentEditor.tsx` の `postCommentHandler` は `onSubmit != null` を先に確認してから自前の更新・投稿パスへ落ちる。`currentCommentId` の有無に関わらず `onSubmit` が優先される
- **Implications**: `onSubmit` の上書きだけでインラインコメント用の保存に差し替えられる（`InlineCommentReplies.tsx` の返信作成フォームがすでに使っていた手法と同じ）

### `useCodeMirrorEditorIsolated` の初期値が復元されない2つの原因
- **Context**: 編集モードに入っても入力欄に既存の本文が入らない不具合（当初は「このspecの範囲外」として持ち越されていた）
- **Findings**: 原因は2つあり、1つ目を直しただけでは「キャンセル→再度開く」で再発する。詳細は design.md「エディタの初期値が復元されない不具合」
- **Implications**: この種の「初期化タイミング」の不具合は、2回目までの確認では取り切れない。最低3回開き直して確認する

### 同じ長さの本文修正は `characterData` の変更しか起こさない
- **Context**: インラインコメントを付けた範囲の近くをエディタで少し直して保存し、リロードせずに閲覧モードへ戻るとハイライトが外れる。ブラウザをリロードすると戻る
- **Sources Consulted**: 実ページに独自の `characterData` 対応 MutationObserver を仕込んだ使い捨てPlaywrightテスト、および happy-dom での最小再現テスト
- **Findings**: タイプミスの修正など「文字数が変わらない範囲の本文修正」は、Reactが既存のテキストノードの `data` をその場で書き換えるだけで、要素の追加・削除を伴わない。つまり `characterData` 型の `MutationRecord` になり `childList` 型にはならない。`observeContainerSettle`（`AnchorResolver/use-container-settle.ts`）は `characterData: true` を指定しておらず、監視が発火していなかった。リロードで直るのは、`useAnchorResolver` がマウント時に必ず一度同期的に解決するためで、この監視の仕組みとは無関係
- **Implications**: `observer.observe(...)` に `characterData: true` を足す1行で解決する。DOM APIの引数だけの机上確認ではなく、実ページで本当に単独の `characterData` レコードが出ることを確認したうえでの判断

### happy-dom の `querySelector` は改行区切りのクラス属性を解釈しない
- **Context**: `className` を複数行のプレーン文字列（改行区切り）に整形したところ、`document.querySelector('.foo')` が突然 `null` を返すようになった
- **Findings**: 最小再現テストで確認。`classList.contains()` は改行を区切り文字として正しく扱うが、`querySelector`／`querySelectorAll` のCSSセレクタ照合は扱わない。実ブラウザはHTML仕様の「空白区切りトークン」どおり正しく扱うため、本番挙動には影響しない
- **Implications**: テストが落ちたときに実装を疑う前に、`className` が改行を含んでいないか確認する。`className` は1行の文字列に保つ

### 返信の表示順は各利用側の責務
- **Context**: ポップオーバーの返信スレッドが新しい順に並び、画面最下部の一覧と逆になっていた
- **Findings**: `InlineCommentService.listByPageId()` はサーバーの取得順（`createdAt: 'desc'`、新しい順）のまま返し、表示順を整えない。一覧側（`InlineCommentReplies.tsx`）は自前で `reverse()` して古い順にしていたが、ポップオーバーにはそれが無かった
- **Implications**: 新しく返信を表示する画面を作るときは、必ず自分で表示順を決める。サーバーの順序に依存しない

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 一覧側は `CommentCard` スロット構成を維持（採用） | `headerEnd`/`beforeBody`/`footer` の中身だけを変える | 新しい抽象を増やさない。通常コメントと同じ箱に入っているという見た目上の意味を保てる | ポップオーバーには合わなかった（下記） | — |
| ポップオーバーも `CommentCard` を流用（不採用） | 起点・返信とも共有の箱に入れる | 実装が一様になる | 共有スタイルが決めている値（アバターの大きさ、吹き出しの飾り、背景の濃さ）がモックアップと違いすぎ、実機で「モックアップと別物」に見えた | 不採用。ポップオーバーは独自のフラットなマークアップにした |
| 引用ブロックを共有コンポーネント化（不採用） | `.inline-comment-quote` 相当を1つの共有Reactコンポーネントに切り出す | 重複コードの削減 | 差分が数行のCSS規則にとどまり、新しい抽象を1つ増やすコストに見合わない | 不採用 |
| 通常コメントとインラインコメントのコンポーネント統合（不採用） | `Comment.tsx` と `InlineCommentItem.tsx` を1つにする | 挙動のずれが原理的に起きなくなる | ヘッダー行の中身が本質的に異なるため「インラインかどうかで分岐する巨大コンポーネント」になる | 不採用。重複していた**部品**だけを共通化した |

## Risks & Mitigations
- Risk: ホバー表示への変更で、タッチデバイスでの編集・削除操作の発見しやすさが下がる — Mitigation: これは通常コメント（`CommentControl.tsx`）にすでに存在する制約であり、本スペックが新しく持ち込むものではない。別途改善するなら通常コメント側も含めた横断的な課題として扱う
- Risk: 「完了したと報告されたが実際は見た目が違った」という過去の失敗の再発 — Mitigation: Requirement 4 で実ブラウザでのスクリーンショット照合を必須の完了条件とし、独立したレビューをゲートにする
- Risk: 通常コメントとインラインコメントが2つのコンポーネントのまま残るため、片方だけ変更して挙動がずれる — Mitigation: 重複していた部品を共通コンポーネントに寄せ、残った差（ホバー表示の仕組み、ヘッダー行の中身）は各ファイルのコメントで「意図的な差である」と明記する

## References
- [Inline Comment Redesign (Artifact)](https://claude.ai/code/artifact/d19799da-fedc-4687-ad14-24d134bc7e89) — 承認済みデザインモックアップ
- `.kiro/specs/inline-comment/design.md` / `research.md` — 現行実装の詳細（CommentCard・スロット構成・色トークン）

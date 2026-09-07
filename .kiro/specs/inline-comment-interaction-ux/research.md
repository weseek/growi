# Research & Design Decisions: inline-comment-interaction-ux

## Summary
- **Feature**: `inline-comment-interaction-ux`
- **Discovery Scope**: Extension（既存の `inline-comment` / `inline-comment-visual-consistency` の上に構築）
- **Key Findings**:
  - 作成中・保存済みのハイライトは既に別名で `CSS.highlights` に登録されているが、色の参照先トークンが1つしかない（`--grw-inline-comment-marker-bg`）。2つ目のトークンを足すだけで色の分離自体は小さい変更で済む。
  - 保存済みハイライトは `Range` オブジェクトの登録のみで、対応する DOM 要素・id が存在しない。hover/click/tap の当たり判定にも、一覧からのスクロールにも、この制約が効いてくる。
  - `Range` を Popper の仮想要素として使う仕組み（`rangeToVirtualElement` / `usePopperPosition`）は選択中ポップオーバーで既に実装済みで、そのまま転用できる。
  - 通常コメントの「Reply...」⇄ 入力欄の開閉パターンは `PageComment.tsx` に実装済み（`showEditorIds: Set<string>` による開閉管理）。ただし `CommentEditor` 自体は通常コメントの `useSWRxPageComment` に直結しているため、そのまま使い回すことはできない。

## Research Log

### 作成中・保存済みハイライトの色分離
- **Context**: Requirement 1 は既存の Requirement 12.8（同色にする決定）を上書きする。
- **Sources Consulted**: `apps/app/src/features/inline-comment/client/components/InlineCommentHighlight/InlineCommentHighlight.tsx`, `.../PendingSelectionHighlight/PendingSelectionHighlight.tsx`, `apps/app/src/styles/_marker.scss`, `packages/preset-themes/src/styles/*.scss`
- **Findings**:
  - 両方とも `var(--grw-inline-comment-marker-bg)` を参照しているだけで、ハイライト名（`growi-inline-comment` / `growi-inline-comment-pending`）自体は既に分かれている
  - `--grw-inline-comment-marker-bg` は `_marker.scss` の `:root` で `var(--grw-marker-bg, var(--grw-marker-bg-yellow))` として宣言。テーマ側は `--grw-marker-bg` のみを上書きする（検索マーカーと共有）
  - `::highlight()` は `background-color`/`color`/文字装飾関連のみ対応（`border`/`outline` 不可）。境界線での区別はできない
  - ブラウザは `::selection` を `::highlight()` より手前に描画する（既存コード内コメントに明記）
- **Implications**: 2つ目のトークンを追加し、作成中側の適用色に半透明（`color-mix()`）を使うことで、選択中ハイライトが保存済みハイライトの上に重なっても両方が視認できるようにする。

### hover/click/tap の当たり判定とポップオーバー配置
- **Context**: Requirement 2。保存済みハイライトは DOM 要素を持たないため、素朴な `onMouseEnter`/`onClick` が使えない。
- **Sources Consulted**: `SelectionPopover/selection-virtual-element.ts`, `SelectionPopover/use-popper-position.ts`, `SelectionCapture/use-text-selection.ts`, `apps/app/src/states/ui/device.ts`
- **Findings**:
  - `rangeToVirtualElement(range)` は `Range.getBoundingClientRect()` を Popper の仮想要素として包むだけで、既存の仕組みをそのまま転用できる
  - `usePopperPosition` は `flip`/`preventOverflow`/`offset:[0,8]` のみを使うシンプルな Popper ラッパーで、これも転用できる
  - 当たり判定（ポインタ位置がどの `Range` の描画範囲に入っているか）を解決する既存コードは無い。`use-text-selection.ts` はブラウザの選択イベントを見ているだけで、選択されていない保存済みハイライトの当たり判定とは別の問題
  - デスクトップ／タブレット以下の分岐には `apps/app/src/states/ui/device.ts` の `useDeviceLargerThanMd()`（Jotai atom + `@growi/ui`のブレークポイントリスナー）がそのまま使える
- **Implications**: 新規に「ポインタ座標 × 各 `Range.getClientRects()` の当たり判定」フックを実装する。`caretPositionFromPoint` 系 API は使わない（本リポジトリに前例が無く、ブラウザ間の実装差の影響を受けやすいため — 詳細は Design Decisions 参照）。

### 一覧からのスクロール対象データ
- **Context**: Requirement 3。一覧側から本文中の `Range` へアクセスする手段が必要。
- **Sources Consulted**: `AnchorResolver/use-anchor-resolver.ts`, `InlineCommentHighlight.tsx`（`rangeFor()`）, `PageView.tsx`, `stores/inline-comment.ts`
- **Findings**:
  - `useAnchorResolver` が返すのは `ReadonlyMap<string, ResolvedRange>`（`{status, startOffset, endOffset}` のオフセットのみ）で、`Range` オブジェクト自体はまだ作られていない
  - 実際に `Range` を組み立てるロジック（`renderedTextOf(container).resolveDomPosition(offset)`）は `InlineCommentHighlight.tsx` の非公開関数 `rangeFor()` に閉じている
  - `useAnchorResolver` の呼び出しは `PageView.tsx` に1か所のみで、結果は `InlineCommentHighlight` にしか渡っていない
  - 設計判断として「解決済みオフセットのキャッシュは持たない、都度再計算する」がこのリポジトリの既存方針（`use-anchor-resolver.ts` のコメントに明記）
- **Implications**: `rangeFor()` を共有ユーティリティとして切り出し、hover/click 用の当たり判定とスクロール機能の両方が同じロジックで「オフセット→現在のRange」を都度再構築する。`Range` オブジェクト自体をキャッシュしない、という既存方針を維持する。

### 通常コメントの Reply.../Cancel トグルUI
- **Context**: Requirement 4。
- **Sources Consulted**: `apps/app/src/client/components/PageComment.tsx`, `apps/app/src/client/components/PageComment/CommentEditor.tsx`, `apps/app/src/features/inline-comment/client/components/InlineCommentForm/InlineCommentForm.tsx`
- **Findings**:
  - `PageComment.tsx` は `showEditorIds: Set<string>` で「どの通常コメントが返信入力欄を開いているか」を管理し、閉時は「Reply...」ボタン、開時は `<CommentEditor replyTo={commentId} onCanceled={...} onCommented={...} />` を描画する
  - `CommentEditor` は内部で `useSWRxPageComment` を直接呼ぶため、インラインコメントの返信にはそのまま使えない
  - `InlineCommentForm.tsx` は `CodeMirrorEditorComment` + `useCodeMirrorEditorIsolated` + メンション補完拡張、という組み合わせを既に実装済み（起点コメント作成用）。コメント内のコメントで「`CommentEditor.tsx` を再利用せず、同じ土台部品を新規コンポーネントで再利用した」という設計判断がすでに明記されている
- **Implications**: `InlineCommentForm.tsx` のエディタ組み立て部分を共有部品として切り出し、新しい返信トグルUIと `InlineCommentForm.tsx` 自身の両方から使う。`CommentEditor.tsx`／通常コメント側は無変更。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| `caretPositionFromPoint` 系API | ブラウザ標準の「座標→テキスト位置」API | 標準API、実装が少ない | ブラウザ間で実装が分かれていた歴史があり、`Range` との比較（`compareBoundaryPoints`）が別途必要で当たり判定の複雑さはむしろ増える | 不採用 |
| `Range.getClientRects()` + 座標比較 | 解決済み `Range` ごとの矩形と座標を比較 | 対象範囲（解決済みコメントのみ）に限定でき、シンプル。ブラウザ差異が小さい | 複数行にまたがる `Range` は複数矩形になるため、全矩形を走査する必要がある | 採用 |
| `Range` オブジェクトの永続キャッシュ | 一度組み立てた `Range` を保持し使い回す | 再構築コストがかからない | 本文の再レンダリングで無効になった `Range` を検知する仕組みが別途必要になり、既存の「都度再計算」方針と矛盾する | 不採用（既存方針を維持） |

## Design Decisions

### Decision: ハイライト色の2トークン化と半透明化
- **Context**: Requirement 1（12.8の上書き）。作成中と保存済みを異なる色にしつつ、重なったときに両方見えるようにする必要がある。
- **Alternatives Considered**:
  1. 単純に2つ目のトークンを追加し、両方とも不透明な色にする — 重なったときに保存済み側が完全に隠れてしまう
  2. 境界線（border/outline）で区別する — `::highlight()` が対応していないため不可
  3. 作成中側の適用色に半透明を持たせ、下の保存済みハイライトが透けるようにする
- **Selected Approach**: 3。トークン自体は不透明な色のまま定義し（他の用途で再利用しやすいように）、`PendingSelectionHighlight` がそれを適用する箇所（`::selection` と `::highlight(growi-inline-comment-pending)`）でのみ `color-mix()` 等により半透明にする
- **Rationale**: トークンの再利用性を保ちつつ、実際に重なりが起きる唯一の場所（作成中ハイライトの適用箇所）だけに透明度を持たせることで、影響範囲を最小化できる
- **Trade-offs**: `color-mix()` 非対応の古いブラウザでは透明度が効かない。ただし CSS Custom Highlight API 自体がその種の環境では動作しないため、影響は既存の `supportsCustomHighlightApi()` フォールバックと同じ範囲に収まる
- **Follow-up**: 既定色（作成中・保存済みそれぞれ）の具体的な値は実装時に決定する（決定4 の前例と同様、検索マーカー色ファミリーから選ぶ）

### Decision: 当たり判定は「解決済みRangeの矩形と座標の比較」を新規実装する
- **Context**: Requirement 2。保存済みハイライトに対応するDOM要素が無いため、標準的なイベントハンドラでは hover/click/tap を検出できない。
- **Alternatives Considered**: 上記 Architecture Pattern Evaluation の表を参照
- **Selected Approach**: 本文コンテナに `pointermove`/`click` を委譲し、解決済みの各 `Range` の `getClientRects()` に対して座標を比較する新規フックを実装する
- **Rationale**: 対象範囲がその時点で解決済みのコメント数に限られるため、実行コストは小さい。ブラウザAPIの差異も小さい
- **Trade-offs**: `pointermove` の頻度が高い場合の負荷は `requestAnimationFrame` によるスロットリングで抑える
- **Follow-up**: 実装時に対象ページのコメント数が非常に多い場合の性能を確認する

### Decision: 解決済みオフセット→Rangeの再構築ロジックを共有ユーティリティとして切り出す
- **Context**: Requirement 2・3 の両方が「コメントidから、いま本文中のどこにあるか」を必要とする
- **Alternatives Considered**:
  1. それぞれの機能が個別に `renderedTextOf().resolveDomPosition()` を呼ぶ（重複実装）
  2. 共有ユーティリティを1つ切り出し、`InlineCommentHighlight` を含む3箇所から使う
- **Selected Approach**: 2。`InlineCommentHighlight.tsx` の非公開 `rangeFor()` を共有モジュールに移し、id付きで `Range` を返す関数を追加する
- **Rationale**: 同じロジックの重複を避けられ、将来 `renderedTextOf`/`resolveDomPosition` の挙動が変わったときの修正箇所が1つで済む
- **Trade-offs**: 既に実装済みの `InlineCommentHighlight.tsx` に軽微な変更が入る（ロジックの移動のみで、実行時の挙動は変えない）
- **Follow-up**: なし

### Decision: 通常コメントの返信トグルUIと同じ状態管理パターンを踏襲し、エディタ部分は `InlineCommentForm` の土台を共有部品として切り出す
- **Context**: Requirement 4。
- **Alternatives Considered**:
  1. `CommentEditor.tsx` を汎用化してインラインコメント側からも呼べるようにする — 通常コメントAPI（`useSWRxPageComment`）に直結しており汎用化の影響範囲が大きい
  2. `InlineCommentForm.tsx` のエディタ組み立て部分を共有部品として切り出し、返信トグルUIと起点フォームの両方から使う
- **Selected Approach**: 2
- **Rationale**: `CommentEditor.tsx`（通常コメント側）を無改変のまま、インラインコメント側だけで完結する変更にできる。関心マップ上も「InlineComment側のメンション対応入力コンポーネント」という1つの責務にまとまる
- **Trade-offs**: 既に実装済みの `InlineCommentForm.tsx` に軽微なリファクタリングが入る（外部から見た挙動は変えない）
- **Follow-up**: なし

## Risks & Mitigations
- 当たり判定フックが新規実装であること — 実装時にモバイル実機／タブレット幅での動作を確認する
- `color-mix()` の既定色の見やすさ（コントラスト） — 実装時にテーマごとの見え方を目視確認する
- `InlineCommentHighlight.tsx` / `InlineCommentForm.tsx` への軽微なリファクタリングが、既存のE2E（`inline-comment-visual-consistency` で作成済み）を壊さないこと — 実装時に既存のPlaywrightスイートを再実行して確認する

## References
- 本リポジトリ内の既存実装（`SelectionPopover`, `AnchorResolver`, `PageComment.tsx`, `InlineCommentForm.tsx`）— 上記 Research Log 参照

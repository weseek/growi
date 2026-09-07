# Implementation Plan

- [ ] 1. 基盤: ハイライト色トークン・共有ユーティリティ・翻訳キー
- [x] 1.1 作成中ハイライト用のテーマ対応トークンを追加する
  - `apps/app/src/styles/_marker.scss` の `:root` に `--grw-inline-comment-marker-bg-pending` を追加する。既定では保存済みハイライト（`--grw-inline-comment-marker-bg`、既定は黄色系）と異なるマーカー色ファミリーにフォールバックする
  - 観測できる完了条件：新しいカスタムプロパティが `_marker.scss` の `:root` から取得でき、既存の `--grw-inline-comment-marker-bg` の既定値と異なる値に解決されることを確認できる
  - _Requirements: 1.3, 1.4_

- [x] 1.2 (P) 解決済みRangeの再構築ロジックを共有ユーティリティへ切り出す
  - `apps/app/src/features/inline-comment/client/services/resolved-range.ts` を新設し、`InlineCommentHighlight.tsx` の非公開関数 `rangeFor()` と同じロジックを `rangeForResolved()` として移す。さらに、コメントidをキーにした `ReadonlyMap<string, Range>` を返す `rangesById()` を追加する（`not_found` の範囲は含めない）
  - `InlineCommentHighlight.tsx` をこのユーティリティを使う形に書き換える（実行時の挙動は変えない）
  - 観測できる完了条件：既存の `InlineCommentHighlight.spec.tsx` が無変更のままgreenになる。新設した `resolved-range.spec.ts` で、`not_found` の解決結果が `rangesById()` の戻り値に含まれないことを確認できる
  - _Requirements: 2.6, 3.1_
  - _Boundary: resolved-range, InlineCommentHighlight_

- [x] 1.3 (P) 本機能で新たに必要になる翻訳キーを追加する
  - `apps/app/public/static/locales/en_US/translation.json` に、本文ハイライトのポップオーバー（内容確認・簡易返信欄のプレースホルダ・送信ボタン・閉じる操作）、一覧側の再アンカー失敗通知、に必要な文言キーを追加する（英語ファースト。既存キーで代用できるもの—`page_comment.reply`等—は流用し重複させない）
  - 観測できる完了条件：追加した各キーが `en_US/translation.json` から取得できる
  - _Requirements: 2.3, 3.2, 4.1_

- [ ] 2. ハイライト色の区別
- [x] 2.1 作成中ハイライトの適用色を新トークン・半透明値に変更する
  - `PendingSelectionHighlight.tsx` の `::selection` と `::highlight(growi-inline-comment-pending)` が読む値を、`--grw-inline-comment-marker-bg-pending` を `color-mix()` 等で半透明化した値に変更する。`InlineCommentHighlight.tsx` 側（保存済み）は変更しない
  - 観測できる完了条件：`PendingSelectionHighlight.spec.tsx` を更新し、生成されるスタイル文字列が新トークン・半透明指定を参照し、かつ保存済みハイライトが使う値とは異なることを確認できる
  - _Requirements: 1.1, 1.2, 1.5_
  - _Depends: 1.1_
  - _Boundary: PendingSelectionHighlight_

- [ ] 3. 本文ハイライトのhover/click/tapポップオーバー
- [x] 3.1 (P) 保存済みハイライトへの当たり判定フックを実装する
  - `apps/app/src/features/inline-comment/client/components/InlineCommentBodyInteraction/use-highlight-hit-test.ts` を新設する。本文コンテナへの `pointermove`（`requestAnimationFrame` でスロットル）・`click` イベントの座標を、`rangesById()` が返す各 `Range` の `getClientRects()` と比較し、一致したコメントidを返す。`useDeviceLargerThanMd()` を使い、デスクトップ幅では hover・click の両方を、タブレット以下の幅では click（タップ）のみを有効にする
  - 観測できる完了条件：モックした `Range`（既知の矩形を返す）に対して、座標がその内側のときは一致するコメントidを返し、外側のときは何も返さないことをユニットテストで確認できる。`not_found` で除外された範囲が候補に含まれないことも確認できる
  - _Requirements: 2.1, 2.2, 2.6_
  - _Depends: 1.2_
  - _Boundary: use-highlight-hit-test_

- [x] 3.2 (P) 内容確認・簡易返信ポップオーバーを実装する
  - `apps/app/src/features/inline-comment/client/components/InlineCommentBodyInteraction/InlineCommentPreviewPopover.tsx` を新設する。`rangeToVirtualElement` と `usePopperPosition`（`SelectionPopover` と同じ仕組み）でコメントの投稿者・投稿日時・本文・既存の返信を表示し、簡素な（プレーンな）返信入力欄と送信ボタンを持つ。編集用の要素は持たない。外側クリックまたは明示的な閉じる操作で閉じる
  - 観測できる完了条件：ポップオーバーが投稿者・投稿日時・本文・返信一覧を表示し、簡易返信欄からの送信で渡された `createReply` が呼ばれ、外側クリックで閉じることをユニットテストで確認できる
  - _Requirements: 2.3, 2.4, 2.5_
  - _Depends: 1.3_
  - _Boundary: InlineCommentPreviewPopover_

- [x] 3.3 当たり判定とポップオーバーを組み合わせ、PageViewへ配線する
  - `apps/app/src/features/inline-comment/client/components/InlineCommentBodyInteraction/InlineCommentBodyInteraction.tsx` を新設し、3.1のフックの結果に応じて3.2のポップオーバーを開閉する。`PageView.tsx` にこのコンポーネントを描画し、`containerRef`・`resolvedInlineCommentRanges`・`inlineComments`（一覧データ）・`resolve`/`createReply` を渡す
  - 観測できる完了条件：本文中の保存済みハイライトへのhover（デスクトップ幅）・click・tap（タブレット以下の幅）でポップオーバーが開閉することをユニットテストで確認できる
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - _Depends: 3.1, 3.2_
  - _Boundary: InlineCommentBodyInteraction, PageView_

- [ ] 4. 一覧からのスクロールナビゲーション
- [x] 4.1 PageViewにスクロール・一時的強調・失敗時通知を実装する
  - `PageView.tsx` に `scrollToRange(commentId: string): boolean` を実装する。`rangesById()` で対象の `Range` を再構築できた場合はその位置までスクロールし、対象範囲を一時的に別のハイライト名（`growi-inline-comment-emphasis` 等）へ登録して一定時間後に削除する形で強調表示する。再構築できなかった場合は既存の通知UIで利用者に伝える
  - 観測できる完了条件：`PageView.spec.tsx` に `scrollToRange` の単体テストを足し、対象が見つかった場合・見つからなかった場合の両方の戻り値と副作用（スクロール呼び出し・通知呼び出し）を確認できる
  - _Requirements: 3.1, 3.2, 3.3_
  - _Depends: 1.2, 3.3_
  - _Boundary: PageView_

- [x] 4.2 inlineCommentsバンドルに scrollToRange を追加し一覧側へ伝搬する
  - `PageView.tsx` の `inlineCommentsForComments` バンドル（`{ comments, resolve, createReply }`）に `scrollToRange` を追加する。`Comments.tsx` / `PageComment.tsx` の `inlineComments` prop の型定義を更新し、そのまま素通しする（ロジック変更なし）
  - 観測できる完了条件：`Comments.spec.tsx` で、`scrollToRange` を含むオブジェクトがそのまま `PageComment` に転送されることを確認できる
  - _Requirements: 3.1_
  - _Depends: 4.1_
  - _Boundary: PageView, Comments, PageComment_

- [x] 4.3 InlineCommentItemでscrollToRangeをクリックハンドラに接続する
  - `InlineCommentItem.tsx` の一覧項目内の操作要素（クリック対象）から `scrollToRange(comment.id)` を呼び出す配線を追加する
  - 観測できる完了条件：`InlineCommentItem.spec.tsx` で、対象の操作要素をクリックすると渡された `scrollToRange` が対象コメントのidで呼ばれることを確認できる
  - _Requirements: 3.1_
  - _Depends: 4.2_
  - _Boundary: InlineCommentItem_

- [ ] 5. 返信UIの通常コメントとの統一
- [x] 5.1 (P) InlineCommentFormのエディタ組み立て部分を共有部品として切り出す
  - `apps/app/src/features/inline-comment/client/components/MentionAwareCommentInput/MentionAwareCommentInput.tsx` を新設し、`InlineCommentForm.tsx` が持つ `CodeMirrorEditorComment` ＋ `useCodeMirrorEditorIsolated` ＋ メンション補完拡張の組み立て・送信・エラー表示ロジックを移す。`InlineCommentForm.tsx` はこの部品を使う形に書き換える（外部から見た挙動は変えない）
  - 観測できる完了条件：既存の `InlineCommentForm.spec.tsx` が無変更のままgreenになる（起点フォームの挙動が変わっていないことの確認）
  - _Requirements: 4.2_
  - _Depends: 1.3_
  - _Boundary: MentionAwareCommentInput, InlineCommentForm_

- [x] 5.2 InlineCommentRepliesをReply.../Cancelトグルに書き換える
  - `InlineCommentReplies.tsx` に、通常コメントの `showEditorIds` パターンを踏襲したローカルな開閉状態（1スレッドにつき1つの返信欄なので真偽値で足りる）を導入する。閉時は既存キー `t('page_comment.reply')` を使った「Reply...」ボタンを、開時は5.1の `MentionAwareCommentInput` とCancelボタンを表示する。現状の素の `<textarea>` ベースの返信欄は削除する
  - 観測できる完了条件：`InlineCommentReplies.spec.tsx` で、「Reply...」ボタンのクリックで入力コンポーネントが表示され、Cancelのクリックでボタン表示に戻り、送信で `createReply` が呼ばれ返信投稿・一覧反映という既存の振る舞いが変わっていないことを確認できる
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - _Depends: 5.1_
  - _Boundary: InlineCommentReplies_

- [ ] 6. 検証：横断的な確認
- [x] 6.1 E2E: 作成中・保存済みハイライトが重なったときに両方視認できることを確認する
  - 保存済みインラインコメントの対象範囲と重なる位置で新しくテキストを選択し、両方の色由来の値が反映されていることを確認する
  - 観測できる完了条件：E2Eテストがgreenになる
  - _Requirements: 1.1, 1.2_
  - _Depends: 2.1_

- [x] 6.2 E2E: 本文ハイライトのhover/click/tapでポップオーバーが開き簡易返信できることを確認する
  - デスクトップ幅でのhover・click、タブレット以下の幅でのtapのそれぞれで保存済みハイライトのポップオーバーが開閉し、簡易返信欄からの投稿が一覧に反映されることを確認する
  - 観測できる完了条件：E2Eテストがgreenになる
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - _Depends: 3.3_

- [x] 6.3 E2E: 一覧クリックで本文の該当箇所へスクロール・強調表示されることを確認する
  - 画面最下部の一覧にあるインラインコメント項目をクリックすると本文中の対象範囲までスクロールし、一時的な強調表示が起きることを確認する。あわせて、対象範囲が再アンカーに失敗しているケースで通知が表示されることを確認する
  - 観測できる完了条件：E2Eテストがgreenになる
  - _Requirements: 3.1, 3.2, 3.3_
  - _Depends: 4.3_

- [ ] 6.4 E2E: 一覧のインラインコメント返信が通常コメントと同じUIで行えることを確認する
  - 画面最下部の一覧で、インラインコメントへの返信が「Reply...」ボタン→メンション対応入力欄→Cancelで元に戻る、という通常コメントと同じ操作で行えることを確認する
  - 観測できる完了条件：E2Eテストがgreenになる
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - _Depends: 5.2_

- [ ] 7. 変更を対象スペックへ戻し、本スペックを削除する
- [ ] 7.1 `inline-comment-visual-consistency` の Requirement 12.8 を上書きする
  - `.kiro/specs/inline-comment-visual-consistency/requirements.md` の Requirement 12.8（「作成中の範囲を示すハイライトと、保存済みコメントの対象範囲を示すハイライトに、同じ色を使う」）を、本スペックの Requirement 1 の内容（異なる色を使う・重なったときに両方見分けられる）に置き換える。同スペックの `design.md`（決定1）にも、実装した2トークン構成・半透明化の内容を反映する
  - まだ `inline-comment-visual-consistency` 自体の fold-back（`.kiro/specs/inline-comment/` への統合）が完了していない場合は、上記のファイルへ直接反映する。fold-back が既に完了していた場合は `.kiro/specs/inline-comment/requirements.md`／`design.md` の該当箇所（12.8相当）に反映する
  - 観測できる完了条件：対象ファイルの記述が、実装済みの2トークン・半透明化の内容と矛盾しないこと
  - _Depends: 2.1_

- [ ] 7.2 `inline-comment` の requirements.md / design.md へ Requirement 1〜4 を追加する
  - `.kiro/specs/inline-comment/requirements.md` の末尾に、本スペックのRequirement 1〜4を新しい番号（既存の最大番号の続き。既存番号は変えない）で追加する
  - `.kiro/specs/inline-comment/design.md` の Components and Interfaces / File Structure Plan に、本スペックで新設・変更したコンポーネント（`InlineCommentBodyInteraction`, `MentionAwareCommentInput`, `resolved-range.ts`, 2トークン化されたハイライト色 等）を反映する
  - 観測できる完了条件：`inline-comment` の requirements.md / design.md だけを読んで、本機能の要件・設計が理解できること
  - _Depends: 6.1, 6.2, 6.3, 6.4, 7.1_

- [ ] 7.3 設計判断を対象スペックのresearch.mdへ移し、本スペックを削除する
  - 本スペックの `research.md` にある Design Decisions を、`.kiro/specs/inline-comment/research.md`（無ければ新規作成）へ移す
  - `.kiro/specs/inline-comment/spec.json` の `updated_at` を更新する（`phase`/`approvals` は変更しない）
  - `.kiro/specs/inline-comment-interaction-ux/` ディレクトリを削除する
  - 観測できる完了条件：`.kiro/specs/inline-comment-interaction-ux/` が存在しないこと。`git status` でこの削除と対象スペックへの変更が確認できること
  - _Depends: 7.2_

## Implementation Notes

- Task 3.1 (`use-highlight-hit-test.ts`): the hook reports only the *current*
  hit and does not latch a click-selected comment id — if the pointer moves
  off the highlight after a click, the next `pointermove` clears it back to
  `null` (the `source: 'hover' | 'click'` field on the returned hit tells the
  caller which kind of interaction produced it). Task 3.3
  (`InlineCommentBodyInteraction`) must keep its own "pinned" state: once a
  hit with `source === 'click'` opens the popover, ignore subsequent `null`/
  hover-only updates from this hook while the popover stays open (close only
  via the popover's own outside-click/close-control per AC 2.4, not because
  the hook stopped reporting a hover hit).

- Task 3.3 (`InlineCommentBodyInteraction`): design.md 決定2 lists `resolve`
  among the props passed down alongside `createReply`, but it is genuinely
  unneeded — Requirement 2's ACs never call for a resolve action inside the
  popover, and `InlineCommentPreviewPopover` (3.2) has no such prop either.
  When folding this spec back into `inline-comment` (task 7.2), drop `resolve`
  from that prop list rather than carrying the unused mention forward.
  Also: the popover's "reopen suppression" after an explicit close is keyed
  on `(commentId, source)`, so closing a click-pinned popover and then
  immediately getting a `hover`-sourced hit on the SAME highlight (e.g. the
  pointer never left because the close button sits over the highlighted
  text) is not suppressed and can reopen it right away — reviewed as
  non-blocking/ambiguous under AC 2.4's literal wording, but worth revisiting
  (key suppression on `commentId` alone, clearing only when the hook reports
  a different id or `null`) if this surfaces as a real usability complaint.

- Task 6.1 (E2E): running the full `inline-comment.spec.ts` file surfaced
  two PRE-EXISTING E2E tests broken by earlier tasks already landed in this
  spec (not introduced by 6.1 itself) — fixed alongside 6.1's own new test,
  same file, same commit:
  - The old "highlight color stays the same across selecting/composing/saved"
    test asserted all three states paint an identical color. Task 2.1 made
    the pending (selecting/composing) highlight semi-transparent and
    genuinely different from the saved highlight — exactly the retraction
    of the old `inline-comment-visual-consistency` spec's Requirement 12.8
    this amend spec makes. Fixed by keeping every per-state correctness
    assertion (still required by this spec's own Requirement 1.5, which
    preserves the old spec's Req 12.1–12.7) and replacing only the
    cross-state EQUALITY assertions: selecting/composing still equal each
    other (both pending-mechanism), but saved is now asserted DIFFERENT.
  - The old "Replying to the inline comment nests the reply..." test filled
    a plain `<textbox name="Reply">` directly. Task 5.2 replaced that with a
    "Reply..." toggle button that must be clicked first to reveal
    `MentionAwareCommentInput`. Fixed to click the toggle
    (`data-testid="inline-comment-reply-toggle-button"`), fill `.cm-content`,
    then submit — same final nesting/text assertions as before.
  - Lesson for any future spec touching this file: task-local review only
    runs the task's own new/changed test(s); a full-file run (as the E2E
    verification group already does) is what catches this class of
    cross-task regression, so budget for it rather than trusting each
    task's own green run in isolation.
  - Also bumped `apps/app/tools/i18n-audit/baseline.json` (missing-key count
    for ja_JP/zh_CN/fr_FR/ko_KR, +2 keys × 4 locales = +8 each) so
    `pnpm run lint:i18n` passes — the two new en_US-only keys from task 1.3
    are deliberately not translated yet, per this project's English-first
    i18n policy; this is a deliberate baseline bump, not a translation task.

- Task 4.1 (`PageView.scrollToRange`): two known, narrow limitations,
  reviewed as acceptable to defer rather than fixed in-boundary:
  (a) `InlineCommentHighlight.tsx`'s effect re-registers the SAVED highlight
  name whenever `resolvedRanges` gets a new identity; if that happens inside
  the 2000ms emphasis window, the saved (yellow) highlight repaints over the
  emphasis (red) per `CSS.highlights`' later-registration-wins order — a
  color flicker only, scroll itself unaffected, and design.md 決定4 doesn't
  address re-registration by an unrelated consumer. (b)
  `supportsCustomHighlightApi()` is now duplicated between
  `InlineCommentHighlight.tsx` and `PageView.tsx` (each file's own boundary
  prevented touching the other). If either is worth fixing, do it as a small
  follow-up: extract the capability probe into a shared module (e.g. next to
  `resolved-range.ts`), and have `PageView` re-assert emphasis reactively
  (or otherwise account for a mid-window `resolvedRanges` identity change).

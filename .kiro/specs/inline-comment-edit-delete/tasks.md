# Implementation Plan

- [x] 1. サービス層に編集・削除メソッドとActivityアクションを追加する（InlineCommentService）
  - `apps/app/src/interfaces/activity.ts` に `ACTION_INLINE_COMMENT_UPDATE`／`ACTION_INLINE_COMMENT_REPLY_UPDATE`／`ACTION_INLINE_COMMENT_DELETE`／`ACTION_INLINE_COMMENT_REPLY_DELETE` を末尾に追加する（既存の並びは変更しない）
  - `InlineCommentService` に `updateComment(id, comment, actorId)` を追加する。行が起点（`isInline && replyToId == null`）であること・`creatorId === actorId` であることを再検証し、`comment` を更新して `ACTION_INLINE_COMMENT_UPDATE` を発行する
  - `updateReply(id, comment, actorId)` を追加する。行が返信（`replyToId != null`）であることを検証し、`ACTION_INLINE_COMMENT_REPLY_UPDATE` を発行する
  - `deleteComment(id, actorId)` を追加する。起点であることを検証し、`prisma.comments.removeWithReplies(id)` を呼んで `ACTION_INLINE_COMMENT_DELETE` を発行する
  - `deleteReply(id, actorId)` を追加する。返信であることを検証し、`prisma.comments.delete({ where: { id } })` を呼んで `ACTION_INLINE_COMMENT_REPLY_DELETE` を発行する
  - `toInlineCommentReplyFromUpdateResult` マッパーを追加する（既存の `toIInlineCommentFromUpdateResult` と対になる形）
  - いずれのメソッドも `anchor`／`anchorOriginRevisionId`／`resolvedAt`／`resolvedById` を変更しないことを保証する
  - `inline-comment-service.spec.ts` に、形状違いのid・投稿者本人以外・成功時（`anchor`/`resolvedAt`が変わらないこと含む）・道連れ削除（`deleteComment`が返信も消すこと）を検証する単体テストを追加し、すべて green になる
  - _Requirements: 1.3, 1.5, 2.3, 2.4, 2.6, 3.1, 3.2_
  - _Boundary: InlineCommentService_

- [x] 2. apiv3ルートを追加する（起点・返信 × 更新・削除の4本）
- [x] 2.1 (P) 起点コメント更新ルートを追加する
  - `PUT /_api/v3/inline-comments/:id` を実装する（`update.ts`）。ミドルウェア順序は `resolve.ts` と同一（`accessTokenParser → loginRequired → validators → apiV3FormValidator`）
  - `findUnique` でページ権限チェック・起点であることの400判定を行い、`InlineCommentService.updateComment` に委譲する
  - `UpdateInlineCommentRequestBody`/`UpdateInlineCommentResponseBody` DTO（`update-inline-comment.ts`）を追加し、`interfaces/dto/index.ts` に再エクスポートする
  - `update.integ.ts` に、400（返信のidを渡した場合）・403（投稿者本人以外）・404（存在しない）・200（成功、`inlineComment`に正しい本文が反映される）を検証する結合テストを追加し、すべて green になる
  - _Requirements: 1.3, 1.5, 3.2_
  - _Boundary: update.ts_
  - _Depends: 1_

- [x] 2.2 (P) 返信更新ルートを追加する
  - `PUT /_api/v3/inline-comments/replies/:id` を実装する（`update-reply.ts`）。ミドルウェア順序・エラー方針は2.1と同一
  - `findUnique` でページ権限チェック・返信であることの400判定を行い、`InlineCommentService.updateReply` に委譲する
  - `UpdateInlineCommentReplyRequestBody`/`UpdateInlineCommentReplyResponseBody` DTO（`update-inline-comment-reply.ts`）を追加し、barrelに再エクスポートする
  - `update-reply.integ.ts` に、400（起点のidを渡した場合）・403・404・200を検証する結合テストを追加し、すべて green になる
  - _Requirements: 1.3, 1.5, 3.2_
  - _Boundary: update-reply.ts_
  - _Depends: 1_

- [x] 2.3 (P) 起点コメント削除ルートを追加する
  - `DELETE /_api/v3/inline-comments/:id` を実装する（`delete.ts`）。DTOは追加せず、成功時は `res.apiv3({})` を返す
  - `findUnique` でページ権限チェック・起点であることの400判定を行い、`InlineCommentService.deleteComment` に委譲する
  - `delete.integ.ts` に、400・403・404・200（成功後、対象の起点コメントとその返信がすべて存在しなくなること）を検証する結合テストを追加し、すべて green になる
  - _Requirements: 2.3, 2.4, 2.6, 3.2_
  - _Boundary: delete.ts_
  - _Depends: 1_

- [x] 2.4 (P) 返信削除ルートを追加する
  - `DELETE /_api/v3/inline-comments/replies/:id` を実装する（`delete-reply.ts`）。DTOなし、`res.apiv3({})` を返す
  - `findUnique` でページ権限チェック・返信であることの400判定を行い、`InlineCommentService.deleteReply` に委譲する
  - `delete-reply.integ.ts` に、400・403・404・200（成功後、その返信だけが存在しなくなり起点コメントや他の返信は残ること）を検証する結合テストを追加し、すべて green になる
  - _Requirements: 2.3, 2.6, 3.2_
  - _Boundary: delete-reply.ts_
  - _Depends: 1_

- [x] 3. (P) クライアントのstoreに編集・削除ユーティリティを追加する（useSWRxInlineComments）
  - `update(id, comment)`／`updateReply(id, comment)`／`remove(id)`／`removeReply(id)` を追加する。既存の `resolve`／`createReply` とまったく同じ形（PUT/DELETE呼び出し → `mutate()` → ペイロードを返す）にする
  - `inline-comment.spec.ts`（または対応する既存のstoreテストファイル）に、4つのユーティリティそれぞれが正しいエンドポイントを呼び、成功後に一覧を再取得することを検証する単体テストを追加し、すべて green になる
  - _Requirements: 1.3, 2.3_
  - _Boundary: useSWRxInlineComments_
  - _Depends: 2.1, 2.2_（`update`/`updateReply` は `UpdateInlineCommentResponseBody`/`UpdateInlineCommentReplyResponseBody` を `interfaces/dto` から import する。`remove`/`removeReply` にはこの依存はない）

- [x] 4. (P) `MentionAwareCommentInput` に編集モード用の初期値propを追加する
  - 任意prop `initialValue?: string` を追加し、渡された場合はマウント時に一度だけ `codeMirrorEditor.initDoc(initialValue)` を適用する
  - `initialValue` を渡さない既存の呼び出し（`InlineCommentForm`／`InlineCommentReplies`の返信入力欄）が現状と変わらず動作することを退行テストで確認する
  - `MentionAwareCommentInput.spec.tsx` に、`initialValue`ありでエディタに反映されること・`initialValue`なしで空のままであること（既存動作の回帰確認）を検証する単体テストを追加し、すべて green になる
  - _Requirements: 1.2_
  - _Boundary: MentionAwareCommentInput_

- [x] 5. (P) 一覧（InlineCommentItem・InlineCommentReplies）に編集・削除操作を追加する
  - `comment.creatorId === currentUser?._id`（`useCurrentUser()`）による投稿者本人チェックを追加し、`NotAvailableIfReadOnlyUserNotAllowedToComment` でラップした編集・削除ボタンを表示する
  - 編集ボタンで `MentionAwareCommentInput`（`initialValue={comment.comment}`、コメントごとに区別した`editorKey`）へ切り替え、送信で `update`／`updateReply` を呼ぶ。キャンセルで本文を変えずに読み取り表示へ戻す
  - 削除ボタンで軽量な確認手段（インラインコメント専用。`DeleteCommentModal`は再利用しない）を開き、確認で `remove`／`removeReply` を呼ぶ
  - `InlineCommentItem.spec.tsx`／`InlineCommentReplies.spec.tsx`（対応するテストファイル）に、投稿者本人にのみ操作が表示されること・リードオンリー制限下で無効化されること・編集の送信/キャンセル・削除の確認前後の呼び出しを検証する単体テストを追加し、すべて green になる
  - _Requirements: 1.1, 1.2, 1.4, 1.6, 2.1, 2.2, 2.7_
  - _Boundary: InlineCommentItem, InlineCommentReplies_
  - _Depends: 3, 4_

- [x] 6. (P) ポップオーバー（InlineCommentPreviewPopover）に起点コメントの編集を追加し、状態バッジを削除する
  - 起点コメントの編集手段を追加する（同じ投稿者本人チェック、`MentionAwareCommentInput`の`initialValue`を再利用）
  - `inline-comment-status` バッジのマークアップを完全に削除する（このポップオーバーは未解決のコメントに対してしか開かれないため）
  - 解決する操作ボタンは残す。削除操作は追加しない
  - `InlineCommentPreviewPopover.spec.tsx` に、状態バッジが一切描画されないこと（要件5.3の退行防止）・編集手段が起点コメントを更新すること・削除操作が存在しないことを検証する単体テストを追加し、すべて green になる
  - _Requirements: 1.7, 5.2, 5.3_
  - _Boundary: InlineCommentPreviewPopover_
  - _Depends: 3, 4_

- [x] 7. (P) 表示中のコメントが消えたときにポップオーバーの内部状態をクリアする（InlineCommentBodyInteraction）
  - `inlineComments.find((c) => c.id === (pinnedId ?? hoverPreviewId))` が `undefined` になった時点で、該当する `pinnedId`／`hoverPreviewId` をクリアする
  - `InlineCommentBodyInteraction.spec.tsx` に、表示中のidが `inlineComments` から消えた場合（解決済み・削除済みいずれのシミュレーションでも）にポップオーバーの描画が止まり、内部stateがクリアされることを検証する単体テストを追加し、すべて green になる
  - _Requirements: 4.3, 5.1_
  - _Boundary: InlineCommentBodyInteraction_

- [x] 8. 解決済みコメントのアンカー除外と、更新・削除ユーティリティの配線を行う（PageView.tsx）
  - `inlineCommentAnchors` の既存の `.map()` の前に `.filter((c) => c.resolvedAt == null)` を追加する
  - 新しい `update`／`updateReply`／`remove`／`removeReply` を、既存の `resolve`／`createReply` と並べて一覧側バンドルと `InlineCommentBodyInteraction`／`InlineCommentPreviewPopover` へ渡す
  - 型チェック・既存の全単体テストがgreenのまま保たれることを確認する
  - _Requirements: 2.5, 4.1, 4.4_
  - _Depends: 2, 3, 5, 6, 7_

- [x] 9. Validation: 実ブラウザでの回帰確認
- [x] 9.1 編集フローを確認する
  - 一覧・ポップオーバーそれぞれから起点コメントを編集し、新しい本文がリロード後も保持されることをPlaywrightで確認する
  - 一覧から返信を編集し、新しい本文が保持されることを確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.7_
  - _Depends: 8_

- [x] 9.2 削除フローを確認する
  - 返信を削除すると、その返信だけが消え、起点コメントや他の返信はそのまま残ることを確認する
  - 起点コメントを削除すると、起点・すべての返信・本文中のハイライト／ポップオーバーがすべて消えることを確認する
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - _Depends: 8_

- [x] 9.3 投稿者本人以外からの操作が拒否されることを確認する
  - 投稿者本人以外のブラウザセッションには、一覧・ポップオーバーいずれにも編集・削除操作が表示されないことを確認する
  - _Requirements: 1.5, 1.6, 2.6, 2.7, 3.1_
  - _Depends: 8_

- [x] 9.4 解決済みコメントの本文非表示と、開いたままのポップオーバーの挙動を確認する
  - 解決済みのコメントは、ページを開き直してもハイライト・ポップオーバーが一切出現せず、一覧には引き続き表示されることを確認する
  - ポップオーバーを開いたまま解決すると、ポップオーバーが閉じることを確認する
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1_
  - _Depends: 8_

- [ ] 10. 変更を inline-comment スペックへ port back し、本スペックを削除する
- [x] 10.1 `.kiro/specs/inline-comment` の Non-Goals（requirements.md Introduction・design.md）から「インラインコメントの編集・削除」の除外を撤回する
- [x] 10.2 `.kiro/specs/inline-comment` の Requirement 15.5 を、ポップオーバーからの編集を許可する記述に改める。あわせて **Requirement 2**（インラインコメントの表示）に「解決済みは本文中に表示しない」受け入れ基準を追加し、**Requirement 15** に編集・削除・解決済み関連の新しい受け入れ基準を追加する（Amend Targetセクションが挙げる両方の要件に確実に反映する）
- [x] 10.3 `.kiro/specs/inline-comment` の design.md における関連コンポーネントの記述を、本スペックの決定（サービスメソッドの分割方針・`removeWithReplies`の再利用・`inlineCommentAnchors`でのフィルタ・ポップオーバーのバッジ削除）を反映して書き直す
- [x] 10.4 設計判断の根拠（研究ログの Design Decisions）を `.kiro/specs/inline-comment` の research.md へ移す
- [ ] 10.5 `.kiro/specs/inline-comment` の spec.json の `updated_at` を更新し、roadmap.md に本スペックの記載があれば削除し、`.kiro/specs/inline-comment-edit-delete/` を削除する
  - _Depends: 9.1, 9.2, 9.3, 9.4_

## Implementation Notes
- Task 2.1 (and by extension 2.2–2.4): tasks.md's route tasks did not explicitly call out registering the new routes in `apps/app/src/server/routes/apiv3/index.js` (the existing 4 inline-comment routes are wired there under `inlineCommentsRouter`). Added the wiring as part of landing each route so the route is actually reachable in production, not just covered by its own `.integ.ts`. Flagged by task 2.1's reviewer.
- Task 5: `PageComment.tsx`'s existing `<InlineCommentItem>` call site does not yet compile with the new required props (`update`/`remove`/`updateReply`/`removeReply`) — expected, resolved by task 8. Also noted (non-blocking reviewer suggestions): an edit failure may surface in two places (the editor's own error state plus the item-level `editError`), since `MentionAwareCommentInput` re-displays a re-thrown submit error internally too; and `InlineCommentReplies`' per-reply state isolation (via a per-reply subcomponent) has no direct multi-reply test asserting one reply's edit doesn't affect a sibling's — structurally sound but worth a follow-up test.
- Task 9: a pre-existing Playwright test at `inline-comment.spec.ts` (~line 2013, "Desktop: hovering the highlight shows the comment content...") asserted the popover has NO edit button — that encoded the old Non-Goal this spec's Requirement 1.7 explicitly overturns. Removed the stale `toHaveCount(0)` assertion and updated its comment; the adjacent reply-textarea assertion is untouched. Found and fixed as part of task 9's validation run, verified by task 9's reviewer.
- Task 10.2: the Amend Target section suggested folding new edit/delete ACs into existing Requirements 1-5/15, but appending them to Requirement 1 (whose Objective is comment creation via text selection) read as a mismatched grab-bag on review. Created a new **Requirement 18: 起点コメント・返信の編集・削除** in the target spec instead, holding ACs 18.1-18.9 (the edit/delete-specific ACs); Requirement 2 and 15 still received their own display/popover-specific new ACs as originally planned.

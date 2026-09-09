# Implementation Plan

- [x] 1. (P) ホバー表示の遅延出現・遅延消失・ポップオーバー内ロックを実装する（InlineCommentBodyInteraction）
  - `hoverPreviewId` state と `showTimerRef`/`hideTimerRef`（`useRef`）を追加し、hover 由来の `hit` が一定時間（150ms）継続したときのみ `hoverPreviewId` をセットする
  - hover 由来の `hit` が `null` になった後も、一定時間（250ms）は `hoverPreviewId` の表示を維持してから消す
  - `handlePointerEnterPopover` コールバックを実装し、呼ばれた時点で保留中の非表示タイマーを解除し、`pinnedId = hoverPreviewId` に昇格させ `hoverPreviewId` をクリアする（既に `pinnedId` がある場合は何もしない）
  - クリック由来の `hit` は既存通り遅延なく即座に `pinnedId` をセットする（変更しない）
  - コンポーネントのアンマウント時、および `hit`/`pinnedId` が変化した時点で保留中のタイマーをすべて解除する
  - `InlineCommentBodyInteraction.spec.tsx` に、上記の遅延出現・遅延消失・昇格後は自動で閉じないこと・クリック経路が変わらないことを検証する単体テストを追加し、すべて green になる
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - _Boundary: InlineCommentBodyInteraction_

- [x] 2. (P) ポップオーバーへの解決操作とホバーロック通知を追加する（InlineCommentPreviewPopover）
  - `resolve: (id: string, resolved: boolean) => Promise<unknown>` prop を追加し、`comment.resolvedAt != null` で解決済み/未解決を判定するバッジと、判定を反転させて `resolve(comment.id, !isResolved)` を呼ぶトグルボタンを、`CommentCard` の `headerEnd` スロットに追加する（`InlineCommentItem.tsx` と同じクラス名・同じ判定を用いる）
  - トグル操作が失敗した場合に表示するローカルなエラー表示（`resolveError`）を追加する
  - `onPointerEnter: () => void` prop を追加し、ポップオーバーのルート要素の `onMouseEnter` で呼び出す
  - `InlineCommentPreviewPopover.spec.tsx` に、未解決→解決済み・解決済み→未解決それぞれのトグル呼び出し、エラー表示、`onPointerEnter` の呼び出しを検証する単体テストを追加し、すべて green になる
  - _Requirements: 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - _Boundary: InlineCommentPreviewPopover_

- [x] 3. ポップオーバーのレイアウトを構造化レイアウトに刷新する（InlineCommentPreviewPopover）
  - `comment.anchor.quote` を、コメント本文と視覚的に区別できる新しい引用帯として表示する（現状表示されていない情報の追加）
  - 既存の `<textarea>`+ボタンの返信入力欄を、`UserPicture`（`useCurrentUser` で取得した現在の利用者）＋横並びの入力欄＋アイコンの送信ボタンに置き換える（`InlineCommentForm.tsx` の返信入力欄と同じ視覚言語）
  - 本文・返信・返信入力の各セクションの間に区切り線を追加する
  - 返信投稿成功後もポップオーバーが閉じず新しい返信が表示される、既存の挙動を変えない
  - `InlineCommentPreviewPopover.spec.tsx` に、引用帯の表示、新しい返信入力欄からの送信呼び出しを検証する単体テストを追加し、すべて green になる
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - _Boundary: InlineCommentPreviewPopover_
  - _Depends: 2_

- [x] 4. InlineCommentBodyInteraction と InlineCommentPreviewPopover を新しい props で接続し、PageView から resolve を配線する
  - `InlineCommentBodyInteraction` から `InlineCommentPreviewPopover` へ、`onPointerEnter={handlePointerEnterPopover}` と `resolve` prop を渡す
  - `InlineCommentBodyInteraction` 自身が新しい `resolve` prop を受け取れるようにする
  - `PageView.tsx` の `<InlineCommentBodyInteraction>` 呼び出しに、既存の `resolveInlineComment` を `resolve` prop として渡す一行を追加する
  - 型チェック・既存の全単体テスト（`InlineCommentBodyInteraction.spec.tsx`、`InlineCommentPreviewPopover.spec.tsx` を含む）が green のまま保たれる
  - _Requirements: 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - _Depends: 1, 3_

- [ ] 5. Validation: 実ブラウザでの回帰確認
- [ ] 5.1 ホバー遷移中に消えないこと、ポップオーバー上で静止しても閉じないことを確認する
  - ハイライトへのホバー後、ポインタをポップオーバーへ向けて移動させる間、表示が消えないことを Playwright で確認する
  - ポインタがポップオーバー上で静止した後、ハイライト・ポップオーバーの両方から離れても、外側クリックまで表示が維持されることを確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - _Depends: 4_

- [ ] 5.2 ポップオーバーからの解決操作が一覧側と一致すること、クリック経路が変わらないことを確認する
  - ポップオーバー内から解決操作を行い、画面最下部の一覧側のバッジも同じ解決状態に更新されることを Playwright で確認する
  - ハイライトのクリックが遅延なく即座にポップオーバーを表示し、そのまま維持されることを確認する（既存動作の回帰確認）
  - _Requirements: 1.6, 1.7, 2.3, 2.4, 2.6_
  - _Depends: 4_

- [ ] 6. 変更を inline-comment スペックへ port back し、本スペックを削除する
- [ ] 6.1 `.kiro/specs/inline-comment` の Requirement 15 の記述を、遅延出現・遅延消失・ポインタ進入によるロックの仕様に更新する
- [ ] 6.2 `.kiro/specs/inline-comment` の Requirement 4 の記述に、本文中ポップオーバーからの解決操作を追加する
- [ ] 6.3 `.kiro/specs/inline-comment` の design.md における `InlineCommentBodyInteraction`/`InlineCommentPreviewPopover` の記述を、本スペックの決定（`pinnedId` への昇格、`CommentCard` スロットの再利用、遅延時間の定数）を反映して書き直す
- [ ] 6.4 設計判断の根拠（研究ログの Design Decisions）を `.kiro/specs/inline-comment` の research.md へ移す
- [ ] 6.5 `.kiro/specs/inline-comment` の spec.json の `updated_at` を更新し、roadmap.md に本スペックの記載があれば削除し、`.kiro/specs/inline-comment-popover-refinement/` を削除する
  - _Depends: 5.1, 5.2_

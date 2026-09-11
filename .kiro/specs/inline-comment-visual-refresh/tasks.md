# Implementation Plan

- [x] 1. 一覧アイテム（起点コメント）のヘッダー行の見た目を刷新する
- [x] 1.1 状態バッジ・解決トグルボタンをモックアップに合わせる
  - 状態バッジを角丸ピル形にし、未解決は警告系の淡色背景＋濃い文字色、解決済みは成功系の淡色背景＋濃い文字色にする（Bootstrapの意味付きユーティリティクラスのみを使い、ハードコードされた16進色は使わない）
  - バッジ内の状態ドット（小さな円形の装飾）をCSS Modulesで実装し、tsx側にインラインstyleを書かない
  - 解決トグルボタンを角丸ピル形にする（文言は変更しない）
  - 完了したことが分かる状態: `InlineCommentItem.spec.tsx` で、未解決・解決済みそれぞれの状態バッジのクラス名が新しいトークン（`bg-warning-subtle`/`bg-success-subtle`等）に切り替わっていることを検証するテストがgreenになる
  - _Requirements: 1.1, 1.4, 3.1, 3.2, 3.4_
  - _Boundary: InlineCommentItem, InlineCommentItem.module.scss_

- [x] 1.2 編集・削除操作を、通常コメントと同じホバー表示アイコンボタンに変更する
  - 現在の常時表示フッターテキストリンク（編集・削除）を撤去し、`CommentControl.tsx`と同じ`material-symbols-outlined`のアイコン・ボタンクラスパターンを使ったアイコンボタンに置き換える
  - アイコンボタンをヘッダー行の状態バッジ・解決トグルボタンの隣（左側）に配置し、ホバー時のみ表示されるようにする（`visibility`切り替え、`display`は使わない——非表示時のレイアウトシフトを避けるため）
  - `NotAvailableIfReadOnlyUserNotAllowedToComment`によるガード判定は変更しない
  - 完了したことが分かる状態: `InlineCommentItem.spec.tsx`で、投稿者本人にのみ編集・削除アイコンボタンが存在すること、リードオンリー制限下では無効化されること、ボタンがヘッダー行のバッジ・解決トグルボタンと同じコンテナ内に存在すること（DOM構造）を検証するテストがgreenになる
  - _Requirements: 1.5, 1.6, 3.3, 3.5_
  - _Boundary: InlineCommentItem, InlineCommentItem.module.scss_
  - _Depends: 1.1_

- [x] 1.3 引用ブロックをモックアップに合わせ、削除確認をアラート形式に変更する
  - 引用ブロックに淡色背景を追加する（左罫は既存の`--grw-inline-comment-marker-bg`をそのまま使う——一覧側の既存の色付けとの統一を保つ）
  - 現在の裸のテキスト行による削除確認を、アイコン＋メッセージ＋ボタン群を横一列に並べたBootstrapの`alert`コンポーネントベースの表示に変更する（モーダルは使わない）
  - 完了したことが分かる状態: `InlineCommentItem.spec.tsx`で、削除確認が新しいマークアップ（`alert`ベースのコンテナ、アイコン・メッセージ・ボタンの存在）で表示され、確認前に`remove`が呼ばれないことを検証するテストがgreenになる
  - _Requirements: 1.3, 1.7, 3.1, 3.4_
  - _Boundary: InlineCommentItem, InlineCommentItem.module.scss_
  - _Depends: 1.1_

- [x] 2. 返信アイテムの編集・削除操作を一覧アイテムと同じ見た目に揃える
- [x] 2.1 返信の編集・削除アイコンボタンをヘッダー行内ホバー表示に変更する
  - `InlineCommentReplies.tsx`の返信アイテム（`InlineCommentReplyItem`）で、現在の常時表示フッターテキストリンクを撤去し、タスク1.2で`InlineCommentItem.module.scss`に定義したホバー表示アイコンボタンの規則を再利用する
  - 返信には状態バッジ・解決トグルボタンが無いため、アイコンボタンは`CommentCard`の`headerEnd`スロット内に新規に配置する
  - 完了したことが分かる状態: `InlineCommentReplies.spec.tsx`で、投稿者本人にのみ編集・削除アイコンボタンが存在すること、リードオンリー制限下では無効化されること、削除確認前に`removeReply`が呼ばれないことを検証するテストがgreenになる
  - _Requirements: 1.5, 1.6, 3.3, 3.5_
  - _Boundary: InlineCommentReplies_
  - _Depends: 1.2_

- [x] 3. (P) ポップオーバーの見た目を刷新する
- [x] 3.1 (P) ポップオーバー専用のSCSS Moduleを新設し、ヘッダー行・引用ブロックの見た目を刷新する
  - `InlineCommentPreviewPopover.module.scss`を新規作成する
  - 状態バッジ・解決トグルボタンを一覧アイテムと同じクラス構成に変更する
  - 引用ブロックを、一覧アイテムと同じ左罫の色・背景色になるよう統一する（2行クランプの挙動は維持する）
  - 完了したことが分かる状態: `InlineCommentPreviewPopover.spec.tsx`で、状態バッジ・引用ブロックが新しいクラス構成になっていることを検証するテストがgreenになる
  - _Requirements: 1.7, 2.1, 2.3, 3.1, 3.2, 3.4_
  - _Boundary: InlineCommentPreviewPopover, InlineCommentPreviewPopover.module.scss_

- [x] 3.2 返信スレッドと返信フォームの見た目を刷新する
  - 返信一覧に、返信同士をまとめる左側の縦線（Bootstrapのボーダーユーティリティ）を追加する
  - 返信フォームの入力欄を角丸（一行入力を想定した丸み）にする
  - 完了したことが分かる状態: `InlineCommentPreviewPopover.spec.tsx`で、返信一覧・返信フォームの新しいクラス構成を検証する既存テストが（クラス名の更新を経て）green のままであることを確認する
  - _Requirements: 2.1, 3.1, 3.4_
  - _Boundary: InlineCommentPreviewPopover, InlineCommentPreviewPopover.module.scss_
  - _Depends: 3.1_

- [x] 3.3 編集モードの見た目を刷新する
  - 編集モードの入力欄（`MentionAwareCommentInput`）まわりを、アクセントカラーの縁取りにする
  - キャンセル・保存ボタンの配置（入力欄の下、右揃え）を整える
  - 完了したことが分かる状態: `InlineCommentPreviewPopover.spec.tsx`で、編集モードの新しいクラス構成が検証される
  - _Requirements: 2.2, 3.1, 3.4_
  - _Boundary: InlineCommentPreviewPopover, InlineCommentPreviewPopover.module.scss_
  - _Depends: 3.1_

- [x] 4. Validation: 実ブラウザでのモックアップ照合
- [x] 4.1 6状態のスクリーンショットを撮影し、チェックリストと突き合わせる
  - `apps/app/playwright/20-basic-features/inline-comment.spec.ts`に、一覧アイテムの4状態（通常・編集・削除確認・解決済み）とポップオーバーの2状態（通常・編集）それぞれについて、実際に起動した開発サーバー上でスクリーンショットを撮影する手順を追加する
  - `visual-acceptance-checklist.md`の項目を1つずつ、撮影したスクリーンショットと対応するアートボードで突き合わせて判定する
  - 完了したことが分かる状態: 6状態すべてのスクリーンショットが存在し、チェックリストの各項目に✅／⚠️／❌のいずれかの判定が記録されている
  - _Requirements: 4.1, 4.2_
  - _Depends: 1, 2, 3_

- [x] 4.2 ライトモード・ダークモードの両方で意味付きカラークラスの役割を確認する
  - タスク4.1の6状態を、ライトモード・ダークモードそれぞれで確認する
  - 状態バッジ（警告・成功）・削除確認のアラート（危険）が、両モードで意図した役割を保ったまま表示されていることを確認する
  - 完了したことが分かる状態: ライト・ダーク双方のスクリーンショットが存在し、色の役割が両モードで破綻していないことが確認されている
  - _Requirements: 4.4_
  - _Depends: 4.1_

- [x]* 4.3 既存の単体・結合テストがすべてgreenであることを確認する
  - `InlineCommentItem.spec.tsx`／`InlineCommentReplies.spec.tsx`／`InlineCommentPreviewPopover.spec.tsx`を実行し、新しいマークアップ・クラス名に合わせた更新後もすべてgreenであることを確認する
  - 完了したことが分かる状態: 3つの`.spec.tsx`ファイルすべてが green で終了する
  - _Requirements: 4.5_
  - _Depends: 1, 2, 3_

- [x] 4.4 独立レビューによるチェックリスト最終確認
  - タスク4.1・4.2の結果を、実装を行った本人ではない独立したレビュー（`/kiro-validate-impl`相当のゲート、Opusクラスのモデルによる実行）で再確認する
  - チェックリストに⚠️・❌の判定が残っている項目がないことを確認する。残っていれば、該当するタスク（1〜3のいずれか）に差し戻して修正する
  - 完了したことが分かる状態: 独立レビューにより、チェックリストの適用対象項目すべてに✅の判定が記録され、GO判定が下されている
  - _Requirements: 4.3, 4.6_
  - _Depends: 4.1, 4.2, 4.3_

- [x] 5. 実機フィードバックによる追補
  - タスク4.4のGO判定後、ユーザーが実際に機能を使って見つけた指摘・要望に、同じスペックの中で13回に分けて対応した。設計判断そのものは design.md、調べて分かったことは research.md に収めてある。ここには「何を変えたか」だけを残す
- [x] 5.1 削除確認UIを通常コメントとインラインコメントで共通化する
  - 共有コンポーネント `DeleteConfirmAlert.tsx`（+ `.module.scss`）を新設し、`InlineCommentItem.tsx` の警告帯マークアップを抽出する。`testIdPrefix` で呼び出し元ごとの `data-testid` を維持する
  - 通常コメント側を `DeleteCommentModal`（`PageComment.tsx` がページ単位で持つ共有state）から、`Comment.tsx` 自身のローカルstate＋インライン警告帯に移す。削除API呼び出しは `PageComment.tsx` から渡す `onDeleteConfirmed` コールバックとして残す
  - `DeleteCommentModal/` ディレクトリを削除する
  - _Requirements: 1.3_
  - _Boundary: DeleteConfirmAlert, Comment, PageComment, ReplyComments, InlineCommentItem_
- [x] 5.2 ポップオーバーを `CommentCard` から切り離す
  - 起点コメントのヘッダー行・本文表示を、ポップオーバー独自のフラットなマークアップで描き直す。アバターは30px、本体は `card rounded-4 shadow`
  - ヘッダー行から状態バッジを撤去する（解決トグルボタンは残す）
  - _Requirements: 2.1, 2.5, 3.1_
  - _Boundary: InlineCommentPreviewPopover, InlineCommentPreviewPopover.module.scss_
  - _Depends: 3.1_
- [x] 5.3 ポップオーバーの起点コメントと返信を1つのコンポーネントに統合する
  - `InlineCommentPopoverEntry.tsx` を新設し、起点コメント・各返信の両方をこれで描く。編集中・削除確認中の状態は1件ごとのローカルstateにする
  - 返信の編集・削除と、起点コメントの削除をポップオーバーから行えるようにする。`remove`／`updateReply`／`removeReply` を `PageView.tsx` から配線する
  - 「編集中は返信一覧・返信フォームをまとめて隠す」ガードを撤去する
  - _Requirements: 2.6_
  - _Boundary: InlineCommentPopoverEntry, InlineCommentPreviewPopover, InlineCommentBodyInteraction, PageView_
  - _Depends: 5.2_
- [x] 5.4 エディタの初期値が復元されない不具合を直す
  - `packages/editor/src/client/stores/codemirror-editor.ts` の `useCodeMirrorEditorIsolated` を2点修正する（`shouldUpdate` の `isValid` チェック、アンマウント時のatomリセット）
  - _Requirements: 1.2, 2.2_
  - _Boundary: packages/editor codemirror-editor.ts_
- [x] 5.5 ポップオーバーのMarkdownレンダリングを一覧に揃える
  - `RevisionRenderer` に `additionalClassName="comment"` を渡す
  - `PageView.tsx` で `useCommentForCurrentPageOptions()` を呼び、その結果を `InlineCommentBodyInteraction` に渡す（`PageContentRenderer` に渡すページ本文用オプションは変更しない）
  - _Requirements: 2.1_
  - _Boundary: InlineCommentPopoverEntry, PageView_
  - _Depends: 5.3_
- [x] 5.6 ポップオーバーの返信フォームにメンションピッカーを追加する
  - プレーンな `<textarea>` を `MentionAwareCommentInput` + `MentionPickerButton` に差し替える。ローカルの下書き・送信中・エラーstateを `useCommentInputControls()` に置き換える
  - ポップオーバーの外側クリック判定から `.cm-tooltip-autocomplete` を除外する
  - _Requirements: 2.7_
  - _Boundary: InlineCommentPreviewPopover_
  - _Depends: 5.3_
- [x] 5.7 返信フォームに枠を付け、作成フォームを自動フォーカスする
  - 返信フォームに `border border-primary-subtle rounded p-2 gap-2` の枠を付ける
  - `MentionAwareCommentInput` に `autoFocus?: boolean` を追加し、`InlineCommentForm.tsx` だけが渡す
  - _Requirements: 2.7_
  - _Boundary: MentionAwareCommentInput, InlineCommentForm, InlineCommentPreviewPopover_
  - _Depends: 5.6_
- [x] 5.8 編集・削除アイコンのホバー挙動を統一する
  - ホバー表示のトリガーを、外側のラッパーから `:global(.page-comment-main):hover`（各カード自身の箱）に変更し、行ごとに独立して出るようにする
  - 各サーフェスのアイコンボタンのCSS Modulesに `opacity: 0.5` ／ `&:hover { opacity: 0.75; }` を足し、呼び出し側から `opacity-50` を外す
  - _Requirements: 1.5, 1.6, 3.5_
  - _Boundary: InlineCommentItem.module.scss, InlineCommentPreviewPopover.module.scss, CommentControl_
- [x] 5.9 返信の削除確認を `DeleteConfirmAlert` に移行する
  - `InlineCommentReplies.tsx` の手書き警告帯を `<DeleteConfirmAlert testIdPrefix="inline-comment-reply" .../>` に置き換える（ボタンの並びが Delete→Cancel から Cancel→Delete に変わる）
  - _Requirements: 1.3_
  - _Boundary: InlineCommentReplies_
  - _Depends: 5.1_
- [x] 5.10 本文の同一長編集後にハイライトが復元されない不具合を直す
  - `AnchorResolver/use-container-settle.ts` の `observer.observe(...)` に `characterData: true` を足す
  - _Boundary: AnchorResolver/use-container-settle.ts_
- [x] 5.11 一覧側の編集モードを通常コメントと同じ `CommentEditor` に揃える
  - `InlineCommentItem.tsx`／`InlineCommentReplies.tsx` の編集モードを、`MentionAwareCommentInput` + 手組みのボタン行から `CommentEditor` の呼び出し1つに置き換える。永続化は `onSubmit` の上書きで差し替える
  - ポップオーバー側の編集モードは対象外（コンパクトな `MentionAwareCommentInput` のまま）
  - _Requirements: 1.2_
  - _Boundary: InlineCommentItem, InlineCommentReplies_
- [x] 5.12 編集・削除アイコンボタンの組を共通コンポーネントにする
  - `CommentEditDeleteButtons.tsx`（+ `.module.scss`、32px四方と不透明度の規則）を新設し、`CommentControl.tsx`／`InlineCommentItem.tsx`／`InlineCommentReplies.tsx` の3箇所の手書きJSXを置き換える
  - ホバー表示のラッパーは共通化せず、各呼び出し元が持ち続ける
  - ポップオーバーは対象外（常時表示という挙動差があるため、意図的に別実装のまま）
  - _Requirements: 1.5, 3.5_
  - _Boundary: CommentEditDeleteButtons, CommentControl, InlineCommentItem, InlineCommentReplies_
  - _Depends: 5.8_
- [x] 5.13 編集中に消える余白を、後続要素が自分で持つようにする
  - `PageComment.tsx` の「返信する」トグルボタンのラッパーに `mt-2` を付ける（直前のコメントが持つ余白に依存するのをやめる）
  - _Boundary: PageComment_
- [x] 5.14 編集モードは `CommentCard` ごと差し替える
  - `InlineCommentItem.tsx`／`InlineCommentReplies.tsx` で `isEditing` の分岐を `CommentCard` の外側に引き上げ、編集中は裸の `CommentEditor` だけがDOMに存在するようにする
  - _Requirements: 1.2_
  - _Boundary: InlineCommentItem, InlineCommentReplies_
  - _Depends: 5.11, 5.13_
- [x] 5.15 ポップオーバーの返信を古い順に表示する
  - `[...comment.replies].reverse()` で並べ直してから描く（一覧側と同じ）
  - _Requirements: 2.1_
  - _Boundary: InlineCommentPreviewPopover_
  - _Depends: 5.3_
- [x] 5.16 通常コメントの編集・削除アイコンの配置を、パディングを尊重する形に直す
  - `Comment.tsx` の `CommentControl` を `footer` スロットから `headerEnd` スロットへ移し、`ms-auto` のflexフロー内に置く（`position: absolute; top: 0; right: 0` を撤去）
  - `Comment.module.scss` のホバー表示セレクタを、直接の子（`>`）から子孫セレクタに変更する（もう `.page-comment-main` の直接の子ではないため）
  - リビジョン履歴リンクは元の位置（日時の直後、`ms-2`）のまま変更しない
  - _Boundary: Comment, Comment.module.scss_
- [x] 5.17 リビジョン履歴リンクを一覧アイテムにも追加する
  - `Comment.tsx` のリビジョン履歴リンクを共有コンポーネント `PageComment/CommentRevisionLink.tsx` に抽出し、`InlineCommentItem.tsx` からも同じ位置（日時の直後、`ms-2`）で呼び出す
  - `InlineCommentItem`／`PageComment.tsx` に `pagePath` の配線を追加する
  - _Boundary: CommentRevisionLink, Comment, InlineCommentItem, PageComment_
  - _Depends: 5.16_
- [x] 5.18 解決トグルをホバー表示にし、状態バッジをヘッダー行の角に置く
  - `ms-auto` グループ内の並びを 編集/削除 → 解決トグル → 状態バッジ の順にする
  - 解決トグルを `.icon-button-container` で包み、編集・削除アイコンと同じホバー表示にする（従来は常時表示だった）
  - `playwright/20-basic-features/inline-comment.spec.ts` の `resolveToggle` セレクタを子孫セレクタに直し、Resolve/Reopenのクリック前にカードをhoverする
  - _Boundary: InlineCommentItem, inline-comment.spec.ts_
  - _Depends: 5.17_

- [ ] 6. このスペックの内容を `.kiro/specs/inline-comment` に戻して、このスペックを畳む
  - このスペックは、実装完了済みの `.kiro/specs/inline-comment` の契約を変更する amend spec である（`.claude/rules/spec-lifecycle.md`）。実装が入っただけでは完了ではなく、この作業まで終えて初めて完了になる
- [ ] 6.1 `.kiro/specs/inline-comment` の design.md の該当箇所を、現在の実装どおりに書き直す
  - 下の「port back のときに直すこと」に挙げた食い違いを反映する
- [ ] 6.2 設計の根拠を `.kiro/specs/inline-comment` の research.md へ移す
  - このスペックの research.md はディレクトリごと消えるため、消す前に移す
- [ ] 6.3 `.kiro/specs/inline-comment` の requirements.md に、変更された契約分の受け入れ基準を**末尾に追記**する（既存番号の付け替え・削除はしない）
- [ ] 6.4 `.kiro/specs/inline-comment` の spec.json の `updated_at` を更新する（`phase`／`approvals` は触らない）
- [ ] 6.5 `visual-acceptance-checklist.md` の移し先を決める（steering のカスタムファイルか、`.kiro/specs/inline-comment` 配下か）
- [ ] 6.6 `.kiro/specs/inline-comment-visual-refresh/` を削除する

## Implementation Notes

### タスクをまたいで効いてくること

- **タスク単位のレビューだけでは、実装漏れが素通りする。** タスク1.1〜3.3はすべて `[x]`＋レビュー承認済みだったが、実ブラウザでの照合（タスク4.1）で、design.md に書かれていて誰も実装していない指定が2件見つかった。各レビュアーが、そのタスクの説明文と、そのタスクが引用した design.md の箇条書きだけを見ていたためである。**最終レビューには、コンポーネントごとの責務・制約の一覧全体を渡すこと。**
- **Playwrightのセレクタは、解決できなくても落ちない。** 実測値を集める処理は見つからないセレクタを素通りするため、マークアップを変えると証拠が静かに空になったまま緑になる。この事故は2回起きている（ポップオーバーが `CommentCard` を使わなくなったとき、一覧の編集モードが `CommentEditor` になったとき）。マークアップを変えたら、生成された `.json` に当該キーの値が入っているか必ず確認する。さらに厄介な変種として、`.first()` のような「最初に一致したもの」は、DOM構造が変わると**黙って別の要素に移る**——編集中に起点コメントの箱が消えたとき、`item.locator('.page-comment').first()` は返信の箱に解決し直し、自信を持って間違ったスクリーンショットを撮っていた。null にならないぶん見つけにくい。
- **回帰確認は、変更した describe ブロックだけでなく、同じセレクタを使う他のブロックも見る。** 返信フォームを `MentionAwareCommentInput` に差し替えたとき、別の describe ブロックに残っていた `<textarea>` 前提のアサーション3件が2回分あとまで見つからなかった。
- **`packages/editor` には `test` スクリプトが無い**ため、同パッケージのspec（このスペックが追加した回帰テスト2件を含む）はCIで走らない。
- **`.spec.tsx` のモックは、同時に複数マウントされうる入力欄を1つのrefで持たない。** 返信フォームと編集モードの入力欄が同時に立つようになった時点で、「最後にレンダーされたもの」を指すrefは黙って別物を指すようになる。`editorKey` をキーにした `Map` で持つ。
- Playwrightの実行上の罠（`--project=chromium` 指定、`-g` でのテスト名絞り込み、開発サーバー相手のファイル全体実行）は design.md「検証」に書いた。

### port back のときに直すこと（タスク6）

- **保存ボタンの文言**: モックアップは "Save"、実装は `t('Update')`。このコードベースに汎用の "Save" キーが無く、既存の慣習（`SavePageControls.tsx` 等）が `t('Update')` であるため。移す先の design.md／モックアップの文言を "Update" に合わせる。
- **ポップオーバーの横幅**: モックアップの340pxではなく576px。根拠（ヘッダー行に約470px必要、544pxを下回ると要素が切れる）ごと移す。
- **送信ボタンの寸法指定が2通りある**: `InlineCommentForm.tsx` は tsx 内のインラインstyle（`style={{ width: '2rem', height: '2rem' }}`）、ポップオーバーの返信フォームはCSS Modulesの規則（要件3.3を理由として明記）。同じ要素の同じ寸法が同じスペックの中で2通りになっている。どちらに揃えるか決める。
- **`.kiro/specs/inline-comment` 側で確認が要る受け入れ基準**: Requirement 15（ポップオーバー）は、削除操作・返信の編集/削除・返信の表示順について、このスペックが変えた後の挙動を反映していない可能性がある。追記が要るかを確認する。
- **ソースコードのコメントが、消したセクション名を指している**: `InlineCommentItem.tsx` などの冒頭コメントが design.md の「2026-09-11 方針転換その12」といった日付つきの節名を引用しているが、その節はこの整理で恒久的な節に畳んだ。移す先の節名に付け替えるか、節名の引用をやめる。

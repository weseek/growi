# Implementation Plan

- [ ] 1. サーバー側3ルートへの読み取り専用利用者制限の追加
- [x] 1.1 (P) インラインコメント作成に読み取り専用利用者の制限を追加する
  - `create.ts`のミドルウェアチェーンに、`update.ts`と同じ位置（`loginRequired`の直後・express-validatorより前）で`excludeReadOnlyUserIfCommentNotAllowed`を追加する
  - 観測できる完了条件：読み取り専用利用者にコメント投稿が許可されていない設定でPOSTすると400が返り、許可されている設定では従来どおり成功することを結合テストで確認できる
  - _Requirements: 1.1, 1.4, 1.5_
  - _Boundary: create.ts_

- [x] 1.2 (P) インラインコメントへの返信作成に読み取り専用利用者の制限を追加する
  - `create-reply.ts`のミドルウェアチェーンに、同じ位置で`excludeReadOnlyUserIfCommentNotAllowed`を追加する
  - 観測できる完了条件：読み取り専用利用者にコメント投稿が許可されていない設定でPOSTすると400が返り、許可されている設定では従来どおり成功することを結合テストで確認できる
  - _Requirements: 1.2, 1.4, 1.5_
  - _Boundary: create-reply.ts_

- [x] 1.3 (P) インラインコメントの解決/未解決トグルに読み取り専用利用者の制限を追加する
  - `resolve.ts`のミドルウェアチェーンに、同じ位置で`excludeReadOnlyUserIfCommentNotAllowed`を追加する
  - 観測できる完了条件：読み取り専用利用者にコメント投稿が許可されていない設定でPUTすると400が返り、許可されている設定では従来どおり成功することを結合テストで確認できる
  - _Requirements: 1.3, 1.4, 1.5_
  - _Boundary: resolve.ts_

- [ ] 2. クライアント側の操作導線を読み取り専用利用者に対して無効化する
- [x] 2.1 (P) 本文選択からの作成トリガーを無効化する
  - `SelectionCapture.tsx`の`selecting`段階で表示される作成トリガーボタンを、既存の編集・削除ボタンと同じ`NotAvailableIfReadOnlyUserNotAllowedToComment`で包む
  - 観測できる完了条件：読み取り専用利用者にコメント投稿が許可されていない場合、テキスト選択後に現れるボタンが無効化（グレーアウト＋理由を示すツールチップ）されることを単体テストで確認できる。許可されている場合は従来どおり操作できる
  - _Requirements: 2.1, 2.4_
  - _Boundary: SelectionCapture.tsx_

- [x] 2.2 (P) 一覧側の返信作成トリガーを無効化する
  - `InlineCommentReplies.tsx`の「Reply...」トグルボタンを`NotAvailableIfReadOnlyUserNotAllowedToComment`で包む
  - 観測できる完了条件：読み取り専用利用者にコメント投稿が許可されていない場合、「Reply...」ボタンが無効化されることを単体テストで確認できる。許可されている場合は従来どおり返信フォームを開ける
  - _Requirements: 2.2, 2.4_
  - _Boundary: InlineCommentReplies.tsx_

- [x] 2.3 (P) 一覧側の解決トグルを無効化する
  - `InlineCommentItem.tsx`の解決/未解決切り替えボタンを`NotAvailableIfReadOnlyUserNotAllowedToComment`で包む
  - 観測できる完了条件：読み取り専用利用者にコメント投稿が許可されていない場合、一覧側の解決トグルボタンが無効化されることを単体テストで確認できる。許可されている場合は従来どおり切り替えられる
  - _Requirements: 2.3, 2.4_
  - _Boundary: InlineCommentItem.tsx_

- [x] 2.4 (P) ポップオーバー側の返信作成フォームと解決トグルを無効化する
  - `InlineCommentPreviewPopover.tsx`の返信入力フォーム全体（トグル段階を持たず常時表示のため）と、解決/未解決切り替えボタンの2箇所を、それぞれ`NotAvailableIfReadOnlyUserNotAllowedToComment`で包む
  - 観測できる完了条件：読み取り専用利用者にコメント投稿が許可されていない場合、ポップオーバー内の返信フォーム・解決トグルの両方が無効化されることを単体テストで確認できる。許可されている場合は従来どおり操作できる
  - _Requirements: 2.2, 2.3, 2.4_
  - _Boundary: InlineCommentPreviewPopover.tsx_

- [ ] 3. 検証：既存機能への回帰がないことの確認
- [ ] 3.1 通常コメント・編集削除4ルートが変更されていないことを確認する
  - 通常コメント機能（`apps/app/src/server/routes/comment.js`）と、編集・削除4ルート（`update.ts`／`update-reply.ts`／`delete.ts`／`delete-reply.ts`）にファイル差分が無いことを確認し、既存の結合テスト（`update.integ.ts`等）が変更なしに緑のままであることを確認する
  - 観測できる完了条件：`git diff`で対象ファイルの変更が無いこと、および既存結合テストスイートが全件成功することの両方を確認できる
  - _Requirements: 3.1, 3.2_
  - _Depends: 1.1, 1.2, 1.3_

- [ ] 3.2 許可設定時の成功レスポンスが変更前と同じであることを確認する
  - 読み取り専用利用者にコメント投稿が許可されている設定で、作成・返信作成・解決トグルの3操作それぞれを行い、レスポンスの形状が本spec適用前と変わらないことを結合テストで確認する
  - 観測できる完了条件：3操作それぞれについて、許可設定下での成功レスポンス（ステータスコード・ボディ形状）が既存の結合テストと同じ形で緑になることを確認できる
  - _Requirements: 3.3_
  - _Depends: 1.1, 1.2, 1.3_

- [ ] 4. inline-commentへの変更の折り込みと本specの削除
  - _Depends: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_
- [ ] 4.1 inline-commentのdesign.mdの記述を書き換える
  - design.md（Server節、`API Contract`直後の段落）とresearch.md（341〜345行）の「作成・解決トグルの既存3ルートにはこの制限が無いが、これは本スペックの対象外」という記述を、現在の事実（3ルートとも`excludeReadOnlyUserIfCommentNotAllowed`を通す）に書き換える。他specへの参照や経緯の説明は残さない
  - _Requirements: —（spec-lifecycle手続き）_
- [ ] 4.2 inline-commentのspec.jsonのupdated_atを更新する
  - `phase`・`approvals`は変更しない
  - _Requirements: —（spec-lifecycle手続き）_
- [ ] 4.3 roadmap.md等の本spec参照を除去する
  - 本specの行が`.kiro/steering/roadmap.md`等に存在する場合は削除する（無ければ何もしない）
  - _Requirements: —（spec-lifecycle手続き）_
- [ ] 4.4 .kiro/specs/inline-comment-readonly-restriction/を削除する
  - _Requirements: —（spec-lifecycle手続き）_

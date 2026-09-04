# Implementation Plan

- [ ] 1. 基盤: 色トークン・エディタ露出・翻訳キー
- [x] 1.1 ハイライト色のテーマ対応トークンを追加する
  - `apps/app/src/styles/_marker.scss` の `:root` に `--grw-inline-comment-marker-bg: var(--grw-marker-bg, var(--grw-marker-bg-yellow))` を追加する
  - 観測できる完了条件：ブラウザの開発者ツールで `document.documentElement` の計算済みスタイルを見たとき、`--grw-inline-comment-marker-bg` が `--grw-marker-bg` の実効値（既定テーマでは `#FFFA90`）に解決されることを確認できる
  - _Requirements: 12.1, 12.2_

- [x] 1.2 (P) `CodeMirrorEditorProps` に `hideToolbar` を公開する
  - `packages/editor/src/client/components-internal/CodeMirrorEditor/CodeMirrorEditor.tsx` の公開 `CodeMirrorEditorProps` に、既存の内部実装 `hideToolbar?: boolean` を追加する（実装本体は変更しない。`CodeMirrorEditorReadOnly.tsx` が既に使っている値をそのまま公開するだけ）
  - 観測できる完了条件：`CodeMirrorEditorComment` から `hideToolbar` を渡せることを型チェックで確認できる
  - _Requirements: 13.3_
  - _Boundary: packages/editor_

- [x] 1.3 (P) インラインコメント用の翻訳キーを追加する
  - `apps/app/public/static/locales/en_US/translation.json` に `inline_comment.start_comment` / `inline_comment.resolved` / `inline_comment.unresolved` / `inline_comment.resolve` / `inline_comment.reopen` / `inline_comment.label` の6キーを追加する
  - 観測できる完了条件：6キーすべてが `en_US/translation.json` から取得できる
  - _Requirements: 11.6_

- [ ] 2. 作成UI（起点ボタン・入力フォーム）のテーマ対応化
- [x] 2.1 (P) 作成の起点ボタンをBootstrap5・テーマ対応のスタイルにする
  - `SelectionActionButton.tsx` に `className`（`btn btn-sm shadow-sm d-inline-flex align-items-center gap-1`＋新規`SelectionActionButton.module.scss`）とアイコンを追加し、ラベルを `t('inline_comment.start_comment')` に置き換える
  - `SelectionActionButton.module.scss` は `--bs-btn-bg`/`--bs-btn-color`/`--bs-btn-border-color` 等を `--bs-body-bg`/`--bs-body-color`/`--bs-border-color`/`--bs-secondary-bg`/`--bs-tertiary-bg`（16テーマすべてで出力される、primary/secondaryに限定されないプロパティ）で上書きする
  - 観測できる完了条件：ブラウザ操作で、CSSクラスの付いていない既定ボタンの見た目ではなく、枠線・角丸を持つボタンが選択範囲近傍に表示されることを確認できる
  - _Requirements: 11.1, 11.2, 11.6_
  - _Depends: 1.3_
  - _Boundary: SelectionActionButton_

- [x] 2.2 (P) 入力フォームの引用表示・操作ボタン群をBootstrap5・テーマ対応のスタイルにする
  - `InlineCommentForm.tsx` の引用要素に新規 `InlineCommentForm.module.scss` の `inline-comment-form-quote`（`border-left: 3px solid var(--grw-inline-comment-marker-bg)`）を適用する
  - 取り消しボタンに `btn btn-sm btn-outline-secondary`、送信ボタンに `btn btn-sm btn-primary` を適用し、文言を既存キー `t('Cancel')`/`t('page_comment.comment')` に置き換える（`--bs-primary`/`--bs-secondary` はテーマごとに再生成される数少ない色であるため採用する）
  - `MentionPickerButton` の `DropdownToggle` に `color="link"` と `className="btn-sm text-body-secondary"` を渡し、既定の `btn-secondary`（テーマ非追随の濃い灰色）をやめる
  - `CodeMirrorEditorComment` に `hideToolbar` を渡し、`cmProps` に `basicSetup: { lineNumbers: false, foldGutter: false }` を追加してツールバー・行番号の余白を消す（通常コメント入力欄`CommentEditor.tsx`はどちらも渡さないため無変更）
  - `CommentEditor.tsx`（通常コメント入力欄）の既存ユニットテストが無変更のままgreenであることを確認し、`hideToolbar`を渡していないことのアサーションを1件追加する（本タスクが`packages/editor`側に加える型変更が、通常コメント入力欄の見た目・挙動を変えていないことを固定するため）
  - 観測できる完了条件：ブラウザ操作で、入力フォームの引用文がハイライト色と同じ系統の縦線付きで表示され、ツールバー・行番号の余白が表示されず、取り消し・送信ボタンがテーマの主要色系のボタンスタイルで表示されることを確認できる
  - _Requirements: 11.1, 11.2, 11.5, 11.6, 13.3_
  - _Depends: 1.1, 1.2, 1.3_
  - _Boundary: InlineCommentForm_

- [ ] 3. ハイライト色の3状態統一
- [x] 3.1 (P) 保存済みコメントのハイライト色をテーマ対応トークンに切り替える
  - `InlineCommentHighlight.tsx` の `::highlight()` の `background-color` を `var(--bs-warning-bg-subtle, rgba(255, 193, 7, 0.35))` から `var(--grw-inline-comment-marker-bg)` に変更する（テーマ非追随のフォールバックは削除する）
  - 観測できる完了条件：既存のユニットテストを更新し、生成されるスタイル文字列が新しいカスタムプロパティを参照することを確認できる
  - _Requirements: 12.1, 12.3, 12.8_
  - _Depends: 1.1_
  - _Boundary: InlineCommentHighlight_

- [x] 3.2 (P) 作成中の範囲を示すハイライトコンポーネントを新設する
  - `PendingSelectionHighlight`（`range: Range | null`, `containerRef`を受け取る）を新規実装する。渡された`range`を`CSS.highlights`に登録し、`containerRef`にスコープ用のdata属性を付けて`::selection`の背景色・文字色を`--grw-inline-comment-marker-bg`/`--bs-body-color`で上書きするグローバルスタイルを出す。`range`が`null`のときは登録・属性とも行わない
  - 観測できる完了条件：モックした`Range`を渡すとCSSハイライトへの登録とdata属性の付与が行われ、アンマウントまたは`range`が`null`になったときに両方とも取り除かれることをユニットテストで確認できる
  - _Requirements: 12.1, 12.4, 12.7_
  - _Depends: 1.1_
  - _Boundary: PendingSelectionHighlight_

- [x] 3.3 `SelectionCapture`に作成中ハイライトを組み込む
  - `selecting`段階では`PendingSelectionHighlight`に`liveRange`を、`composing`段階では`committedRange`を渡す。`idle`段階では`SelectionCapture`が`null`を返すため自然に消える（状態機械そのものは変更しない）
  - 観測できる完了条件：選択中・入力フォームを開いて入力欄にカーソルを移した後の両方で、対象範囲に同じハイライト色が表示され続けることをユニットテストまたはブラウザ操作で確認できる
  - _Requirements: 12.4, 12.5, 12.6, 12.7_
  - _Depends: 3.2_
  - _Boundary: SelectionCapture_

- [x] 3.4 色の直値が使われていないことを固定する回帰テストを追加する
  - `apps/app/src/features/inline-comment/client/no-literal-colors.spec.ts` を新規作成し、`apps/app/src/features/inline-comment/` 配下の `*.ts`/`*.tsx`/`*.scss`/`*.module.scss`（`*.spec.*` を除く）に `#[0-9a-fA-F]{3,8}`/`rgb(`/`rgba(` が一致しないことを確認する
  - 観測できる完了条件：このテストがgreenになる（タスク2.1・2.2・3.1がすべて完了し、`InlineCommentHighlight.tsx`の直値`rgba(255, 193, 7, 0.35)`が除去された後に実行する）
  - _Requirements: 11.2, 12.2_
  - _Depends: 2.1, 2.2, 3.1_

- [ ] 4. 通常コメントとの共有カードコンポーネント
- [x] 4.1 既存の通常コメント表示を固定する回帰テストを新規作成する
  - `apps/app/src/client/components/PageComment/Comment.spec.tsx` を新規作成する（現状このディレクトリにテストが1つも無い）。文字列の一致ではなく、`comment-styles`モジュールクラス→`.page-comment`→`.page-comment-main.bg-comment.rounded`→見出し行（`d-flex align-items-center`）と`.page-comment-body`、という入れ物の連なりをDOM構造として確認する
  - 観測できる完了条件：現状の`Comment.tsx`に対してこのテストがgreenになる（タスク4.3の書き換え前後で崩れないことを確認するための基準点にする）
  - _Requirements: 13.9_
  - _Boundary: Comment_

- [x] 4.2 (P) コメントの箱を担う共有コンポーネント`CommentCard`を切り出す
  - `apps/app/src/client/components/PageComment/CommentCard/`に、`id`/`creator`（`null`可）/`createdAt`（`Date | string`）/`rootClassName`/`headerEnd`/`beforeBody`/`children`/`footer`を受け取る`CommentCard`を新規実装する。`Comment.tsx`の現在の`.page-comment`以下のDOM構造をそのまま移す
  - `CommentCard`自身はCSSモジュールを持たない（`Comment.module.scss`の規則が`:global(.page-comment)`の入れ子で書かれているため、使う側が`_comment-inheritance.scss`の`%bg-comment`/`%comment-section`/`%user-picture`を`@use`/`@extend`する入れ物を用意する）
  - 観測できる完了条件：`headerEnd`/`beforeBody`/`footer`に渡した内容がそれぞれ正しい位置に描画されることをユニットテストで確認できる
  - _Requirements: 13.3, 13.4_
  - _Boundary: CommentCard_

- [x] 4.3 通常コメント表示を`CommentCard`を使う形に書き換える
  - `Comment.tsx`の内側を`CommentCard`の呼び出しに置き換える。外側の`comment-styles`モジュールの入れ物は残す。`headerEnd`にリビジョンへのリンクと吹き出し、`footer`に`page-comment-meta`と`CommentControl`を渡す
  - `Comment.module.scss`は変更しない
  - 観測できる完了条件：タスク4.1で作成した`Comment.spec.tsx`がこの書き換え後もgreenになる（出力DOMが変わっていないことの確認）
  - _Requirements: 13.9_
  - _Depends: 4.1, 4.2_
  - _Boundary: Comment_

- [ ] 5. インラインコメント側の投稿者情報とカード表示
- [x] 5.1 (P) 一覧取得に投稿者情報を含める
  - `IInlineComment`に`creator: IUserHasId | null`を追加する（`creatorId`は残す）。`InlineCommentService.listByPageId()`の2本の`findMany()`に`include: { creator: true }`を追加し、`toInlineCommentFromListRow()`で`serializeUserSecurely`を通した`creator`を設定する
  - 観測できる完了条件：一覧取得の結果に、投稿者の秘匿処理済みユーザー情報が含まれることをユニットテストで確認できる
  - _Requirements: 13.5_
  - _Boundary: InlineCommentService_

- [x] 5.2 インラインコメントの一覧項目を`CommentCard`を使う形に書き換える
  - `InlineCommentList/`内の項目コンポーネントを`InlineCommentItem/`（新規ディレクトリ）に移し、`CommentCard`を使う形に書き換える。`headerEnd`に未解決/解決済みの札と解決トグル、`beforeBody`に種別ラベル行（アイコン＋`t('inline_comment.label')`）と引用文（`inline-comment-quote`、左3pxの`--grw-inline-comment-marker-bg`縦線）を渡す
  - `RevisionRenderer`に`additionalClassName="comment"`を渡す（現状渡しておらず、`Comment.module.scss`の段落・引用の余白規則が効いていない）
  - 未解決/解決済みの札の配色（`bg-warning text-dark`）は変更しない
  - 観測できる完了条件：投稿者アイコン・名前・日時・種別ラベル・引用文が、通常コメントと同じ箱の中に表示されることをユニットテストで確認できる
  - _Requirements: 13.3, 13.4, 13.6, 13.7, 13.10_
  - _Depends: 4.2, 5.1, 1.3_
  - _Boundary: InlineCommentItem_

- [x] 5.3 (P) 返信表示を`CommentCard`を使う形に書き換える
  - `InlineCommentReplies.tsx`の各返信を`CommentCard`で包む。字下げ（`ms-4 ms-sm-5 mt-2`）は維持する。返信の「Reply」ボタンの文言を既存キー`t('page_comment.reply')`に置き換える。返信入力欄の素の`<textarea>`はそのままにする
  - 観測できる完了条件：返信が通常コメントと同じ箱の中に表示されることをユニットテストで確認できる
  - _Requirements: 13.3, 13.4_
  - _Depends: 4.2_
  - _Boundary: InlineCommentReplies_

- [ ] 6. 通常コメントとインラインコメントの一覧統合
- [x] 6.1 `PageComment`で2種類のコメントを1つの一覧に統合する
  - `PageComment.tsx`が`inlineComments`をpropsで受け取り、通常コメント（返信を除く起点）とインラインコメントを`createdAt`順に混ぜた1つの配列として並べる。`createdAt`は`Date`型で宣言されているが実体はISO文字列であるため、比較前に必ず`parseISO`等で`Date`化してから比較する（文字列同士の減算は`NaN`になり並び替えが機能しない）
  - 観測できる完了条件：通常コメント2件とインラインコメント1件を投稿日時が交互になるように与えたとき、一覧の子要素の順序が投稿日時順になることをユニットテストで確認できる
  - _Requirements: 13.1, 13.2_
  - _Depends: 5.2, 5.3_
  - _Boundary: PageComment_

- [x] 6.2 (P) `Comments`が`inlineComments`を受け取って渡す
  - `Comments.tsx`に`inlineComments`propを追加し、`PageComment`にそのまま渡す。省略時は空配列として扱う
  - 観測できる完了条件：`inlineComments`を渡さずに`Comments`をレンダーしてもエラーにならないことをユニットテストで確認できる
  - _Requirements: 13.8_
  - _Depends: 6.1_
  - _Boundary: Comments_

- [x] 6.3 `PageView`から`inlineComments`をpropsで渡し、旧`InlineCommentList`の直接描画をやめる
  - `PageView.tsx`の既存の`useSWRxInlineComments(isSharedPageView ? null : page._id)`呼び出しはそのまま維持し（新しい取得を増やさない）、その結果を`<Comments inlineComments={inlineComments} .../>`として渡す。`<InlineCommentList>`を`<Comments>`の兄弟として直接描画している現在の配線を削除する
  - `ShareLinkPageView.tsx`は`inlineComments`を渡さない（既存のまま）
  - `apps/app/src/features/inline-comment/client/components/InlineCommentList/`ディレクトリを削除する（中身は5.2/5.3で`InlineCommentItem/`へ移設済み）
  - 観測できる完了条件：通常のページ表示で、インラインコメントが末尾コメント一覧の中に投稿日時順で表示され、共有リンク経由のページ表示ではインラインコメントが一切表示されないことをブラウザ操作で確認できる
  - _Requirements: 13.1, 13.8_
  - _Depends: 6.2_
  - _Boundary: PageView_

- [ ] 7. 検証：横断的な確認
- [x] 7.1 E2E: テーマ切り替えで作成UIの配色が追随することを確認する
  - `data-bs-theme`を`light`/`dark`に切り替え、作成の起点ボタン・入力フォームの背景色・境界線色・文字色が変わることを確認する
  - 観測できる完了条件：E2Eテストがgreenになる
  - _Requirements: 11.3, 11.4_
  - _Depends: 2.1, 2.2_

- [ ] 7.2 E2E: 選択中・入力中・保存後の3状態で同じハイライト色になることを確認する
  - テキスト選択直後、作成の起点を選んで入力欄にカーソルを移した後、コメント送信後の3つの時点で対象範囲の背景色を取得し、3つとも同じ値であることを確認する
  - 観測できる完了条件：E2Eテストがgreenになる
  - _Requirements: 12.4, 12.5, 12.6, 12.8_
  - _Depends: 3.3_

- [ ] 7.3 E2E: 通常コメントとインラインコメントが1つの一覧に同じ見た目で並ぶことを確認する
  - 通常コメントとインラインコメントを両方投稿し、末尾コメント一覧の中に投稿日時順で並び、双方が同じ背景色・境界線・角丸の箱で表示されることを確認する。あわせて既存の`Comment.spec.tsx`（タスク4.1）とインラインコメントE2Eの回帰が崩れていないことを確認する
  - 観測できる完了条件：E2Eテストがgreenになる
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.9_
  - _Depends: 6.3, 7.1, 7.2_

## Implementation Notes

- 5.2: `CommentCardProps.creator`（task 4.2）は`IUserSerializedSecurely<IUserHasId>`を受けられなかった（インラインコメントの`creator`はまさにこの型）。修正として`CommentCard.tsx`と`apps/app/src/components/User/Username.tsx`の`creator`/`user`の型union に`IUserSerializedSecurely<IUserHasId>`を追加した（型のみ・`isPopulated()`はオブジェクトかどうかしか見ないため実行時の挙動は不変）。両ファイルとも task 5.2 の`_Boundary: InlineCommentItem_`の外だが、5.2がコンパイルするために必須だったため含めた。
- 5.2のRED実測: `InlineCommentItem.spec.tsx`はファイル新規作成のため、実装前に`pnpm vitest run InlineCommentItem.spec`を実行すると`Error: Failed to resolve import "./InlineCommentItem"`で全件失敗することを実装者が確認済み（該当タスクの実装者レポート参照）。追加のミューテーション確認として、`RevisionRenderer`から`additionalClassName="comment"`を外すと該当テストが1件RED化することも確認済み。

- 5.1: `IInlineComment.creator`を必須にした結果、`PageView.spec.tsx`・`InlineCommentList.spec.tsx`・`apps/app/src/features/inline-comment/client/stores/inline-comment.spec.tsx`のテスト内フィクスチャがtsgoで型エラーになる（`creator`欠落）。`InlineCommentList.spec.tsx`は5.2で修正済み。`PageView.spec.tsx`・`inline-comment.spec.tsx`の2件は5.2・5.3のBoundary外で未着手のまま残っている（5.3レビューで確認済み）。6.3（`PageView.tsx`配線）で`PageView.spec.tsx`を、6.1/6.2いずれかで`inline-comment.spec.tsx`を直すこと。7.x（検証フェーズ）の前に必ずtsgoがcleanになっていることを確認する。
- 7.1: `playwright.config.ts`の`devices[\`Desktop ${browser}\`]`は`browser`が小文字（`'firefox'`/`'webkit'`）のため実際のdevices辞書キー（`'Desktop Firefox'`/`'Desktop Webkit'`）と一致せず、firefox/webkitプロジェクトは実質Chromiumにフォールバックしている（本amend発見の既存バグ、対象外・別途要修正）。本タスクの検証は`--project=chromium`のみで実施。
- 7.1レビューで判明: 実装者の「デバッグ用ページを削除済み」という自己申告は事実と異なり、レビュー時点で`/debug-visual-consistency2`が本番相当のMongoDBに残存していた（レビュアーが削除して解消済み）。以降のこの実装者の後片付け系の自己申告は要検証。
- 6.1: `PageComment.tsx`の`inlineComments`propは設計の記述（配列そのもの）と異なり、`{ comments, resolve, createReply }`をまとめたオブジェクトにした。`InlineCommentItem`（5.2）が`resolve`/`createReply`を必須で要求し、これらは`useSWRxInlineComments`と同じフックの戻り値なので、データと分離すると`PageComment`内で2本目の取得が要る＝Requirement 13.8（共有リンクに漏れない）の構造的な担保が崩れるため。6.2は`Comments`にこのオブジェクトをそのまま素通しさせること（「省略時は空配列」ではなく「省略時はprop自体を渡さない」）。6.3は`PageView.tsx`側で`resolve`/`createReply`も`useSWRxInlineComments`の戻り値から渡すこと（現状は`data`しか使っていない）。
- 6.1で対応しなかった`apps/app/src/features/inline-comment/client/stores/inline-comment.spec.tsx`のtsgoエラー（5.1由来）は6.2で直すこと。7.x（検証）前に`tsgo`がcleanになっているか確認必須。
- 5.3レビューで判明: `InlineCommentReply`は`creatorId`のみで投稿者の実データ（`creator`）を持たない。`inline-comment-service.ts`の返信側`findMany()`は`include: { creator: true }`を要求しているのに`toInlineCommentReplyFromListRow()`が`row.creator`を捨てている（5.1由来の無駄なjoin＋欠落）。返信の投稿者アイコン・名前が実データで出ない状態。本amendのRequirement 13.4は起点コメントの並びを指しており返信は対象外と判断し、このamendでは対応しない（別途フォローアップ課題として記録）。

- 4.2 レビューで design.md 自身の矛盾（Req 13.9 違反の恐れ）が見つかり、design.md を訂正した（決定2の`CommentCardProps`/JSX/rationale、決定6の`InlineCommentItem`の`headerEnd`例、File Structure Planの誤記）。訂正内容:
  - `CommentCard`は`headerEnd`を`<span className="ms-auto">`で包まない。余白は呼び出し側が`headerEnd`に渡す中身自身に付ける（通常コメントは`ms-2`のまま、`InlineCommentItem`は`ms-auto`を自分で付ける）。
  - `CommentCard`は`creator`が`null`/未populateでも`UserPicture`/`Username`を隠さない（両コンポーネントとも既に自前のフォールバック表示を持つため、素通しするだけでよい）。
  - `CommentCardProps.creator`の型は`IUserHasId | Ref<IUser> | null`（`IUserHasId`単独ではない）。
  - File Structure Planの`CommentCard.module.scss`の記載は誤り（決定2の「CSSモジュールを持たない」と矛盾）。実装（CSSモジュール無し）が正しい。
  - この訂正はtask 4.2の実装（レビュー1回目でAPPROVEDだが、コミット前に本矛盾が見つかった）に反映し、`CommentCardProps.creator`は`IUserHasId | Ref<IUser> | null | undefined`とした（`undefined`も受ける。通常コメントの`isPopulated`結果は`undefined`であり`null`ではないため）。task 4.2はこの訂正を含めて1コミットとしてまとめてコミットした。task 4.3・5.2 はこの訂正後の契約に従うこと。

- 2.2: `InlineCommentForm.tsx` の引用要素は design.md のJSX断片どおりCSSモジュールのクラスのみにはせず、素の `inline-comment-form-quote` クラスも残した（`playwright/20-basic-features/inline-comment.spec.ts:124,693` がこのクラス名でロケートしているため。CSSモジュールのクラス名はビルド時ハッシュ化されるので、断片どおりにすると既存のe2eが壊れる。対応するCSS規則は無いので実質テスト用の目印のみ）。
- 2.2 レビュー時の申し送り: 決定5（エディタのツールバー・行番号余白の非表示）の見た目をブラウザで確認する予定がタスク7.x のどこにも無い。7.1 のE2Eアサーションに含めるか、フィーチャ全体のGO判定前に一度ブラウザで確認すること。
- 2.2 レビュー時の申し送り（別issue、スペック外・対応不要）: `MentionPickerButton.tsx` の "No candidates" と `InlineCommentForm.tsx` のエラーメッセージが英語直書きのまま（Requirement 11.6は未達だが、このタスクの指示にも新規キー一覧にも無く、本amendの対象外）。

- 6.3のREJECTED所見の修正: 6.3で`InlineCommentList.tsx`本体を削除したところ、そのコンポーネントが出していた`data-testid="inline-comment-list"`（クライアント専用バンドルが実際にマウントし終えたことを示す唯一のDOM上の目印で、`playwright/20-basic-features/inline-comment.spec.ts`が6箇所でこれを待ってから`page.evaluate`ベースの選択操作ヘルパー — 組み込みのリトライを持たない — を呼んでいた）も一緒に失われ、6箇所すべてが「そのtestId自体が存在しない」で失敗する状態になっていた。対応として、待ち受け先を`InlineCommentList`ではなく`SelectionCapture`（実際にe2eが待ちたかった対象そのもの）に付け替えた：`SelectionCapture.tsx`のidleステージ（何も選択されておらず、フォームも開いていない状態）が`null`ではなく`<span data-testid="inline-comment-ready" hidden />`という、レイアウトにもアクセシビリティツリーにも影響しない常時マウントの目印を返すようにした（`selecting`/`composing`側の分岐はそのまま・追加のみ）。`inline-comment.spec.ts`側は6箇所とも`getByTestId('inline-comment-list')`→`getByTestId('inline-comment-ready')`に置き換え、説明コメントも「`InlineCommentList`が別途マウントする」という記述から「`SelectionCapture`自身がidleで目印を出す」という記述に更新した。7.3（e2eの回帰確認）はこの`inline-comment-ready`が現行の待ち受け先であることを前提にすること。

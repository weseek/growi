# Requirements Document

## Project Description (Input)

インラインコメント機能の作成・解決トグル3ルート（`create.ts`／`create-reply.ts`／`resolve.ts`）に、読み取り専用利用者の制限（`excludeReadOnlyUserIfCommentNotAllowed`）をサーバー側で追加する。既存の編集・削除4ルートにはすでにこの制限があるが、作成・解決トグルの3ルートには無く、クライアント側の表示制御にしか読み取り専用制限が存在しない。この欠落はinline-comment機能自体が最初から持っていた既存の欠落であり、inline-comment-edit-delete amend specの研究メモ（research.md 341-345行）が「別途起票」としていたが、そのamend specがinline-comment本体に折り込まれ削除されたため、記録先が本スペック自身を指す循環参照になってしまっている。本specはinline-commentの既存仕様（apiv3 inline-comments routes群の認可モデル）を変更するamend specであり、対象はinline-comment。

詳細な背景・調査結果は [brief.md](./brief.md) を参照。

## Amend target

対象スペック: [inline-comment](../inline-comment/)

変更する契約: `apps/app/src/features/inline-comment/server/routes/create.ts`／`create-reply.ts`／`resolve.ts`の認可モデル（ミドルウェアチェーン）と、対応するクライアント側UI（`SelectionCapture`、`InlineCommentItem`／`InlineCommentReplies`／`InlineCommentPopoverEntry`の解決トグル・返信作成操作）。

## Introduction

インラインコメント機能の作成・返信作成・解決トグルの3つのAPIエンドポイントは、読み取り専用利用者にコメント投稿を許可しない設定であっても、その制限をサーバー側で判定していない。画面上はボタンが出ないだけで、APIを直接呼べば読み取り専用利用者でも操作できてしまう。既存の編集・削除4ルートは同じ制限をすでにサーバー側で判定しており、この3ルートだけが非対称に取り残されている。本specはこの非対称を解消し、既存の`excludeReadOnlyUserIfCommentNotAllowed`ミドルウェア・`NotAvailableIfReadOnlyUserNotAllowedToComment`コンポーネントをそのまま再利用して、サーバー側・クライアント側の両方でこの3操作にも同じ制限をかける。

## Boundary Context (Optional)

- **In scope**: `create.ts`／`create-reply.ts`／`resolve.ts`へのサーバー側読み取り専用制限の追加。対応するクライアント側UIガード（作成トリガー・返信作成操作・解決トグル操作の非表示）の追加
- **Out of scope**: 読み取り専用制限そのものの設定・判定基準の変更（既存の設定値・既存ミドルウェアの判定ロジックはそのまま利用する）。編集・削除4ルートの認可ロジックの変更。通常コメント機能（`apps/app/src/server/routes/comment.js`）への変更
- **Adjacent expectations**: 既存の`excludeReadOnlyUserIfCommentNotAllowed`ミドルウェア（apiv1の`/comments.add`・`/comments.update`・`/comments.remove`がすでに使っている）と、既存の`NotAvailableIfReadOnlyUserNotAllowedToComment`コンポーネント（インラインコメントの編集・削除操作がすでに使っている）を、新規実装せずそのまま再利用する

## Requirements

### Requirement 1: 作成・解決トグルの読み取り専用利用者制限（サーバー側）

**Objective:** As a サイト管理者, I want 読み取り専用利用者がインラインコメントの作成・返信作成・解決トグルをAPI経由で行えないようにしたい, so that 画面上の操作を回避した直接のAPI呼び出しに対しても同じ制限が守られる

#### Acceptance Criteria
1. While 読み取り専用利用者にコメント投稿が許可されていない設定である, when 読み取り専用利用者がインラインコメント作成操作を行った, the インラインコメント機能 shall そのリクエストを拒否する
2. While 読み取り専用利用者にコメント投稿が許可されていない設定である, when 読み取り専用利用者がインラインコメントへの返信作成操作を行った, the インラインコメント機能 shall そのリクエストを拒否する
3. While 読み取り専用利用者にコメント投稿が許可されていない設定である, when 読み取り専用利用者がインラインコメントの解決/未解決切り替え操作を行った, the インラインコメント機能 shall そのリクエストを拒否する
4. The インラインコメント機能 shall 上記1〜3の拒否判定を、既存の編集・削除操作で使われている判定基準（読み取り専用利用者にコメント投稿が許可されているかどうかの設定）と同じ基準で行う
5. If 読み取り専用利用者にコメント投稿が許可されている設定である, then インラインコメント機能 shall 読み取り専用利用者であることを理由に作成・返信作成・解決トグルの各操作を拒否しない

### Requirement 2: クライアント側の操作導線の非表示

**Objective:** As a 読み取り専用利用者, I want 自分に許可されていない操作のボタンや入力欄が最初から表示されないでほしい, so that 実行できない操作を試みてサーバーからの拒否で初めて気づく、という体験を避けられる

#### Acceptance Criteria
1. While 読み取り専用利用者にコメント投稿が許可されていない設定である, the インラインコメント機能 shall 当該利用者に対して、本文中のテキスト選択からのインラインコメント作成操作を提供しない
2. While 読み取り専用利用者にコメント投稿が許可されていない設定である, the インラインコメント機能 shall 当該利用者に対して、画面最下部の一覧および本文中のその場での内容確認手段のいずれからも、インラインコメントへの返信作成操作を提供しない
3. While 読み取り専用利用者にコメント投稿が許可されていない設定である, the インラインコメント機能 shall 当該利用者に対して、画面最下部の一覧および本文中のその場での内容確認手段のいずれからも、解決/未解決の切り替え操作を提供しない
4. If 読み取り専用利用者にコメント投稿が許可されている設定である, then インラインコメント機能 shall 通常のログイン済み利用者と同じ操作導線を提供する

### Requirement 3: 既存の挙動への非干渉

**Objective:** As a 開発者, I want この制限追加が既存の認可・機能に影響しないことを保証したい, so that 回帰を持ち込まずにこの欠落を埋められる

#### Acceptance Criteria
1. The インラインコメント機能 shall 通常コメント（インラインコメントでない既存コメント）の投稿・編集・削除・通知の挙動を変更しない
2. The インラインコメント機能 shall インラインコメントの編集・削除における既存の認可判定（投稿者本人チェック、ページ権限の一様な404化）を変更しない
3. When 読み取り専用利用者にコメント投稿が許可されている設定である利用者がインラインコメントの作成・返信作成・解決トグルを行った, the インラインコメント機能 shall 本specの変更前と同じ成功レスポンスを返す

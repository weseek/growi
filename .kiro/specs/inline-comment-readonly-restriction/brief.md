# Brief: inline-comment-readonly-restriction

## Amend target

対象スペック: [inline-comment](../inline-comment/)

変更する契約: `apps/app/src/features/inline-comment/server/routes/` 配下の`create.ts`／`create-reply.ts`／`resolve.ts`の3ルートの認可モデル（ミドルウェアチェーン）。既存の`update.ts`／`update-reply.ts`／`delete.ts`／`delete-reply.ts`（編集・削除の4ルート）はすでに`excludeReadOnlyUserIfCommentNotAllowed`をサーバー側で通しているのに対し、この3ルートには同じ制限が無い、という非対称を解消する。

`inline-comment`のdesign.md（Server節、`API Contract`直後の段落）とresearch.md（341〜345行「読み取り専用利用者の制限は編集・削除の4ルートにのみサーバー側で適用し、作成・解決トグルの既存3ルートには適用しない理由」）に、この欠落が意図的な見送りとして明記されている。

## Problem

読み取り専用利用者（`user.readOnly === true`）に対してコメント投稿を許可しない設定（`excludeReadOnlyUserIfCommentNotAllowed`が参照する設定値）が有効なとき、インラインコメントの**作成・解決トグル**の3ルート（`POST /_api/v3/inline-comments`／`POST /_api/v3/inline-comments/:id/replies`／`PUT /_api/v3/inline-comments/:id/resolve`）はこの制限をサーバー側で判定していない。画面上はボタンが出ないだけで、APIを直接呼べば読み取り専用利用者でも作成・返信・解決トグルの操作ができてしまう。

**この欠落自体は今回新しく生まれたものではない**——`inline-comment`機能が最初にこの3ルートを実装した時点から存在していた。今回のamendが必要になったのは、この欠落を記録していた研究メモの記録先が壊れたためである：

- 元々の記録は`inline-comment-edit-delete`という別のamend spec（編集・削除機能を追加するためのスペック）が、自分自身のスコープ外として「`inline-comment`機能自体の課題として別途起票・対応する」と書き残していた
- その後`inline-comment-edit-delete`は正常に手続き通り`inline-comment`本体へ折り込まれ、削除された（`.claude/rules/spec-lifecycle.md`の手順どおり）
- 結果として「別途起票・対応する」の指し先が、まさに折り込まれた先である`inline-comment`自身になってしまい、循環参照になった。追跡すべき課題が宙に浮いている

## Current State

- `apps/app/src/features/inline-comment/server/routes/create.ts`／`create-reply.ts`／`resolve.ts`: `accessTokenParser` → `loginRequired` → express-validator → `apiV3FormValidator`のみ。`excludeReadOnlyUserIfCommentNotAllowed`を通さない
- `apps/app/src/features/inline-comment/server/routes/update.ts`／`update-reply.ts`／`delete.ts`／`delete-reply.ts`: `loginRequired`の直後、express-validatorより前に`excludeReadOnlyUserIfCommentNotAllowed`を通す（apiv1の`/comments.update`／`/comments.remove`と同じ配置）
- クライアント側では`NotAvailableIfReadOnlyUserNotAllowedToComment`が一覧・ポップオーバーの編集・削除操作のガードに使われているが、作成トリガー（`SelectionCapture`）・解決トグルには同等のクライアント側ガードがあるかどうかも本amendで確認が必要（設計時点では「クライアント側の表示制御にしか読み取り専用制限が存在しない」とだけ書かれており、作成・解決トグルの各UIコンポーネントが実際にこのガードを持つか個別には検証されていない）
- 同じ非対称は、実は`inline-comment`より前から存在する既存の通常コメント機能側には無い——`apps/app/src/server/routes/comment.js`の`api.add`（apiv1）は`excludeReadOnlyUserIfCommentNotAllowed`を通している。つまり通常コメントは作成時から読み取り専用制限を持っており、インラインコメントだけがこの制限を作成・解決トグルで欠いている

## Desired Outcome

- インラインコメントの作成・返信作成・解決トグルの3ルートが、通常コメントの`/comments.add`と同じ基準で、読み取り専用利用者からのリクエストをサーバー側で拒否する
- 対応するクライアント側のUIガード（ボタンの非表示など）が無ければ、編集・削除と同じパターン（`NotAvailableIfReadOnlyUserNotAllowedToComment`）で追加する
- この変更が既存の通常コメント機能・インラインコメントの編集削除機能の挙動に影響しないことを結合テストで確認する

## Scope（暫定・要件フェーズで確定）

- **In**: `create.ts`／`create-reply.ts`／`resolve.ts`への`excludeReadOnlyUserIfCommentNotAllowed`追加、対応するクライアント側ガードの点検・追加、design.md/research.mdの記述更新
- **Out**: 読み取り専用利用者の制限そのものの仕様（対象・判定基準）変更、通常コメント機能への変更、編集・削除4ルートの認可ロジック変更

## Boundary Candidates

- サーバー側ミドルウェアチェーンへの1行追加（3ルート）——影響範囲が最も狭く、既存パターンの横展開に近い
- クライアント側の作成トリガー・解決トグルUIのガード点検——現状のガードの有無を先に確認する必要がある

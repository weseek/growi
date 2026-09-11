# Design Document

## Overview

**Purpose**: `inline-comment`の作成・返信作成・解決トグルの3つのapiv3ルート（`create.ts`／`create-reply.ts`／`resolve.ts`）とそれぞれに対応するクライアント側の操作起点に、既存の編集・削除4ルートがすでに持っている読み取り専用利用者の制限を横展開する。

**Users**: 読み取り専用利用者にコメント投稿を許可しない設定を行っているサイト管理者、およびその設定下にある読み取り専用利用者。

**Impact**: `apps/app/src/features/inline-comment/`配下の既存3ルートのミドルウェアチェーンと、対応するクライアント側4箇所のUIに、それぞれ1行〜数行の変更を加える。新規のミドルウェア・コンポーネントは作らず、既存の`excludeReadOnlyUserIfCommentNotAllowed`（apiv1の`/comments.add`が使用）と`NotAvailableIfReadOnlyUserNotAllowedToComment`（インラインコメントの編集・削除がすでに使用）をそのまま再利用する。データモデル・APIのレスポンス形状・既存の認可判定（投稿者本人チェック、ページ権限の一様な404化）はいずれも変更しない。

### Goals
- 作成・返信作成・解決トグルの3操作について、読み取り専用利用者にコメント投稿が許可されていない場合、サーバー側で拒否する
- 同じ3操作について、クライアント側の操作起点（テキスト選択トリガー、返信作成の起点、解決トグルボタン）を、読み取り専用利用者にコメント投稿が許可されていない場合は無効化する
- 既存の編集・削除4ルート、および通常コメント機能の挙動を一切変更しない

### Non-Goals
- 読み取り専用利用者の制限そのものの設定値・判定基準を変更すること
- 編集・削除4ルートの認可ロジック（投稿者本人チェック、404統一）を変更すること
- 新しいミドルウェアやUIコンポーネントを設計すること（既存のものを再利用するのみ）

## Boundary Commitments

### This Spec Owns
- `create.ts`／`create-reply.ts`／`resolve.ts`の3ルートのミドルウェアチェーンへの`excludeReadOnlyUserIfCommentNotAllowed`の追加
- `SelectionCapture.tsx`（作成トリガー）／`InlineCommentReplies.tsx`（一覧側の返信作成起点）／`InlineCommentPreviewPopover.tsx`（ポップオーバー側の返信作成起点・解決トグル）／`InlineCommentItem.tsx`（一覧側の解決トグル）への`NotAvailableIfReadOnlyUserNotAllowedToComment`の追加

### Out of Boundary
- `update.ts`／`update-reply.ts`／`delete.ts`／`delete-reply.ts`（編集・削除4ルート）の認可ロジック——すでに同じ制限を持っており、本specは変更しない
- 通常コメント機能（`apps/app/src/server/routes/comment.js`）——`/comments.add`はすでに同じ制限を持っている
- `excludeReadOnlyUserIfCommentNotAllowed`／`NotAvailableIfReadOnlyUserNotAllowedToComment`自体の実装・判定基準の変更
- インラインコメントの編集・削除操作のUI（すでに`NotAvailableIfReadOnlyUserNotAllowedToComment`でガード済み。本specは変更しない）

### Allowed Dependencies
- `excludeReadOnlyUserIfCommentNotAllowed`（`apps/app/src/server/middlewares/exclude-read-only-user.ts`、既存）— サーバー側ミドルウェアとしてそのまま追加する
- `NotAvailableIfReadOnlyUserNotAllowedToComment`（`apps/app/src/client/components/NotAvailableForReadOnlyUser.tsx`、既存）— クライアント側ガードとしてそのまま追加する。無効化時は要素を非表示にするのではなく、既存の挙動どおり`Disable`でグレーアウトしつつツールチップで理由を示す（編集・削除操作がすでにこの挙動をしており、本specもそれに揃える）

### Revalidation Triggers
- `excludeReadOnlyUserIfCommentNotAllowed`の判定基準（読み取り専用利用者にコメント投稿を許可する設定値の意味）が変わる場合
- `create.ts`／`create-reply.ts`／`resolve.ts`のミドルウェアチェーンの並び順が変わる場合（`loginRequired`の直後・express-validatorより前、という位置を維持する必要がある）
- `SelectionCapture.tsx`／`InlineCommentReplies.tsx`／`InlineCommentPreviewPopover.tsx`／`InlineCommentItem.tsx`の操作起点のマークアップ構造が変わる場合、本specが追加したガードの位置（どの要素を包むか）を再確認する必要がある

## Architecture

### Existing Architecture Analysis

編集・削除4ルートがすでに確立しているパターンをそのまま複製する。`update.ts`は次の順でミドルウェアを並べている：

```
accessTokenParser(...),
loginRequired,
excludeReadOnlyUserIfCommentNotAllowed,   // ← 本specが3ルートに追加するのはここ
...validator,
apiV3FormValidator,
handler,
```

クライアント側も同様に、`InlineCommentPopoverEntry.tsx`の編集・削除ボタンがすでに`NotAvailableIfReadOnlyUserNotAllowedToComment`で包まれているパターンを複製する：

```tsx
<NotAvailableIfReadOnlyUserNotAllowedToComment>
  <button onClick={...}>...</button>
</NotAvailableIfReadOnlyUserNotAllowedToComment>
```

新規アーキテクチャパターンの導入は無く、3+コンポーネントが絡む相互作用も無いため、アーキテクチャ図・シーケンス図は省略する（design-principlesの「Skip: Minor one-component changes」に該当）。

## File Structure Plan

### Modified Files

**サーバー側（3ファイル、いずれも`apps/app/src/features/inline-comment/server/routes/`配下）**
- `create.ts` — `loginRequired`の直後・`...validator`より前に`excludeReadOnlyUserIfCommentNotAllowed`を追加。importを1行追加
- `create-reply.ts` — 同上
- `resolve.ts` — 同上

**クライアント側（4ファイル、いずれも`apps/app/src/features/inline-comment/client/components/`配下）**
- `SelectionCapture/SelectionCapture.tsx` — `stage === 'selecting'`時に描画する`SelectionActionButton`を`NotAvailableIfReadOnlyUserNotAllowedToComment`で包む（`composing`段階の`InlineCommentForm`には到達できなくなるため、そちらへのガード追加は不要）
- `InlineCommentItem/InlineCommentReplies.tsx` — 「Reply...」トグルボタン（`data-testid="inline-comment-reply-toggle-button"`）を`NotAvailableIfReadOnlyUserNotAllowedToComment`で包む
- `InlineCommentBodyInteraction/InlineCommentPreviewPopover.tsx` — 2箇所を包む：(1) 解決トグルボタン（`headerExtra`として`InlineCommentPopoverEntry`に渡している部分）、(2) 返信入力フォーム全体（`inline-comment-preview-popover-reply-form`のdiv）
- `InlineCommentItem/InlineCommentItem.tsx` — 解決トグルボタン（`handleResolveToggle`を呼ぶ`<button>`）を`NotAvailableIfReadOnlyUserNotAllowedToComment`で包む

**テストファイル（新規追加・既存修正）**
- `create.integ.ts`／`create-reply.integ.ts`／`resolve.integ.ts` — 読み取り専用利用者にコメント投稿が許可されていない設定で400を返す結合テストを追加（`update.integ.ts`の既存テストと同じ形）
- `SelectionCapture.spec.tsx`／`InlineCommentReplies.spec.tsx`／`InlineCommentPreviewPopover.spec.tsx`／`InlineCommentItem.spec.tsx` — 読み取り専用利用者にコメント投稿が許可されていない場合に対象の操作起点が無効化されることを確認する単体テストを追加

## Requirements Traceability

| Requirement | Summary | Components | Interfaces | Flows |
|---|---|---|---|---|
| 1.1 | 作成操作をサーバー側で拒否 | `create.ts` | `excludeReadOnlyUserIfCommentNotAllowed` | — |
| 1.2 | 返信作成操作をサーバー側で拒否 | `create-reply.ts` | `excludeReadOnlyUserIfCommentNotAllowed` | — |
| 1.3 | 解決トグル操作をサーバー側で拒否 | `resolve.ts` | `excludeReadOnlyUserIfCommentNotAllowed` | — |
| 1.4 | 編集・削除と同じ判定基準 | `create.ts`, `create-reply.ts`, `resolve.ts` | `excludeReadOnlyUserIfCommentNotAllowed`（既存、編集・削除と共有） | — |
| 1.5 | 許可設定時は拒否しない | `create.ts`, `create-reply.ts`, `resolve.ts` | 同上 | — |
| 2.1 | 作成トリガーの非表示 | `SelectionCapture.tsx` | `NotAvailableIfReadOnlyUserNotAllowedToComment` | — |
| 2.2 | 返信作成操作の非表示（一覧・ポップオーバー） | `InlineCommentReplies.tsx`, `InlineCommentPreviewPopover.tsx` | `NotAvailableIfReadOnlyUserNotAllowedToComment` | — |
| 2.3 | 解決トグル操作の非表示（一覧・ポップオーバー） | `InlineCommentItem.tsx`, `InlineCommentPreviewPopover.tsx` | `NotAvailableIfReadOnlyUserNotAllowedToComment` | — |
| 2.4 | 許可設定時は通常の操作導線 | 上記4コンポーネント | 同上（`isDisabled`が`false`になる） | — |
| 3.1 | 通常コメントへの非干渉 | — | — | 変更ファイルが通常コメント機能（`comment.js`）と重ならないことで担保 |
| 3.2 | 編集・削除の既存認可への非干渉 | — | — | `update.ts`等を変更しないことで担保 |
| 3.3 | 許可設定時の成功レスポンス不変 | `create.ts`, `create-reply.ts`, `resolve.ts` | 既存のレスポンス形状を維持 | 回帰テストで確認 |

## Components and Interfaces

新規コンポーネントは無く、既存7ファイルへの局所的な変更のみのため、フルブロックではなく要約表とする。

| Component | Domain/Layer | Intent | Req Coverage | Key Dependencies | Contracts |
|---|---|---|---|---|---|
| `create.ts` | Server / Route | 作成操作に読み取り専用制限を追加 | 1.1, 1.4, 1.5 | `excludeReadOnlyUserIfCommentNotAllowed`(P0) | API |
| `create-reply.ts` | Server / Route | 返信作成操作に読み取り専用制限を追加 | 1.2, 1.4, 1.5 | `excludeReadOnlyUserIfCommentNotAllowed`(P0) | API |
| `resolve.ts` | Server / Route | 解決トグル操作に読み取り専用制限を追加 | 1.3, 1.4, 1.5 | `excludeReadOnlyUserIfCommentNotAllowed`(P0) | API |
| `SelectionCapture.tsx` | Client / UI | 作成トリガーを無効化 | 2.1, 2.4 | `NotAvailableIfReadOnlyUserNotAllowedToComment`(P0) | — |
| `InlineCommentReplies.tsx` | Client / UI | 一覧側の返信作成起点を無効化 | 2.2, 2.4 | `NotAvailableIfReadOnlyUserNotAllowedToComment`(P0) | — |
| `InlineCommentPreviewPopover.tsx` | Client / UI | ポップオーバー側の返信作成起点・解決トグルを無効化 | 2.2, 2.3, 2.4 | `NotAvailableIfReadOnlyUserNotAllowedToComment`(P0) | — |
| `InlineCommentItem.tsx` | Client / UI | 一覧側の解決トグルを無効化 | 2.3, 2.4 | `NotAvailableIfReadOnlyUserNotAllowedToComment`(P0) | — |

##### API Contract（変更差分のみ）

| Method | Endpoint | 追加されるエラー |
|---|---|---|
| POST | `/_api/v3/inline-comments` | 400（読み取り専用利用者にコメントが許可されていない） |
| POST | `/_api/v3/inline-comments/:id/replies` | 400（同上） |
| PUT | `/_api/v3/inline-comments/:id/resolve` | 400（同上） |

既存のレスポンス形状・他のエラー（404/403/500）は変更しない。ステータスコード400は編集・削除4ルートの既存の挙動（`excludeReadOnlyUserIfCommentNotAllowed`が返す`validation_failed`エラー）と揃える。

**Implementation Notes**
- Integration: 3ルートとも`update.ts`の並び順（`loginRequired`→`excludeReadOnlyUserIfCommentNotAllowed`→validator→`apiV3FormValidator`）をそのまま複製する
- Validation: 各ルートに、読み取り専用利用者へのアクセスを結合テストで確認する（許可設定・非許可設定の両方）
- Risks: 低リスク——既存ミドルウェア・既存コンポーネントの追加のみで、新規ロジックを書かない

## Testing Strategy

- **Integration Tests**:
  - `create.integ.ts` / `create-reply.integ.ts` / `resolve.integ.ts`: 読み取り専用利用者にコメント投稿が許可されていない設定でリクエストすると400が返ること（1.1〜1.3）。許可されている設定では従来どおり成功すること（1.5, 3.3）
  - 既存の`update.integ.ts`等（編集・削除4ルート）が変更なしに緑のままであること（3.2の回帰確認）
- **Unit/Component Tests**:
  - `SelectionCapture.spec.tsx`: 読み取り専用利用者にコメント投稿が許可されていない場合、選択後のトリガーボタンが無効化されること。許可されている場合は通常どおり動作すること（2.1, 2.4）
  - `InlineCommentReplies.spec.tsx`: 「Reply...」ボタンが同条件で無効化されること（2.2, 2.4）
  - `InlineCommentPreviewPopover.spec.tsx`: 解決トグルボタン・返信入力欄がそれぞれ同条件で無効化されること（2.2, 2.3, 2.4）
  - `InlineCommentItem.spec.tsx`: 解決トグルボタンが同条件で無効化されること（2.3, 2.4）

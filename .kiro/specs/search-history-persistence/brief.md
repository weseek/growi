# Brief: search-history-persistence

チケット: #191670 / アンブレラ: [search-history](../search-history/roadmap.md)

## Problem
GROWI のユーザーは同じキーワードで繰り返し検索することが多いが、実行した検索はどこにも残らず、毎回入力し直す必要がある。後続の再検索（#191671）・削除（#191672）を実現するには、まずユーザーごとに検索キーワードを保存する仕組みが要る。

## Current State
- 検索の入力は検索モーダル（`apps/app/src/features/search/client/components/SearchModal.tsx`、Downshift）に集約されている。ヘッダー・サイドバー・モバイルのボトムナビ・ホットキー・`/_search` ページの疑似入力（`SearchModalTriggerinput`）はいずれもモーダルを開くだけ。
- 検索が実行される経路は 2 つある。
  - Enter による送信: `SearchForm` → `SearchModal` の `searchHandler`。`onSearchOverride` があればそれを呼ぶ（`/_search` ページから開いた場合）。無ければ、管理設定 `isSearchScopeChildrenAsDefault` が有効なら `prefix:<現在のページ> ` を前置して `useSetSearchKeyword()`（`states/search/keyword-manager.ts`）で `/_search?q=` へ遷移する。
  - `SearchMethodMenuItem` の選択: `router.push('/_search?q=...')` で直接遷移し、`searchHandler` を経由しない。
- `useSetSearchKeyword` は `/_search` 上のフィルタ・ソート操作でも `replace: true` で呼ばれるため、ここに記録を仕込むと実行以外の操作でも履歴が増える。
- 検索履歴を保存する仕組み（コレクション・localStorage・ユーザー設定）は存在しない。`features/search/` には `client/` と `utils/` しか無く、`server/` はまだ無い。
- ユーザーごとのデータの前例として `user-ui-settings`（1 ユーザー 1 ドキュメントのスカラー設定）、`bookmark` / `in-app-notification`（ユーザーごとの複数ドキュメント）がある。

## Desired Outcome
- ログインユーザーが検索を実行すると、入力したキーワードがそのユーザーの検索履歴として保存される。
- 保存されるのはユーザーが入力した文字列で、自動付与される `prefix:<現在のページ>` は含まない。ユーザー自身が入力した演算子トークンはそのまま残る。
- 空・空白のみのキーワードは保存されない（`SearchForm` が既に送信しない挙動と揃える）。
- フィルタ・ソート操作やページ送りでは履歴が増えない。
- ユーザー本人の履歴を新しい順に取得できる API があり、後続の recall が使える。
- ゲストユーザーの検索では何も保存されず、エラーにもならない。

## Approach
サーバ保存＋クライアントからの明示記録（アンブレラ roadmap の Approach Decision を参照）。
- `features/search/server/` を新設し、ユーザーごとの検索履歴モデル（ユーザー・キーワード・最終検索日時）を置く。
- apiv3 に記録（POST）と一覧取得（GET）のエンドポイントを追加する。どちらもログイン必須で、本人の履歴のみを扱う。
  - 一覧取得 API を recall ではなく persistence が持つのは、保存側が履歴のデータの形（モデル・型・重複/上限・並び順）とそれを読み書きする API をまとめて持ち、recall と delete はその上に画面と操作を足す、という分割にしているため（アンブレラ roadmap の [Boundary Strategy](../search-history/roadmap.md#boundary-strategy) を参照）。
- クライアントは「検索を実行した」時点で記録 API を呼ぶ。記録の失敗は検索そのものを妨げない（遷移を待たせず、エラーはログに留める）。

## Scope
- **In**:
  - 検索履歴のモデルとインデックス（ユーザー単位の取得・重複判定に必要なもの）
  - 記録ロジック: トリム、空キーワードの除外、同一キーワードの重複時の扱い、保持件数の上限
  - apiv3 の記録エンドポイント・一覧取得エンドポイントと、そのバリデーション・認可
  - クライアント側の記録点の配線（Enter 送信〈`onSearchOverride` 経路を含む〉、`SearchMethodMenuItem` の選択）と、recall から呼べる記録関数の提供
  - 共有インターフェース（履歴 1 件の型）
- **Out**:
  - 履歴の表示・選択 UI（search-history-recall）
  - 履歴の削除（search-history-delete）
  - 検索 API（`GET /_api/search`）の変更
  - 検索演算子の解釈・変更

## Boundary Candidates
- 履歴のデータ契約（モデル・型・重複/上限ルール）
- サーバ API（記録・一覧取得、認可）
- クライアントの記録点（「実行」とみなす箇所の特定と配線）

## Out of Boundary
- 履歴の表示形式・件数・並びの UI 上の見せ方
- 削除 API と削除 UI
- `search-filters` が持つ演算子のパース・Elasticsearch クエリ
- `/_search` のフィルタパネル・チップ・ソート操作の挙動

## Upstream / Downstream
- **Upstream**: 検索モーダル（`SearchModal` / `SearchForm` / `SearchMethodMenuItem`）、`states/search/keyword-manager.ts`、apiv3 ルーティングと `loginRequired` / `accessTokenParser`、Mongoose（インデックス作成）
- **Downstream**: search-history-recall（一覧取得 API・記録関数を使う）、search-history-delete（データ契約・ID を使う）

## Existing Spec Touchpoints
- **Extends**: なし
- **Adjacent**: `search-filters`（同じ検索ボックスを使うが別機能。演算子トークンは文字列として保存するだけで解釈しない）

## Constraints
- 新規コレクションのインデックスは Mongoose スキーマで作成する（`.claude/rules/model.md`）。データアクセスを Mongoose と Prisma のどちらで書くかは設計で決める。Prisma を使う場合は `schema.prisma` への宣言も要る。
- 新規コレクションを、エクスポート／インポートや GROWI 間移行（g2g）の対象にするかを決める（既存の扱いは `apps/app/src/server/service/import/non-transferable-collections.ts`）。
- ユーザー削除時に、そのユーザーの履歴を消すかを決める。
- 要件フェーズで決める未決事項: 保持件数の上限値、同一キーワード再実行時の扱い（最新へ繰り上げる想定）、大文字小文字・前後空白の同一視、キーワード長の上限。
- `SearchMethodMenuItem` には「全体を検索」「子ページを検索（`prefix:` を付与）」「完全一致（`"..."` で囲む）」の 3 種がある。どれを選んでも入力文字列そのものを保存する想定だが、完全一致の引用符を履歴に残すかは要件フェーズで確認する。

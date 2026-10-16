# Brief: search-history

チケット: #191670（保存）/ #191671（再検索）/ #191672（削除）

## Problem
GROWI のユーザーは同じキーワードで繰り返し検索することが多いが、実行した検索はどこにも残らず、毎回入力し直す必要がある。また、履歴を残すなら、打ち間違えたキーワードや人に見られたくないキーワードをユーザー自身が消せないと、履歴一覧が使いにくくなるうえ、プライバシーの面でも不安が残る。

## Current State
- 検索の入力は検索モーダル（`apps/app/src/features/search/client/components/SearchModal.tsx`、Downshift）に集約されている。ヘッダー・サイドバー・モバイルのボトムナビ・ホットキー・`/_search` ページの疑似入力（`SearchModalTriggerinput`）はいずれもモーダルを開くだけ。
- 検索が実行される経路は 2 つある。
  - Enter による送信: `SearchForm` → `SearchModal` の `searchHandler`。`onSearchOverride` があればそれを呼ぶ（`/_search` ページから開いた場合）。無ければ、管理設定 `isSearchScopeChildrenAsDefault` が有効なら `prefix:<現在のページ> ` を前置して `useSetSearchKeyword()`（`states/search/keyword-manager.ts`）で `/_search?q=` へ遷移する。
  - `SearchMethodMenuItem` の選択: `router.push('/_search?q=...')` で直接遷移し、`searchHandler` を経由しない。
- `useSetSearchKeyword` は `/_search` 上のフィルタ・ソート操作でも `replace: true` で呼ばれるため、ここに記録を仕込むと実行以外の操作でも履歴が増える。
- モーダルのメニューは、入力欄（`SearchForm`）の下に `SearchMethodMenuItem` と `SearchResultMenuItem` を並べ、その下に `SearchHelp` を常に表示している。入力が空のときは固定の「検索方法」項目が 1 つ出るだけで、`SearchResultMenuItem` は何も出さない。
- Downshift の項目型は `DownshiftItem = { url: string }`（`features/search/client/interfaces/downshift.ts`）で、選択すると `router.push(item.url)` する。URL 遷移以外の項目は存在しない。
- 検索履歴を保存する仕組み（コレクション・localStorage・ユーザー設定）は存在しない。`features/search/` には `client/` と `utils/` しか無く、`server/` はまだ無い。
- ユーザーごとのデータの前例として `user-ui-settings`（1 ユーザー 1 ドキュメントのスカラー設定）、`bookmark` / `in-app-notification`（ユーザーごとの複数ドキュメント）がある。

## Desired Outcome
**保存（#191670）**
- ログインユーザーが検索を実行すると、入力したキーワードがそのユーザーの検索履歴として保存される。
- 保存されるのはユーザーが入力した文字列で、自動付与される `prefix:<現在のページ>` は含まない。ユーザー自身が入力した演算子トークンはそのまま残る。
- 空・空白のみのキーワードは保存されない（`SearchForm` が既に送信しない挙動と揃える）。
- フィルタ・ソート操作やページ送りでは履歴が増えない。
- ゲストユーザーの検索では何も保存されず、エラーにもならない。

**再検索（#191671）**
- ログインユーザーが検索モーダルを開き、入力が空の状態のとき、自分の過去の検索履歴が新しい順にドロップダウンに表示される。
- 履歴項目はマウスでもキーボード（上下キー・Enter）でも選べる。既存項目と同じ Downshift の操作感に揃える。
- 履歴項目を選ぶと、そのキーワードで検索が実行される。Enter 送信と同じ経路を通るので、その時点の「子ページのみ検索」設定に応じた `prefix:` の付与や、`/_search` 上での `onSearchOverride` がそのまま効く。
- 再検索も「検索の実行」として記録され、その履歴は最新に繰り上がる。
- 履歴が 0 件のとき、またはゲストユーザーのときは、履歴セクションを出さず、現状と同じ表示になる。

**削除（#191672）**
- ログインユーザーは、検索モーダルの履歴一覧で、各項目の削除操作から不要な履歴を 1 件ずつ削除できる。
- 削除すると、その項目は一覧からすぐ消え、以後の取得結果にも含まれない。
- 削除操作をしても、その項目の再検索は実行されない（クリックやキー操作が項目選択と衝突しない）。モーダルは開いたままで、続けて操作できる。
- 本人以外の履歴は削除できない。存在しない ID や他ユーザーの ID を指定した削除は拒否され、他ユーザーの履歴は変わらない。

## Approach
**サーバ保存＋クライアントからの明示記録。** ユーザーごとの MongoDB コレクションを `features/search/server/` に新設し、apiv3 で記録・一覧・削除の API を提供する。記録はクライアントが「ユーザーが検索を実行した」時点（Enter による送信、検索方法メニュー項目の選択、履歴からの再検索）で POST する。

- **Why**: 履歴が端末をまたいでユーザーに付いてくる。記録点を「実行」に限るため、`/_search` 上のフィルタ・ソート操作（`useSetSearchKeyword(..., { replace: true })` による `?q=` 書き換え）やページ送りで履歴が膨らまない。検索 API に副作用を持ち込まずに済む。
- **Rejected alternatives**:
  - サーバ保存＋検索 API（`GET /_api/search`）側で自動記録 — 記録漏れは無いが、フィルタ・ソート・ページ送りの再リクエストを「実行」と区別する判定が必要になり、参照系 API に書き込みの副作用が入る。
  - ブラウザ localStorage — 最小規模だが、履歴が端末・ブラウザごとに分断され、共用端末ではログアウト後も残る。GROWI に localStorage でユーザーデータを持つ前例がほぼ無い。
  - 自動付与後の実際の送信クエリを保存 — 当時と同じ範囲で再検索できるが、ユーザーが入力していない文字列が履歴に並ぶ。

### 検索履歴の API
- `/_api/v3/search-history` の 1 つの窓口にまとめ、操作の種類で分ける（一覧は `GET`、記録は `POST`、削除は `DELETE /:id`）。いずれもログイン必須で、本人の履歴のみを扱う。
- 記録（`POST`）の応答は、一覧の 1 件と同じ形にする。
- URL と応答の形は、ユーザー本人のデータを一覧・追加・削除する既存の apiv3 に合わせる。最も近い前例は `/_api/v3/bookmark-folder`（作成は `POST /`、削除は `DELETE /:id`、応答は `res.apiv3({ <名前>: ... })` で名前付きのキーに包む）。ただし一覧は本人の分だけを返すので、`bookmark-folder` の `GET /list/:userId` のように URL にユーザー ID は含めない。
- 削除は ID とユーザーの両方で絞り込む。存在しない ID と他人の ID は、前例のように 404 と 403 に分けず、同じ応答で扱う（Constraints を参照）。

### クライアント
- 「検索を実行した」時点で記録 API を呼ぶ。記録の失敗は検索そのものを妨げない（遷移を待たせず、エラーはログに留める）。
- 履歴の取得は SWR フックで行い、モーダルを開いたときに最新化する。削除後は SWR のキャッシュを更新し、一覧に即時反映する。
- Downshift の項目モデルを、URL 遷移に加えて「この文字列で検索を実行する」アクションも表せるように拡張する。履歴項目を `/_search?q=` への URL 遷移で済ませると、記録点と `prefix:` 付与を迂回するため避ける。
- 履歴項目の描画は既存の `SearchMenuItem` 系のコンポーネントに合わせ、削除ボタンを載せる。削除ボタンのイベントは Downshift の項目選択と分離する。

## Scope
- **In**:
  - 検索履歴のモデルとインデックス（ユーザー単位の取得・重複判定に必要なもの）と、共有インターフェース（履歴 1 件の型）
  - 記録ロジック: トリム、空キーワードの除外、同一キーワードの重複時の扱い、保持件数の上限
  - 検索履歴の API（一覧 `GET`・記録 `POST`・削除 `DELETE /:id`）と、そのバリデーション・認可（本人の履歴のみ）
  - クライアント側の記録点の配線（Enter 送信〈`onSearchOverride` 経路を含む。ただし `/_private-legacy-pages` は除く〉、`SearchMethodMenuItem` の選択、履歴からの再検索）
  - 検索モーダルのドロップダウンへの履歴セクション（空入力時の表示、表示件数、0 件・ゲスト時の非表示）と、履歴取得の SWR フック
  - Downshift 項目モデルの拡張と、既存項目とのインデックス管理（`highlightedIndex` の整合）
  - 履歴項目の削除操作（ボタン、アクセシブルなラベル、キーボードでの操作可否）、削除後の一覧の即時反映と失敗時の扱い
  - 文言の i18n（名前空間を明示）
  - g2g リストへの登録（`TRANSFERABLE_COLLECTIONS`）と、インポート時の `userId` の ObjectId への変換（`overwrite-params/`）
  - ユーザー削除 API（`apps/app/src/server/routes/apiv3/users.js`）での、そのユーザーの履歴の削除
- **Out**:
  - 次の 3 つの経路での履歴の記録（いずれも記録しない）:
    - `/_private-legacy-pages` での検索: この画面も `SearchControl` → `SearchModalTriggerinput` から同じ検索モーダルを開き、開くときに `onSearchOverride` を渡している（`PrivateLegacyPages.tsx`）。`onSearchOverride` の経路を一律に記録すると、この画面での検索も記録されてしまう。この画面だけを除く方法は設計で考える。
    - タグのクリック: `TagCloudBox`・`TagList`・`RecentChanges` のタグをクリックすると、検索モーダルを通らずに `/_search?q=tag:…` へ移動する。
    - 検索結果のページへの直接移動: モーダルでキーワードを入力し、その下に出る検索結果（`SearchResultMenuItem`）のページを選んで移動したとき。
  - ゲスト（未ログイン）ユーザーの履歴
  - 履歴の一括削除・全消去、削除の取り消し（Undo）
  - 他ユーザー・管理者からの履歴の閲覧
  - 入力中の文字列による履歴の絞り込み、履歴以外のソースによるサジェスト／オートコンプリート（初期スコープは空入力時の表示。入力ありのときの扱いは要件フェーズで決める）
  - 検索 API（`GET /_api/search`）の変更
  - 検索演算子の解釈・変更（`search-filters` の領域）
  - `/_search` ページのフィルタパネル・チップ・ソート操作・ユーザー名タイプアヘッド

## Boundary Candidates
spec は 1 本だが、設計・タスク分けでは次の切れ目を意識する。要件とタスクはチケット（保存・再検索・削除）ごとにグループ化し、各グループを PR の単位にできるようにする。
- **履歴のデータ契約**: 1 件の形（ID・キーワード・最終検索日時）、同一キーワードの重複時の扱い（最新へ繰り上げるか）、保持件数の上限、一覧の並び順。
- **サーバ API**: 上記「検索履歴の API」の窓口と認可。
- **記録点**: 「検索を実行した」とみなす箇所。`SearchModal` の送信処理（`onSearchOverride` 経由を含む）と `SearchMethodMenuItem` の選択（`searchHandler` を経由しない）の両方を漏らさないこと。履歴からの再検索もここを通す。ただし `onSearchOverride` 経由であっても、`/_private-legacy-pages` での検索は記録しない。
- **Downshift の項目モデルと履歴一覧の表示**: 履歴項目は「その文字列で検索を実行する」アクション。各項目には削除操作が載る。
- **削除操作と項目選択のイベント分離**。

## Out of Boundary
- `search-filters` が持つ演算子のパース・Elasticsearch クエリ（演算子トークン〈`prefix:` / `tag:` / `author:` / `editor:` / `group:` など〉は入力文字列の一部としてそのまま保存・再投入し、解釈・書き換えはしない）
- `/_search` のフィルタパネル・チップ・ソート操作の挙動

## Upstream / Downstream
- **Upstream**: 検索モーダル（`SearchModal` / `SearchForm` / `SearchMenuItem` 系 / `SearchMethodMenuItem` / `SearchHelp`）、Downshift、`states/search/keyword-manager.ts`、apiv3 ルーティングと `loginRequired` / `accessTokenParser`、Prisma（`schema.prisma`）と migrate-mongo の migration（インデックス作成）
- **Downstream**: なし（将来の一括削除・全消去、入力中の履歴絞り込みは別スコープ）

## Existing Spec Touchpoints
- **Extends**: なし
- **Adjacent**: `search-filters`（同じ検索ボックスを使う別機能）

## Constraints
- 新規コレクションは Mongoose を持たない Prisma だけのコレクションにする。Mongoose のスキーマ・モデルは作らず（Mongoose は退役予定）、データアクセスは Prisma のみで行う。モデルは `apps/app/prisma/schema.prisma` に宣言する。
- **インデックスの作成**: Prisma は MongoDB のインデックスを作らない（デプロイで `prisma db push` は実行されない）。そのため、ユーザー単位の取得・重複判定に必要なインデックスは migrate-mongo の migration script（`apps/app/src/migrations/`）で作る。
  - 前例: Mongoose を持たない Prisma だけのコレクション（`auditlog_es_sync_status`、`changestream_resume_tokens`）の一意インデックスを作る `20260619120000-add-unique-key-index-to-auditlog-es-sync-collections.js`。モデルは使わず、`mongoose.connection.collection(name)` に対して `createIndex` する。一意インデックスの場合は、先に重複を消す。`down` は、コレクションとインデックスがあるときだけ消す。
  - migration は、本番ではサーバーの起動前に実行される（`preserver` → `pnpm run migrate`）。統合テストでは、テンプレート DB の作成時に一度だけ実行される（`test/setup/mongo/template-db.ts`）。
  - インデックス名は、`schema.prisma` の `@@unique` / `@@index` の `map` と一致させる。
  - `.claude/rules/model.md` は、移行期間中は Mongoose がインデックスの作成を持つとしている。しかし、これは既存の Mongoose モデルを Prisma に移すときの方針である。Mongoose を持たない新しいコレクションには上記の migration の前例があり、`comment-reactions` spec（`commentreactions` コレクション）も同じ方式を採っている。
  - umzug の Prisma migration（`prisma/migrate.ts`、`prisma/migrations/`）は前例が無いので使わない。
- 新規コレクションを、エクスポート／インポートや GROWI 間移行（g2g）の対象にするかを決める（既存の扱いは `apps/app/src/server/service/import/non-transferable-collections.ts`）。
  - **要件で決定済み**: エクスポート、g2g のどちらの対象にもする。両者は別々の仕組みなので、分けて扱う。
  - **g2g**: `apps/app/src/server/service/import/non-transferable-collections.ts` の `TRANSFERABLE_COLLECTIONS` に検索履歴のコレクションを登録する。このファイルには、新しいコレクションがどちらのリストにも入っていないと失敗するテスト（`non-transferable-collections.integ.ts`）があり、登録を忘れると CI が落ちる。
  - **エクスポート**: 管理画面のエクスポートには、`apps/app/src/stores/admin/export.ts` の `IGNORED_COLLECTION_NAMES` に入っていないコレクションがすべて表示される。何もしなければエクスポートの対象になるので、このリストには追加しない。
  - **インポート時の型の変換**: Mongoose のモデルが無いコレクションをインポートすると、`_id` と日付以外の参照項目（今回は `userId`）が文字列のまま入る。`comment-reactions` spec と同じく、`apps/app/src/server/service/import/overwrite-params/` にこのコレクション用の変換を足して、`userId` を ObjectId に戻す。
- ユーザー削除時に、そのユーザーの履歴を消すかを決める。
  - **要件で決定済み**: ユーザーを削除済みの状態にした時点で、そのユーザーの履歴を消す。一時停止では消さない。
  - **処理を入れる場所**: 管理画面のユーザー削除 API（`apps/app/src/server/routes/apiv3/users.js` で `user.statusDelete()` を呼んでいる箇所）。テスト以外で `statusDelete()` を呼んでいるのはここだけ。直後に `prisma.externalaccounts.deleteMany` を実行しているので、同じ形で検索履歴も消す。
- 検索履歴 API の操作（記録・削除）は activity（監査ログ）に記録しない。GET 以外の apiv3 は `addActivity` で記録するのが基本（`apps/app/.claude/rules/activity-recording.md`）だが、ユーザーが検索したこと自体は、検索 API（`GET /_api/search`、`apps/app/src/server/routes/search.ts`）がすでに `ACTION_SEARCH_PAGE` として activity に記録しているため、履歴側では重複して記録しない。実装時に上の rule に従って `addActivity` を足さないこと。
- 検索は `loginRequired`（ゲスト許可）配下で、ゲスト閲覧が有効な環境では未ログインでも検索できる。履歴の記録・表示・削除はログインユーザーに限る。
- 履歴はユーザー本人だけが読み書き・削除できる。他ユーザーの履歴の存在有無が、レスポンスの違いから推測できないようにする（存在しない ID と他人の ID を同じ応答で扱う）。
- 既存の `SearchMethodMenuItem` / `SearchResultMenuItem` の挙動（項目の並び、`highlightedIndex` の起点）を壊さないこと。
- 削除ボタンのクリック・キー操作が Downshift の項目選択（再検索）を発火させないこと。
- UI 文言は名前空間を明示する（`commons` など。既存の `SearchMethodMenuItem` は `commons` を使用）。
- TypeScript strict、Biome、Vitest（テスト co-located）。
- 要件フェーズで決める未決事項:
  - 検索履歴 API に使うアクセストークンのスコープ: 本 brief は API の形を `bookmark-folder` に合わせる方針で、`bookmark-folder` は `accessTokenParser([SCOPE.READ.FEATURES.BOOKMARK])` のように機能ごとの専用スコープを使う。しかし `packages/core/src/interfaces/scope.ts` の `SCOPE_SEED_USER` には、検索履歴に合うスコープが無い。新しいスコープを作る場合は、npm に公開している `@growi/core` を変更することになり、changeset とアクセストークン画面の文言の追加も必要。既存のスコープを使う場合は、どれを使うかを決める必要がある。
  - 保存: 保持件数の上限値、同一キーワード再実行時の扱い（最新へ繰り上げる想定）、大文字小文字・前後空白の同一視、キーワード長の上限、完全一致（`"..."` で囲む）を選んだときに引用符を履歴に残すか（`SearchMethodMenuItem` には「全体を検索」「子ページを検索（`prefix:` を付与）」「完全一致」の 3 種がある）
    - **要件で決定済み**: 保持件数の上限は 50 件。
    - **要件で決定済み**: 同一キーワードかどうかは、前後の空白を除いた文字列の完全一致で判定する（大文字小文字は区別する）。同一キーワードを再実行したときは、その履歴を最新に繰り上げる。
    - **要件で決定済み**: 200 文字を超えるキーワードは保存しない。
    - **要件で決定済み**: 完全一致を選んだ場合は、引用符付き（`"キーワード"`）で保存する。
  - 再検索: ドロップダウンに出す件数、履歴セクションと「検索方法」項目の上下関係、入力ありのときに履歴を出すか
  - 削除: 削除前の確認の有無（1 件削除のため確認なしを想定）、キーボードで削除操作に到達できるようにするか、楽観的更新か応答待ちか

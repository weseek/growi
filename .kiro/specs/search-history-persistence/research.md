# Research & Design Decisions: search-history-persistence

## Summary
- **Feature**: `search-history-persistence`
- **Discovery Scope**: Extension（既存の検索モーダル・apiv3・データ移行の仕組みへの追加。新しい外部依存なし）
- **Key Findings**:
  - 検索モーダルからの検索の実行はすべて Next.js のクライアント側遷移（`router.push`）で、ページ全体の再読み込みは起きない。ただし遷移元の画面（とモーダル）はアンマウントされ、Next.js は遷移に失敗するとページ全体の読み込みに切り替える。タブを閉じる操作も含め、記録の通信を「ページが残っている前提」で送ってはならない。
  - ユーザーの削除（`DELETE /_api/v3/users/:id/remove`）はソフト削除で、他のコレクションが後始末に乗れるイベントやフックは無い。バックアップのエクスポートとファイルからのインポートには、コレクションを除外する仕組みが無い（G2G の `NON_TRANSFERABLE_COLLECTIONS` は G2G でしか使われていない）。
  - apps/app には Mongoose のトランザクションの前例が無く、E11000 は握りつぶすだけで再試行の前例も無い。同時記録への耐性は、一意インデックスと単一文書の原子的な操作で作る必要がある。

## Research Log

### 検索の実行経路とキーワードの所在
- **Context**: 要件 1、2 の記録点と、保存する文字列の取り出し位置を決めるため。
- **Sources Consulted**: `features/search/client/components/SearchModal.tsx`、`SearchForm.tsx`、`SearchMethodMenuItem.tsx`、`SearchResultMenuItem.tsx`、`client/interfaces/downshift.ts`、`states/search/keyword-manager.ts`、`states/modal/search.ts`、`components/SearchPage/SearchModalTriggerinput.tsx`、`SearchControl.tsx`、`SearchPage.tsx`、`PrivateLegacyPages.tsx`
- **Findings**:
  - 自動の `prefix:` も完全一致の引用符も付いていない入力は、`SearchModalSubstance` の `searchInput`（`useState`）だけが持つ。`prefix:` の付与は親の `SearchModal.searchHandler`、`/_search` 上の `onSearchOverride` の分岐もその中にある。
  - Enter による送信は `SearchForm.submitHandler`（空白のみなら送信しない）→ `SearchModalSubstance.submitHandler` → `onSearch(searchInput)`。`onSearchOverride` の有無にかかわらず `submitHandler` を通る。
  - メニュー項目の選択は Downshift の `onSelect` → `selectSearchMenuItemHandler(selectedItem)`。`DownshiftItem` は `{ url: string }` だけで、選ばれた項目が検索方法なのかページ候補なのか、元のキーワードが何かは渡らない。
  - 検索方法の項目は 3 つ。「全体を検索」と「完全一致」はキーワードが空白のみのとき表示されない。「子ページを検索」は空でも表示される。
  - Downshift は、項目がハイライトされている状態の Enter を項目の選択として扱い、keydown の既定動作を止めるので、フォームの送信は起きない。ハイライトが無いときの Enter はフォームの送信になる。1 回の Enter で両方が走ることは無い。
  - `/_search` 上のフィルタ・ソート・ページ送り、タグのクリック（`TagCloudBox`、`TagList`、`RenderTagLabels`、`RecentChangesSubstance`）は `useSetSearchKeyword` を直接呼び、モーダルを通らない。
  - `/_private-legacy-pages` でも `SearchModalTriggerinput` が `onSearchOverride` 付きでモーダルを開く。
- **Implications**: 記録点は `SearchModalSubstance` の 2 つのハンドラに置く。メニュー項目には「選んだら記録する文字列」を項目自身に持たせる（Decision「Downshift 項目への記録用の項目の追加」）。タグのクリックや URL 直接入力はモーダルを通らないので、記録されない（要件 1.6 と一致）。

### クライアント側の遷移と通信の打ち切り
- **Context**: 記録の完了を待たずに遷移する（要件 6.1）ときに、記録の通信を途中で切らせないため（ユーザー指示）。
- **Sources Consulted**: `client/util/apiv3-client.ts`、`utils/axios/create-custom-axios.ts`、axios 1.15.0 の `lib/adapters/fetch.js`・`lib/core/mergeConfig.js`、`pages/_search/index.page.tsx`、`components/Layout/BasicLayout.tsx`、`server/middlewares/certify-origin.ts`、`server/util/is-simple-request.ts`
- **Findings**:
  - 検索のすべての経路は `router.push` / `router.replace` によるクライアント側遷移。XHR は SPA 遷移では中断されない。ただし Next.js はクライアント側遷移の失敗（`_next/data` の取得失敗など）でページ全体の読み込みに切り替え、その時点で XHR は中断される。ユーザーが検索直後にタブを閉じる場合も同じ。
  - リポジトリに `fetch(..., { keepalive: true })` や `navigator.sendBeacon` の使用例は無い。
  - axios 1.15 は `adapter: 'fetch'` と `fetchOptions` を受け付け、`fetchOptions` は `Request` の初期化引数へそのまま展開される。`withCredentials` の既定は未設定で、fetch アダプタは `credentials: 'same-origin'` を使うので、セッション Cookie は送られる。
  - `apiv3Post` は設定（config）を受け取らない。
  - サーバの `/_api` は `certifyOrigin` で同一オリジンかを確かめるだけで、CSRF トークンは使わない（`csurf` は全メソッドを無視）。同一オリジンの keepalive fetch は CORS のプリフライトも要らない。
  - keepalive の要求は、ブラウザ全体で同時に送れる本文の合計が 64 KiB までに制限される。本要求の本文は 200 文字のキーワード 1 つで、十分に小さい。
  - `navigator.sendBeacon` はヘッダーを付けられず、本文の型を `application/json` にすると扱いがブラウザで揺れ、`text/plain` では `bodyParser.json` が解釈しない。応答も読めない。
  - 共通の axios インスタンスは応答の文字列のうち ISO 8601 形式に一致するものをすべて `Date` に変える（`convertStringsToDates`）。キーワードがたまたま ISO 形式の文字列（例 `2026-10-15T00:00:00Z`）だと、`keyword` まで `Date` になる。
- **Implications**: 記録の送信は、共通の axios インスタンスに `adapter: 'fetch'` と `fetchOptions: { keepalive: true }` を渡す専用の送信関数で行う。`apiv3Post` には手を入れない。応答の解釈は専用の純関数で行い、`keyword` を常に文字列として扱う（Decision「記録の送信に keepalive の fetch を使う」）。

### サーバの API の形と認可
- **Context**: `/_api/v3/search-history` を既存の本人データの API（ブックマークなど）の形に揃えるため（ユーザー指示、アンブレラ roadmap の Boundary Strategy）。
- **Sources Consulted**: `server/routes/apiv3/bookmark-folder.ts`、`bookmarks.ts`、`user-ui-settings.ts`、`server/routes/apiv3/index.js`、`server/routes/apiv3/response.js`、`server/middlewares/apiv3-form-validator.ts`、`features/news/server/routes/news.ts`、`features/page-bulk-export/server/routes/apiv3/page-bulk-export.ts`、`packages/core/src/interfaces/scope.ts`、`apps/app/.claude/rules/activity-recording.md`
- **Findings**:
  - `bookmark-folder` は `setup(crowi): Router` のファクトリで、`index.js` の利用者向けルータに `router.use('/bookmark-folder', setupBookmarkFolder(crowi))` で載る。作成は `POST /`、削除は `DELETE /:id`、各ルートは `accessTokenParser([SCOPE...], { acceptLegacy: true })` → `loginRequiredStrictly` → express-validator → `apiV3FormValidator` → ハンドラの順。応答は `res.apiv3({ bookmarkFolder })` のように名前付きのキーで包む。一覧は `GET /list/:userId` で、URL に利用者 ID を含む。
  - 新しい feature のルータは、ファクトリの中でルータを作る（`news.ts`、`page-bulk-export.ts`）。
  - 検索履歴に合うアクセストークンのスコープは無い。ページ検索（`GET /_api/search`）は `SCOPE.READ.FEATURES.PAGE` を使う。news は通知のスコープを流用している。新しいスコープを足すには `@growi/core` の `SCOPE_SEED`・型・i18n キーの変更と changeset が要る。
  - `addActivity` は監査ログに操作を残すためのもので、`bookmark-folder` は使っていない。
  - `loginRequiredStrictly`（`loginRequiredFactory(crowi)`）は未ログインの要求を拒否する。
- **Implications**: `features/search/server/routes/apiv3/search-history.ts` に `setup(crowi): Router` を置き、`index.js` の `bookmark-folder` の並びに載せる。一覧は `GET /`（URL に利用者 ID を含めない）、記録は `POST /`。スコープは `SCOPE.READ/WRITE.FEATURES.PAGE` を使う（Decision「アクセストークンのスコープ」）。

### データ層とインデックス
- **Context**: 新しいコレクションを Mongoose と Prisma のどちらで扱うかを決めるため（brief の Constraints）。
- **Sources Consulted**: `.claude/rules/model.md`、`.kiro/steering/tech.md`（Data Layer）、`apps/app/prisma/schema.prisma`、`src/utils/prisma.ts`、`features/contribution-graph/server/models/contribution-model.ts`、`features/news/server/models/news-read-status.ts`、`features/comment/server/models/comment.ts`、`src/server/models/bookmark.ts`、`src/server/crowi/setup-models.ts`
- **Findings**:
  - コレクションとインデックスの作成は、すべてのモデルの移行が終わるまで Mongoose が持つ。
  - Mongoose だけのコレクション（`contributions`、`vault_*` など）は `schema.prisma` に宣言されていない。Prisma で扱うモデルは、Mongoose のスキーマと `schema.prisma` と `Prisma.defineExtension` の 3 つを揃えている。
  - `bookmark.ts` は「同時の要求で一意インデックスの P2002 が出る」ので `create` を `upsert` にしている。Prisma の MongoDB 向け `upsert` が単一の `findAndModify` になる保証は確認できなかった。
  - `setupIndependentModels` は、データ移行の分類漏れを検知する統合テストがモデルを見つけるための登録先でもある。
- **Implications**: Mongoose だけで書く（Decision「データ層は Mongoose だけで書く」）。`setupIndependentModels` に登録する。

### 同時記録（複数タブ）
- **Context**: 複数のタブから同時に記録されても、重複せず 50 件を超えないようにするため（ユーザー指示、要件 3）。
- **Sources Consulted**: `features/news/server/services/news-service.ts`（E11000 の扱い）、`src/server/models/page-redirect.ts`、`src/server/models/bookmark.ts`、`features/auditlog-es-sync/server/models/auditlog-es-sync-tx.ts`（Prisma `$transaction`）、MongoDB の `findAndModify`（upsert）と一意インデックスの振る舞い
- **Findings**:
  - 単一文書の更新は MongoDB では原子的。`findOneAndUpdate(filter, update, { upsert: true })` は、同じ filter で同時に走ると両方が挿入を試みることがあり、一意インデックスがあれば片方が E11000 で失敗する。MongoDB 4.2 以降のサーバは、filter が一意インデックスの等価条件だけのときこの upsert を内部で再試行するが、条件の揃い方に依存するため、アプリ側でも 1 回の再試行を持つ。
  - 上限を超えた分の削除を「上から 51 件目以降の ID を読んで、その ID を消す」と書くと、読んだ後に別のタブがその履歴を最新に繰り上げた場合に、繰り上げたばかりの履歴を消してしまう（別のタブの応答が返した履歴が存在しなくなる）。
  - 削除の条件に「読んだときの最終検索日時以前であること」を足すと、繰り上げられた履歴は条件から外れる。
  - 記録のたびに、その記録の後に読む上限の削除が走るので、最後に走った削除は先行するすべての挿入を見ている。そのため保存件数は最終的に 50 件以下に収まる。挿入と削除の間に、保存件数が一時的に 51 件以上になる瞬間はある。
  - apps/app には Mongoose のトランザクションの前例が無い。
- **Implications**: 一意インデックス `{ user, keyword }` ＋ 単一の `findOneAndUpdate`（upsert）＋ E11000 で 1 回再試行、上限の削除は「条件付きの削除」、一覧は常に `limit(50)` を掛ける（Decision「同時記録への耐性」）。

### ユーザー削除とデータ移行
- **Context**: 要件 7。
- **Sources Consulted**: `server/routes/apiv3/users.js`（`/:id/remove`、`/:id/deactivate`）、`server/models/user/index.js`（`statusDelete`）、`server/events/user.ts`、`server/service/import/non-transferable-collections.ts`（と `.integ.ts`）、`server/routes/apiv3/g2g-transfer.ts`、`server/routes/apiv3/mongo.js`、`server/routes/apiv3/export.js`、`server/routes/apiv3/import.ts`、`client/components/Admin/ExportArchiveData/SelectCollectionsModal.tsx`、`.kiro/specs/g2g-transfer-migration-mode/design.md`
- **Findings**:
  - 管理者による削除は `DELETE /_api/v3/users/:id/remove` だけ。`statusDelete()` で状態を削除済みにし、利用者の文書は残る（ソフト削除）。同じハンドラで `UserGroupRelation`、`ExternalUserGroupRelation`、`externalaccounts` を直接消している。後始末のためのイベントやフックは無い。一時停止は `/:id/deactivate` で、状態を変えるだけ。
  - `NON_TRANSFERABLE_COLLECTIONS` は G2G（押す側の候補の提示 `GET /transferable-collections`、押す処理、受ける側の拒否）でしか使われない。基準は「その環境の運用状態で、内容ではない」もの。
  - バックアップのエクスポートは、`GET /_api/v3/mongo/collections` が DB の全コレクションを返し、`POST /_api/v3/export` は指定されたコレクションが存在するかだけを確かめる。除外の仕組みは無い。
  - ファイルからのインポートは、`POST /_api/v3/import/upload` と `GET /_api/v3/import/status`（`ImportService.getStatus()`）が zip の中身（`innerFileStats`）を画面に返し、`POST /_api/v3/import` が要求本文の `collections` で絞るだけ。除外の仕組みは無い。zip の解析（`growiBridgeService.parseZipFile`）はエクスポートの状態表示と G2G の受信でも使われる。
  - 分類漏れを検知する統合テスト（`non-transferable-collections.integ.ts`）は、DB・Mongoose のモデル・`schema.prisma` から集めたコレクション名が、`NON_TRANSFERABLE_COLLECTIONS` か `TRANSFERABLE_COLLECTIONS` のどちらかに載っていることを求める。
- **Implications**: 削除済みにするハンドラに検索履歴の削除を 1 行足す。データ移行の除外は、新しい集合「どの経路でも環境の外へ出さない個人データ」を作り、G2G（`NON_TRANSFERABLE_COLLECTIONS` に含める）・エクスポート（一覧と実行）・ファイルインポート（中身の一覧と実行）の 3 つの経路がそれを読む（Decision「データ移行から外す仕組み」）。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 既存 feature の拡張（採用） | `features/search/` に `server/` と共有の `interfaces/`・`utils/` を足し、記録点は既存のモーダルに配線する | 既存の feature 構成（news、page-bulk-export）と同じ。検索の関心が 1 か所にまとまる | `features/search/` の client と server が同じディレクトリに並ぶ（他の feature と同じ） | steering の Feature-Based Architecture に合う |
| 新しい feature `features/search-history/` | 検索履歴を独立した feature にする | 削除・再検索も含めて独立して見える | 記録点は検索モーダルの中にあり、結局 `features/search/` を触る。検索の feature が 2 つに割れる | 不採用 |

## Design Decisions

### Decision: 記録の送信に keepalive の fetch を使う
- **Context**: 記録の完了を待たずに検索結果ページへ移動する（要件 6.1）。移動のタイミングで記録の通信が途中で切れないようにする（ユーザー指示）。
- **Alternatives Considered**:
  1. `apiv3Post` をそのまま待たずに呼ぶ — SPA 遷移では切れないが、Next.js の全体読み込みへの切り替えやタブを閉じる操作では切れる。
  2. `navigator.sendBeacon` — 切れないが、ヘッダーと JSON の本文が扱いにくく、応答も読めない（再検索の画面が記録の結果を使えない）。
  3. 共通の axios インスタンスに `adapter: 'fetch'` と `fetchOptions: { keepalive: true }` を渡す専用の送信関数 — 切れず、応答も読め、既存のヘッダーと Cookie の扱いを引き継ぐ。
  4. `apiv3Post` に設定の引数を足す — 共通の関数の契約を、1 つの利用者のために広げる。
- **Selected Approach**: 3。送信関数 `postSearchHistory` を `features/search/client/services/` に置く。
- **Rationale**: ブラウザが文書の破棄の後も送信を続ける標準の手段で、応答を読める。共通の axios の設定（`X-Requested-With`、`Content-Type`、同一オリジンの Cookie）をそのまま使える。
- **Trade-offs**: keepalive 非対応のブラウザでは通常の fetch として送られ、全体読み込みのときに切れうる（現行の主要ブラウザは対応済み）。keepalive は本文の合計 64 KiB の制限を受けるが、本要求は十分に小さい。
- **Follow-up**: 送信関数の単体テストで、`adapter: 'fetch'` と `fetchOptions.keepalive === true` が渡ることを確かめる。

### Decision: 応答の解釈を専用の純関数で行う
- **Context**: 共通の axios インスタンスは ISO 8601 形式に一致する文字列をすべて `Date` に変える。ISO 形式の文字列で検索すると、`keyword` が `Date` になる。
- **Selected Approach**: 記録の送信関数 `postSearchHistory` と一覧の取得関数 `getSearchHistories` は応答の自動変換を使わず（`transformResponse` で JSON の解釈だけ行う）、純関数 `deserializeSearchHistory` で `lastSearchedAt` だけを `Date` にする。共通の `apiv3Get` は設定を受け取れず、自動変換を避けられないので、一覧の取得関数も本スペックが持つ。recall の取得フック（SWR）は `getSearchHistories` を fetcher に使う。
- **Rationale**: データ契約を持つ側で、型どおりの値への変換を 1 か所にまとめる。
- **Trade-offs**: recall が `apiv3Get` で直接取得すると同じ問題が一覧側に残る（Revalidation Trigger と recall への申し送り）。

### Decision: Downshift 項目への記録用の項目の追加
- **Context**: 検索方法のメニュー項目を選んだときに、その検索のキーワード（完全一致なら引用符付き）を記録する（要件 1.3、2.4、2.5）。`DownshiftItem` は `{ url }` だけで、選択のハンドラはどの項目かを知らない。アンブレラ roadmap は Downshift の項目モデルを recall の所有としている。
- **Alternatives Considered**:
  1. 選ばれた URL を解析して検索方法とキーワードを推定する — URL は符号化されておらず、`prefix:` や引用符はユーザーが入力したものと区別できない。
  2. 各項目の `onClick` で記録する — キーボードで選んだときに記録されない。
  3. `DownshiftItem` に省略可能な `searchHistoryKeyword?: string` を足し、検索方法の項目だけがそれを持つ。選択のハンドラは、それがあれば記録する。
- **Selected Approach**: 3。項目の形の変更はこの 1 項目の追加だけに留める。
- **Rationale**: 項目自身が「選ばれたら何を記録するか」を宣言し、ハンドラは項目の種類を知らずに扱える（データ駆動）。recall の履歴項目も、選んだら履歴を最新に繰り上げる必要があり（roadmap の記録点）、同じ項目を使えば記録点を迂回しない。
- **Trade-offs**: `DownshiftItem` の型を recall と共有する。所有の境界は「`searchHistoryKeyword` の意味（選ばれたら記録する、保存規則の適用済みの文字列）は persistence、それ以外の項目モデルは recall」とする。roadmap の「Downshift の項目モデル（recall が所有）」に、この項目だけが persistence の持ち物として加わる。

### Decision: データ層は Mongoose だけで書く
- **Context**: 新しいコレクションのデータアクセスを Mongoose と Prisma のどちらで書くか（brief の Constraints）。
- **Alternatives Considered**:
  1. Mongoose だけ（`contributions`、`newsreadstatuses` と同じ）
  2. Mongoose のスキーマ（インデックス用）＋ Prisma のモデルと拡張（`comments`、`bookmarks` と同じ）
  3. Prisma だけ ＋ migration script でインデックスを作る（`comment-reactions` と同じ）
- **Selected Approach**: 1。
- **Rationale**: 同時記録への耐性の中心は「単一の `findOneAndUpdate`（upsert）」と「条件付きの `deleteMany`」で、MongoDB の操作をそのまま書ける Mongoose が最も確かめやすい。Prisma の MongoDB 向け `upsert` が単一の `findAndModify` になる保証を確認できなかった。インデックスの作成は model.md のとおり Mongoose が持つ。読み書きは 1 つのサービスに閉じ、他から使われないので、後の Prisma への移行は 1 ファイルの書き換えで済む。
- **Trade-offs**: Prisma へ移行するモデルが 1 つ増える。

### Decision: 同時記録への耐性
- **Context**: 複数のタブから同時に記録されても、重複せず 50 件を超えない（ユーザー指示、要件 3.1〜3.5）。
- **Alternatives Considered**:
  1. Mongoose のトランザクションで「upsert → 件数確認 → 削除」をまとめる — apps/app に前例が無く、書き込みの競合時の再試行も要る。
  2. 利用者ごとに 1 文書を持ち、履歴を配列に入れて `$pull` / `$push` + `$slice` で更新する — 1 回の更新で上限まで保てるが、履歴 1 件の識別子（要件 3.3、delete の `DELETE /:id`）を自前で振る必要があり、繰り上げ時の識別子の保持も配列操作で表すことになる。
  3. 一意インデックス ＋ 単一の upsert ＋ 条件付きの削除。
- **Selected Approach**: 3。
  - 一意インデックス `{ user: 1, keyword: 1 }` で、同じキーワードの文書は 1 つしか存在できない（照合順序は指定せず、バイナリ比較。要件 3.2 の大文字小文字の区別と一致）。
  - 記録は `findOneAndUpdate({ user, keyword }, { $currentDate: { lastSearchedAt: true }, $setOnInsert: { user, keyword } }, { upsert: true, new: true })` の 1 回。既存なら `_id` は変わらない（要件 3.3）。E11000 なら 1 回だけ同じ操作を再試行する（2 回目は既存の文書の更新になる）。
  - 上限の削除は、記録の後に「新しい順（`lastSearchedAt` 降順、`_id` 降順）で 51 件目以降」を読み、その中の最も新しい `lastSearchedAt` を境界として `deleteMany({ user, _id: { $in: ids }, lastSearchedAt: { $lte: 境界 } })` を行う。読んだ後に繰り上げられた履歴は境界より新しくなるので消えない。
  - 一覧は同じ並びで常に `limit(50)` を掛ける。
  - 時刻は `$currentDate`（DB サーバの時計）で付ける。アプリサーバが複数あっても時計のずれで並びが崩れない。
- **Rationale**: 単一文書の操作だけで重複を防げ、上限は最後に走る削除で必ず回復する。一覧の `limit` で、利用者からは常に 50 件以下に見える。
- **Trade-offs**: 挿入と削除の間に、保存件数が一時的に 51 件以上になる瞬間がある（一覧には現れない）。上限の削除が失敗しても記録は成功として返し、次の記録の削除で回復する。
- **Follow-up**: 統合テストで、同じキーワード・異なるキーワードの同時記録と、繰り上げと削除の競合を再現して確かめる。

### Decision: アクセストークンのスコープ
- **Context**: `bookmark-folder` と同じく、apiv3 の各ルートは `accessTokenParser` にスコープを渡す。検索履歴に専用のスコープは無い。
- **Alternatives Considered**:
  1. 新しいスコープ `features:search_history` を足す — `@growi/core` の変更、i18n、changeset が要る。
  2. `USER_SETTINGS.OTHER` — 利用者の設定で、検索の履歴とは意味が離れる。
  3. `FEATURES.PAGE`（ページ検索 `GET /_api/search` と同じ）。
- **Selected Approach**: 3。一覧は `SCOPE.READ.FEATURES.PAGE`、記録は `SCOPE.WRITE.FEATURES.PAGE`。
- **Rationale**: 検索履歴は検索の付随物で、検索と同じスコープで扱うのが利用者に分かりやすい。共有パッケージの変更を持ち込まない。
- **Trade-offs**: 検索履歴だけを許すトークンは作れない。必要になったら専用のスコープを足す（Revalidation Trigger）。

### Decision: 監査ログに残さない
- **Context**: `bookmarks` などは `addActivity` で操作を監査ログに残す。
- **Selected Approach**: 記録・一覧の取得とも `addActivity` を付けない。
- **Rationale**: 検索のたびに監査ログが増え、検索キーワードという個人的な内容が監査ログに入る。要件に監査の求めは無い。

### Decision: 読み取り専用ユーザーも記録できる
- **Context**: 書き込みの API の一部は `excludeReadOnlyUser` で読み取り専用ユーザーを拒否する。
- **Selected Approach**: 付けない。
- **Rationale**: 読み取り専用はページなどの内容の書き込みを制限するもので、本人の検索履歴は内容ではない。要件 5.1 の「ログインユーザー本人」に読み取り専用ユーザーも含まれる。

### Decision: データ移行から外す仕組み
- **Context**: 検索履歴をエクスポート・インポート・G2G の対象にしない（要件 7.2〜7.4）。G2G には除外の集合があるが、エクスポートとファイルインポートには無い。
- **Alternatives Considered**:
  1. `NON_TRANSFERABLE_COLLECTIONS` に足すだけ — G2G しか外れない。また、この集合の基準は「環境の運用状態」で、検索履歴（利用者の個人データ）は基準に当たらない。
  2. `NON_TRANSFERABLE_COLLECTIONS` をエクスポートとファイルインポートにも適用する — `activities` や `sessions` などのバックアップの挙動が変わり、本スペックの範囲を超える。
  3. 新しい集合 `NON_PORTABLE_COLLECTIONS`（どの経路でも環境の外へ出さない、または外から入れない個人データ）を作り、`NON_TRANSFERABLE_COLLECTIONS` はそれを含む。エクスポートとファイルインポートは新しい集合だけを読む。
- **Selected Approach**: 3。新しい集合は `non-transferable-collections.ts` に、基準の説明とともに置く。
- **Rationale**: 除外の理由（運用状態か、個人データか）ごとに集合を分け、既存の基準を曖昧にしない。G2G は既存の 3 か所の利用でそのまま外れる。分類漏れの統合テストも満たす。
- **Trade-offs**: エクスポートとファイルインポートに、除外の処理を新しく足す（エクスポートの一覧・実行の検証、インポートの中身の一覧 2 か所と実行）。インポートの 3 か所は純関数 `excludeNonPortableFileStats` を共有する。zip の解析そのものでは除かない（エクスポートの状態表示と G2G の受信が、zip の中身をそのまま必要とするため）。
- **Follow-up**: 将来、別の個人データのコレクションを外すときは、この集合に足すだけで 3 つの経路から外れる。

### Decision: ユーザー削除時の後始末
- **Context**: 削除済みにしたとき履歴を消し、一時停止では消さない（要件 7.1）。後始末のフックは無い。
- **Selected Approach**: `DELETE /_api/v3/users/:id/remove` のハンドラで、`externalaccounts` の削除と同じ並びに検索履歴の削除（サービスの `deleteSearchHistoriesByUser`）を足す。`/:id/deactivate` には触れない。
- **Rationale**: 既存の後始末（グループの関係、外部アカウント）と同じ場所・同じ方式に揃える。
- **Trade-offs**: 利用者を削除済みにする経路が増えたら、そこにも足す必要がある（Revalidation Trigger）。

### Generalization / Simplification（Synthesis）
- **Generalization**: 「保存する文字列を決める」規則（前後の空白の除去、完全一致の引用符、空の除外、200 文字の上限）を 1 つの純関数 `buildSearchHistoryKeyword` にまとめ、クライアント（記録点）とサーバ（入力の検証）の両方が使う。文字数は code point で数える（`String.length` の UTF-16 単位や express-validator の `isLength` と食い違わないように、両側とも同じ関数で判定する）。
- **Generalization**: 「選ばれたら記録する文字列」を Downshift 項目の宣言にしたことで、recall の履歴項目も同じ経路で記録できる。
- **Build vs Adopt**: 通信の打ち切り対策は、ブラウザ標準の `keepalive` と axios の既存の fetch アダプタを使い、自前の送信キューや再送の仕組みは作らない。同時記録は、MongoDB の一意インデックスと単一文書の原子性に任せ、トランザクションや分散ロックは作らない。
- **Simplification**: 一覧の取得フック（SWR）は作らない（本スペックに表示の利用者がいない。recall が作る）。記録の応答の 201/200 の区別はしない（どちらも 200）。監査ログ、新しいスコープ、Prisma のモデルは足さない。

## Risks & Mitigations
- 上限の削除が失敗すると、保存件数が一時的に 50 件を超えたままになる — 記録は成功として返し、サーバのログに残す。一覧は `limit(50)` で常に 50 件以下に見え、次の記録の削除で回復する。
- 削除済みにする処理で、`statusDelete()` の後に検索履歴の削除が失敗すると履歴が残る — 既存の後始末（外部アカウント）と同じ扱い。ハンドラは 500 を返し、管理者は再実行できる（再実行の可否は既存のハンドラの振る舞いに従う）。
- ISO 形式のキーワードが `Date` に化ける — 記録・一覧とも本スペックの取得関数で防ぐ。recall はその関数を fetcher に使う（recall への申し送り）。
- keepalive 非対応のブラウザ — 通常の fetch として送られる。検索そのものには影響しない。
- 検索の実行と記録の要求の順序 — 記録は遷移の前に送り始めるので、遷移の取得と並行する。記録の遅れや失敗は検索に影響しない（要件 6）。

## References
- [Fetch Standard — keepalive](https://fetch.spec.whatwg.org/) — 文書の破棄後も送信を続けるフラグと、64 KiB の制限
- [MDN — RequestInit.keepalive](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit) — ブラウザの対応状況
- [MongoDB — findAndModify upsert and unique index](https://www.mongodb.com/docs/manual/reference/method/db.collection.findAndModify/) — 同時の upsert と一意インデックス、サーバ側の再試行の条件
- [axios — Fetch adapter](https://axios-http.com/docs/req_config) — `adapter: 'fetch'` と `fetchOptions`
- `.claude/rules/model.md`、`.kiro/steering/tech.md`（Data Layer）— インデックスの作成は Mongoose が持つ
- `apps/app/src/server/service/import/non-transferable-collections.ts` — G2G の除外の基準

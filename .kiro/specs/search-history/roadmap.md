# Roadmap: search-history

検索履歴機能（保存・再検索・削除）を束ねるアンブレラ。

## Overview
GROWI の検索モーダル（`features/search/client/components/SearchModal.tsx`、Downshift ベース）で、ユーザーが実行した検索キーワードをユーザーごとに保存し、検索ボックスから過去の履歴を選んで再検索でき、不要な履歴を 1 件ずつ削除できるようにする。現状、検索履歴を保持する仕組みはどこにも無く、入力が空のときのドロップダウンには固定の「検索方法」項目しか出ない。

チケット単位（保存 → 再検索 → 削除）で spec を分け、この順に実装する。

## Approach Decision
- **Chosen**: サーバ保存＋クライアントからの明示記録。ユーザーごとの MongoDB コレクションを `features/search/server/` に新設し、apiv3 で記録・一覧・削除の API を提供する。記録はクライアントが「ユーザーが検索を実行した」時点（Enter による送信、検索方法メニュー項目の選択、履歴からの再検索）で POST する。保存するのは**ユーザーが入力した文字列**で、「子ページのみ検索」設定で自動付与される `prefix:<現在のページ>` は含めない（再検索時にはその時点の設定で改めて付与される）。
- **Why**: 履歴が端末をまたいでユーザーに付いてくる。記録点を「実行」に限るため、`/_search` 上のフィルタ・ソート操作（`useSetSearchKeyword(..., { replace: true })` による `?q=` 書き換え）やページ送りで履歴が膨らまない。検索 API に副作用を持ち込まずに済む。
- **Rejected alternatives**:
  - サーバ保存＋検索 API（`GET /_api/search`）側で自動記録 — 記録漏れは無いが、フィルタ・ソート・ページ送りの再リクエストを「実行」と区別する判定が必要になり、参照系 API に書き込みの副作用が入る。
  - ブラウザ localStorage — 最小規模だが、履歴が端末・ブラウザごとに分断され、共用端末ではログアウト後も残る。GROWI に localStorage でユーザーデータを持つ前例がほぼ無い。
  - 自動付与後の実際の送信クエリを保存 — 当時と同じ範囲で再検索できるが、ユーザーが入力していない文字列が履歴に並ぶ。

## Scope
- **In**: ログインユーザーごとの検索キーワード履歴の保存、検索モーダルでの履歴表示と選択による再検索、履歴の 1 件ずつの削除。
- **Out**: ゲスト（未ログイン）ユーザーの履歴、履歴の一括削除・全消去、履歴の端末間同期以外の共有（他ユーザー・管理者からの閲覧）、検索キーワードのサジェスト／オートコンプリート（履歴以外のソース）、検索演算子の解釈・変更（`search-filters` の領域）、`/_search` ページのフィルタパネル・チップ・ユーザー名タイプアヘッド。

## Constraints
- 既存の `search-filters` spec とは**別機能**として扱う。演算子トークン（`prefix:` / `tag:` / `author:` / `editor:` / `group:` など）は入力文字列の一部としてそのまま保存・再投入し、解釈・書き換えはしない。
- 新規コレクションのインデックス作成は Mongoose が持つ（Mongoose → Prisma 移行中のルール、`.claude/rules/model.md`）。データアクセスを Mongoose と Prisma のどちらで書くかは設計フェーズで決める。
- 検索は `loginRequired`（ゲスト許可）配下で、ゲスト閲覧が有効な環境では未ログインでも検索できる。履歴の記録・表示はログインユーザーに限る。
- 履歴はユーザー本人だけが読み書き・削除できる（他ユーザーの履歴 ID を指定した操作は拒否）。
- UI 文言は名前空間を明示する（`commons` など。既存の `SearchMethodMenuItem` は `commons` を使用）。
- TypeScript strict、Biome、Vitest（テスト co-located）。

## Boundary Strategy
- **Why this split**: チケット（#191670 / #191671 / #191672）とユーザーから見える価値の単位が一致する縦切り。保存はサーバのデータ契約（モデル・記録 API・一覧取得 API）と記録点の配線を一手に持ち、再検索と削除はその契約の上に UI と操作を足す形にする。
- **Shared seams to watch**:
  - **履歴のデータ契約**（`search-history-persistence` が所有）: 1 件の形（ID・キーワード・最終検索日時）、同一キーワードの重複時の扱い（最新へ繰り上げるか）、保持件数の上限、一覧の並び順。再検索・削除はこの契約を前提にする。
  - **記録点**（`search-history-persistence` が所有）: 「検索を実行した」とみなす箇所。`SearchModal` の送信処理（`onSearchOverride` 経由の `/_search` 上からの検索を含む）と、`SearchMethodMenuItem` の選択（`router.push` で `searchHandler` を経由しない）の両方を漏らさないこと。再検索（recall）もこの記録点を通して履歴を最新に繰り上げる。
  - **Downshift の項目モデル**（`search-history-recall` が所有）: 現状の `DownshiftItem = { url: string }` は URL 遷移のみを表す。履歴項目は「その文字列で検索を実行する」アクションで、URL 遷移で済ませると記録点を迂回する。項目モデルの拡張は recall が行い、delete はその上に削除操作を載せる。
  - **履歴一覧の表示**（`search-history-recall` が所有）: delete は recall が描く履歴一覧の各項目に削除操作を追加する。削除操作のクリック・キー操作が項目選択（再検索）と衝突しないこと。

## Specs (dependency order)
- [ ] search-history-persistence -- 検索実行時に入力キーワードをログインユーザーの検索履歴として保存する（#191670）。履歴モデル・記録 API・一覧取得 API と、クライアント側の記録点の配線を所有。Dependencies: none
- [ ] search-history-recall -- 検索ボックス（検索モーダル）に過去の検索履歴を表示し、選んで再検索できるようにする（#191671）。履歴一覧の表示と Downshift 項目モデルの拡張を所有。Dependencies: search-history-persistence
- [ ] search-history-delete -- 検索履歴の一覧から不要な履歴を 1 件ずつ削除できるようにする（#191672）。削除 API と、履歴一覧項目への削除操作の追加を所有。Dependencies: search-history-recall（履歴一覧の表示）、search-history-persistence（データ契約）

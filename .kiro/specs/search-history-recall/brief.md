# Brief: search-history-recall

チケット: #191671 / アンブレラ: [search-history](../search-history/roadmap.md)

## Problem
search-history-persistence で検索キーワードが保存されるようになっても、ユーザーがそれを呼び出す手段が無ければ、同じ検索のたびに入力し直す手間は変わらない。

## Current State
- 検索モーダル（`apps/app/src/features/search/client/components/SearchModal.tsx`）は Downshift で、入力欄（`SearchForm`）の下のメニューに `SearchMethodMenuItem` と `SearchResultMenuItem` を並べ、その下に `SearchHelp` を常に表示している。
- 入力が空のとき、メニューには固定の「検索方法」項目が 1 つ出るだけで、`SearchResultMenuItem` は何も出さない。
- Downshift の項目型は `DownshiftItem = { url: string }`（`features/search/client/interfaces/downshift.ts`）で、選択すると `router.push(item.url)` する。URL 遷移以外の項目は存在しない。
- 前提となる履歴の一覧取得 API と記録関数は search-history-persistence が提供する。

## Desired Outcome
- ログインユーザーが検索モーダルを開き、入力が空の状態のとき、自分の過去の検索履歴が新しい順にドロップダウンに表示される。
- 履歴項目はマウスでもキーボード（上下キー・Enter）でも選べる。既存項目と同じ Downshift の操作感に揃える。
- 履歴項目を選ぶと、そのキーワードで検索が実行される。Enter 送信と同じ経路を通るので、その時点の「子ページのみ検索」設定に応じた `prefix:` の付与や、`/_search` 上での `onSearchOverride` がそのまま効く。
- 再検索も「検索の実行」として記録され、その履歴は最新に繰り上がる。
- 履歴が 0 件のとき、またはゲストユーザーのときは、履歴セクションを出さず、現状と同じ表示になる。

## Approach
サーバ保存＋クライアントからの明示記録（アンブレラ roadmap の Approach Decision を参照）の上に UI を足す。
- 履歴の取得は SWR フックで行い、モーダルを開いたときに最新化する。
- Downshift の項目モデルを、URL 遷移に加えて「この文字列で検索を実行する」アクションも表せるように拡張する。履歴項目を `/_search?q=` への URL 遷移で済ませると、記録点と `prefix:` 付与を迂回するため避ける。
- 履歴項目の描画は、既存の `SearchMenuItem` 系のコンポーネントに合わせる。

## Scope
- **In**:
  - 検索モーダルのドロップダウンへの履歴セクション（空入力時の表示、表示件数、0 件・ゲスト時の非表示）
  - Downshift 項目モデルの拡張と、既存項目とのインデックス管理（`highlightedIndex` の整合）
  - 履歴項目の選択による再検索（Enter 送信と同じ実行経路）と、persistence の記録関数の呼び出し
  - 履歴取得の SWR フック
  - 文言の i18n（名前空間を明示）
- **Out**:
  - 履歴の保存・データ契約・一覧取得 API そのもの（search-history-persistence）
  - 履歴の削除操作（search-history-delete）
  - 入力中の文字列による履歴の絞り込み・サジェスト（必要なら要件フェーズで扱いを決める。初期スコープは空入力時の表示）
  - `/_search` ページのフィルタパネル・チップ・ユーザー名タイプアヘッド

## Boundary Candidates
- 履歴の取得と表示（SWR フック＋履歴セクションのコンポーネント）
- Downshift 項目モデルとメニュー内のインデックス管理
- 選択時の実行経路（`searchHandler` への合流）

## Out of Boundary
- 履歴の保存ルール（重複・上限・並び順の決定）
- 削除 UI と削除 API
- 検索演算子の解釈

## Upstream / Downstream
- **Upstream**: search-history-persistence（一覧取得 API、記録関数、履歴 1 件の型）、検索モーダル（`SearchModal` / `SearchForm` / `SearchMenuItem` 系 / `SearchHelp`）、Downshift
- **Downstream**: search-history-delete（この spec が描く履歴一覧の各項目に削除操作を追加する）

## Existing Spec Touchpoints
- **Extends**: なし
- **Adjacent**: `search-filters`（同じ検索ボックスを使う別機能。履歴のキーワードは演算子を含む文字列のまま再投入する）

## Constraints
- 既存の `SearchMethodMenuItem` / `SearchResultMenuItem` の挙動（項目の並び、`highlightedIndex` の起点）を壊さないこと。
- 履歴項目には一意の ID を持たせ、delete が同じ項目を特定できるようにする。
- 要件フェーズで決める未決事項: ドロップダウンに出す件数、履歴セクションと「検索方法」項目の上下関係、入力ありのときに履歴を出すか。

# Implementation Plan — chat-integration-link-privacy

> amend spec: umbrella spec [chat-integration](../chat-integration/) の要件6（GROWI の URL の展開）に
> 受け入れ条件6.6〜6.8を追加する。設計・実装は sub-spec [chat-integration-app](../chat-integration-app/)
> （`apps/app/src/features/chat-integration/`）に属する。既存の受け入れ条件6.1〜6.5は変更しない。

**変更範囲は `chat-integration-app` の2ファイルに閉じる**（`command-endpoint.ts`・`content/link-preview-mapper.ts`）。
`@growi/chat`（chat-integration-protocol）・`chat-integration-proxy` は変更しない（design.md 参照）。

---

- [ ] 1. 固定リンクの応答を、契約を変えずに閉じる
- [x] 1.1 resolvePageFromUrl が固定リンクかどうかを判定結果に含めて返す
  - 既存の24桁16進判定（`PAGE_ID_PATTERN`）をそのまま使い、返り値に `isPermalink` を追加する
  - 見つからない場合も `isPermalink` を含んだ結果を返す（トップレベルの `null` は不正なURL、つまり pathname を取り出せなかったときだけ）
  - 固定リンクの解決結果に `isPermalink: true` が含まれ、パス形式の解決結果には `isPermalink: false` が含まれることが試験で示される
  - _Requirements: 6.6, 6.8_
  - _Boundary: resolvePageFromUrl_

- [x] 1.2 buildLinkPreview が固定リンクの非公開・見つからない場合に固定文言を返す
  - `PERMALINK_UNAVAILABLE_MESSAGE`（`'This page does not exist, or is not visible to everyone.'`）定数を追加する
  - 固定リンクで非公開、または固定リンクで見つからない場合は、どちらもこの定数を `path` に入れて返す（`excerpt`/`updatedAt`/`commentCount` は含めない）
  - パス形式URLで見つからない場合は今までどおり `null` を返す（変更しない）
  - 固定リンクで「見つからない」場合と「見つかったが非公開」場合の返り値が、完全に同じオブジェクトになることが試験で示される
  - パス形式URLの既存8件の試験（`content/link-preview-mapper.spec.ts`）が無変更のまま通ることが確認できる
  - _Requirements: 6.6, 6.7, 6.8_
  - _Depends: 1.1_
  - _Boundary: buildLinkPreview_

- [x] 2. handleLinkPreview を新しい buildLinkPreview の呼び方に合わせる
  - `resolvePageFromUrl` の返り値（`ResolvedUrlTarget`）をそのまま `buildLinkPreview` へ渡す形にする。`buildLinkPreview` が `null` を返したときだけ `errorResponse('invalid')` にする
  - 固定リンクで存在しないIDを渡した場合と、固定リンクで存在するが非公開のページを渡した場合の応答が、コマンド処理を通しても完全に同じ形になることが試験で示される（要件6.8の核心）
  - 固定リンクで公開ページを渡した場合、実在パスを含む全文サマリが返ることが試験で示される
  - `command-endpoint.spec.ts` の Requirement 6 describe ブロック内の既存3件（公開／非公開／パス形式で見つからない）が無変更のまま通ることが確認できる（同ファイルの他ブロックにある別の link-preview 関連テストは対象外）
  - _Requirements: 6.6, 6.7, 6.8_
  - _Depends: 1.1, 1.2_
  - _Boundary: handleLinkPreview_

- [ ] 3. 変更を chat-integration と chat-integration-app へ畳み込み、本 spec を削除する
- [x] 3.1 (P) chat-integration の requirements.md に受け入れ条件6.6〜6.8を追記する
  - 既存の6.1〜6.5は番号を振り直さず、末尾に追記する
  - `chat-integration/requirements.md` の要件6に6.6〜6.8が本 spec と同じ文言で並び、6.1〜6.5の番号と本文が無変更であることが差分で確認できる
  - _Requirements: 6.6, 6.7, 6.8_
  - _Boundary: chat-integration/requirements.md_

- [x] 3.2 (P) research.md の Design Decisions 2件を chat-integration-app の research.md へ移す
  - chat-integration-app には現在 research.md が存在しないため、新規作成になる
  - `chat-integration-app/research.md` に Design Decisions 2件（固定文言の採用、既存の「黙って何も投稿しない」を変える判断）が入っていることが確認できる
  - _Requirements: 6.6, 6.7, 6.8_
  - _Boundary: chat-integration-app/research.md_

- [x] 3.3 chat-integration-app の design.md へ、本 spec の設計判断・インターフェイス・図を反映する
  - 固定リンク分岐の設計判断・`ResolvedUrlTarget`/`buildLinkPreview` の契約・System Flow の図を統合する
  - 本 spec の Revalidation Triggers 3件のうち、1件目（`CommandResponse` に `notFound` 相当のフィールドが追加された場合）と2件目（`PAGE_ID_PATTERN` の意味が変わった場合）は chat-integration-app の design.md の Revalidation Triggers へ移す
  - 3件目（固定リンクが見つからない場合も表示が付くことを理由に、proxy 側で「黙って何も投稿しない」判定を復活させる提案が来たら差し戻すこと）は、chat-integration-app の design.md に「proxy にまたがる制約」と明記して残す
  - `chat-integration-app/design.md` に固定リンク分岐の設計判断・契約・図が入っていることが確認できる
  - _Requirements: 6.6, 6.7, 6.8_
  - _Depends: 2_

- [x] 3.4 畳み込み先2つの spec.json の updated_at を更新する
  - `chat-integration/spec.json`（requirements.md を変更したため）と `chat-integration-app/spec.json`（design.md を変更したため）の両方を更新する。`phase` と `approvals` は変更しない
  - 2ファイルの `updated_at` が畳み込み日に変わっており、`phase`/`approvals` は差分に出ないことが確認できる
  - _Requirements: 6.6, 6.7, 6.8_
  - _Depends: 3.1, 3.3_

- [ ] 3.5 (P) この spec を名前で参照している箇所をすべて始末する
  - `chat-integration/roadmap.md` の Sub-specs 表からこの spec の行を削除する
  - 同ファイル Backlog（対話的な確認フローの項）にある本 spec 名への言及2箇所を、畳み込み先（`chat-integration` 要件6.6〜6.8）を指す書き方に直す
  - `chat-integration-app/tasks.md`（Implementation Notes 内、`../chat-integration-link-privacy/` へのリンク）を、畳み込み先を指す記述に差し替える
  - リポジトリ全体を `chat-integration-link-privacy` で検索して、ヒットが0件になることが確認できる
  - _Requirements: 6.6, 6.7, 6.8_
  - _Boundary: chat-integration/roadmap.md, chat-integration-app/tasks.md_

- [ ] 3.6 .kiro/specs/chat-integration-link-privacy/ を削除する
  - ディレクトリが存在しないことが確認できる
  - _Requirements: 6.6, 6.7, 6.8_
  - _Depends: 3.1, 3.2, 3.3, 3.4, 3.5_

---

## Implementation Notes

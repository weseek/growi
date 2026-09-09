# Research & Design Decisions

## Summary
- **Feature**: `chat-integration-link-privacy`
- **Discovery Scope**: Extension（既存の `chat-integration-app` の URL 展開機能への修正）
- **Key Findings**:
  - `@growi/chat` の `CommandResponse`（`link-preview` kind）は `path: string` を必須フィールドとして既に持っており、`chat-integration-proxy` の `previewMarkdown` はこの値を無条件に描画へ使っている。**この2つに手を入れなくても、`path` へ何の文字列を入れるかだけで要件6.6・6.8を満たせる**——`chat-integration-protocol`・`chat-integration-proxy` は変更不要と判明した
  - existence-oracle は「応答の `kind` 自体が違う」ことがそもそもの原因（見つからない場合は `kind: 'error'`、見つかったが非公開の場合は `kind: 'link-preview'`）。`path` の中身をどう変えても `kind` が違えば oracle は閉じない——固定リンクが見つからない場合の応答 kind 自体を `link-preview`（`restricted: true`）に揃える必要がある
  - 現在の実装は、固定リンクかパス形式かを `PAGE_ID_PATTERN`（24桁16進文字列）で判定し、そのままクエリの絞り込み条件（`_id` か `path` か）に使っている。この判定結果を、応答内容を決める段まで運ぶだけで済む

## Research Log

### 既存実装の読み解き
- **Context**: `resolvePageFromUrl`（`command-endpoint.ts`）と `buildLinkPreview`（`link-preview-mapper.ts`）の現在の分担を確認
- **Sources Consulted**: `apps/app/src/features/chat-integration/server/command/command-endpoint.ts`、`.../content/link-preview-mapper.ts`、`.../content/public-page-filter.ts`、両者の既存 `.spec.ts`
- **Findings**:
  - `resolvePageFromUrl` は URL の `pathname` から末尾セグメントを取り出し、24桁16進文字列なら `_id` で、そうでなければ `path` で `Page.findOne` する。見つからなければ `null` を返す（区別する情報を残していない）
  - `handleLinkPreview` は `page == null` を一律 `errorResponse('invalid')` に落としている
  - `buildLinkPreview(page, isGuestAllowedToRead)` は非公開ページ判定（`isPubliclyReadablePage(page) && isGuestAllowedToRead`）が偽なら `{ path: page.path, restricted: true }` を返す——固定リンクかどうかを一切見ていないため、`page.path`（実在パス）がそのまま漏れる
- **Implications**: 直すべきは「固定リンクかどうか」の情報が `resolvePageFromUrl` から先へ運ばれていないことと、「見つからない」の扱いが `restricted:true` の応答と別の kind になっていること。どちらも `chat-integration-app` 内で完結する

### `@growi/chat` の契約と `chat-integration-proxy` の描画
- **Context**: `path` を実在パス以外の文字列にした場合、契約や proxy 側の描画が壊れないか確認
- **Sources Consulted**: `packages/chat/src/contract/command.ts`、`apps/chat-integration-proxy/src/orchestration/command-flow.ts`（`previewMarkdown`）
- **Findings**:
  - `CommandResponse`（`link-preview` kind）の `path` は必須の `string` 型。中身の書式（先頭 `/` の有無や実在性）を検査するランタイムの parser は無い（`packages/chat/src/parse/parse-responses.ts` に `link-preview` 用の parser は存在しない）
  - `previewMarkdown` は `restricted` の真偽だけで分岐し、どちらの分岐でも `` `${growiLabel}: ${response.path}` `` を組み立てるだけ。`path` に何の文字列が入っていても壊れない
- **Implications**: `path` に「URL から読み取れた元の pathname」（実在パスではない値になりうる）を入れても、契約・proxy のどちらも変更不要。**本 amend は `chat-integration-app` のみで閉じる**

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A. `path` フィールドへ「元の pathname」を流用 | 固定リンク・非公開時／固定リンク・見つからない時のどちらも、応答の `path` に「URL から読み取った pathname」（実在パスとは限らない文字列）を入れる | 契約・proxy 変更ゼロ。判定ロジックが `resolvePageFromUrl` と `buildLinkPreview` の2ファイルに閉じる。パス形式 URL の既存挙動は無変更（`pathname === page.path` であるため） | `path` という名前のフィールドに「パスでない値（IDそのもの）」が入りうる——命名と実態がわずかにずれる | **採用** |
| B. 契約に `path?: string`（省略可）を追加し、無いときは proxy 側で行を省く | 「情報が無いことを持たない」という表現ができ、フィールド名の意味がぶれない | `@growi/chat`・`chat-integration-proxy` 双方の変更が要り、両方とも `/kiro-validate-impl` 済みの sub-spec の再検証が要る。範囲がこの amend の目的（要件6.1/6.3のギャップ）を超えて広がる | 却下 |
| C. 固定リンクは常に `errorResponse('invalid')` に倒し、`link-preview` を返さない | 実装が最も単純 | 固定リンクで非公開ページを開いた場合と「そもそも固定リンク機能を使うな」という区別が付かず、要件6.1（固定リンクも展開対象である）と矛盾する | 却下 |

## Design Decisions

### Decision: 固定リンクの `restricted: true` 応答は「実在パス」ではなく「URL から読み取った pathname」を `path` に入れる
- **Context**: 要件6.6（固定リンク・非公開ならパスを含めない）と要件6.8（固定リンクが見つからない場合と区別できない応答にする）を、契約変更なしで満たす必要がある
- **Alternatives Considered**: 上表オプション B・C
- **Selected Approach**: `resolvePageFromUrl` が返す情報に「URL から読み取った pathname（固定リンクの ID を含む）」と「固定リンクかどうか」を追加する。`buildLinkPreview` は、非公開（または見つからない）と判定したとき、実在パスの代わりにこの pathname を使う
- **Rationale**: 投稿者は URL という形でこの pathname を既に知っている（固定リンクの ID そのものが URL の一部として貼られている）ため、これをそのまま返しても新しい情報の開示にはならない。パス形式 URL では `pathname === page.path` なので、既存の6.3の挙動は文字どおり無変更のまま保たれる
- **Trade-offs**: `path` フィールドの意味が「実在パス」から「表示してよい範囲の位置情報」へわずかに広がる。ただし外部から見た応答の形は変わらないため、`chat-integration-protocol`・`chat-integration-proxy` の再検証は不要
- **Follow-up**: 実装時、`link-preview-mapper.ts` の該当コメントで「`path` は実在パスとは限らない」ことを明記すること

### Decision: 「見つからない」と「見つかったが非公開」の応答は、固定リンクのときだけ統合する。パス形式 URL では現状のまま
- **Context**: existence-oracle を塞ぐ範囲をどこまで広げるか
- **Alternatives Considered**: パス形式 URL でも同様に統合する案
- **Selected Approach**: 固定リンクのときだけ、`kind: 'error'`（`code: 'invalid'`）ではなく `kind: 'link-preview', restricted: true, path: <元の pathname>` を返すようにする。パス形式 URL で見つからない場合は現状どおり `errorResponse('invalid')` のまま
- **Rationale**: パス形式 URL は投稿者自身が入力した文字列についての存在確認であり、本 amend が対象とする「投稿者の知らない情報が新たに漏れる」問題とは性質が異なる（要件フェーズで確定済み、requirements.md の Boundary Context 参照）
- **Trade-offs**: existence-oracle は固定リンクについてのみ閉じ、パス形式 URL の探索余地は残る。ただし探索にはパスの推測が要り、本リポジトリの既存方針（`apps/app/.claude/rules/page-write-action-403-404.md` の「pageId 経路のほうが優先度が高い」という判断）と整合する
- **Follow-up**: なし

## Risks & Mitigations
- **`path` フィールドの意味が広がることに対する将来の実装者の誤解** — 実装時にコメントで明記する（上記 Follow-up）ことで軽減
- **固定リンクの判定（`PAGE_ID_PATTERN`）に依存する設計であること** — 既存のクエリ分岐が使っている判定をそのまま再利用するだけなので、新たなリスクではない

## References
- `apps/app/.claude/rules/page-write-action-403-404.md` — 「存在確認への悪用」を GROWI 側で既に扱っている類似ルール。既定は区別しない応答、ただし完全に塞ぐことはできない場合があるという整理の前例

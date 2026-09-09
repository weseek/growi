# Requirements Document

## Project Description (Input)

**Amend target**: umbrella spec `chat-integration` の requirements.md 要件6（GROWI の URL の展開）、特に受け入れ条件 6.1・6.3。対応する設計・実装は sub-spec `chat-integration-app`（`command-endpoint.ts` の `resolvePageFromUrl`、`link-preview-mapper.ts` の `buildLinkPreview`）にある。`chat-integration` は `phase: umbrella-active` で requirements/design/tasks すべて承認済みのため、直接編集せず本 amend spec で扱う。

### 誰が困っているか

GROWI のページを閲覧する権限を持たない、チャットチャンネルの参加者（投稿者本人を含む）が、意図せずそのページの実在するパス（意味のある文字列）を知ってしまう。あるいは、権限を持たない投稿者が、存在しない ID と「存在するが非公開」の ID を応答の違いから見分けられてしまう。

### 今どうなっているか

chat-integration の要件6.1は「利用者が GROWI のページ URL をチャンネルに投稿した」ときページのパスを含む要約を添えることを求め、6.3は「対象のページが誰でも閲覧できるわけではないページである」ときは「要約にパス以外の内容を含めない」（＝パスは出す）ことを求めている。

この2つの受け入れ条件は「URL を貼った人は既にそのページのパスを知っている」という書かれていない前提の上に成り立っている。通常のパス形式 URL（例: `https://growi.example.com/hr/salaries/tanaka`）ではこの前提は常に成り立つ——投稿者は URL 文字列としてパスを既に知っており、応答がそれをそのまま返しても新しい情報の漏えいにはならない。

しかし GROWI は ObjectId 形式の固定リンク（例: `https://growi.example.com/60f1a2b3c4d5e6f7a8b9c0d1`）も同じページを指す有効な URL として扱う。固定リンクの場合、投稿者が知っているのは ID だけで、ページの実際のパスは知らない。それにもかかわらず要件6.3どおりの実装（`chat-integration-app` の `buildLinkPreview`）は、非公開ページであっても常に `path` を応答に含める——固定リンクを貼っただけの投稿者と、そのチャンネルの全参加者に、権限のない非公開ページの実在するパスを開示してしまう。

さらに、この経路（`resolvePageFromUrl`）はページの取得に一切の閲覧権限フィルタを掛けていない（`Page.findOne({ _id: maybeId })` を絞り込みなしで実行）。存在しない ID には `errorResponse('invalid')` が、存在するが非公開の ID にはパス付きの正常応答が返るため、この2種類の応答の違いだけで、権限のない投稿者が特定の ID が実在するかどうかを1件ずつ探ることができる（existence-oracle）。

これは `chat-integration-app` の実装バグではなく、要件6.1/6.3自体が固定リンクのケースを考慮していないことに起因する——sub-spec 側の feature-level validation（`/kiro-validate-impl`）で発見され、要件の側で決着させるべき問題として本 amend spec に切り出された。

### 何を変えるか（たたき台。要件フェーズで精査すること）

1. 固定リンク（ObjectId 形式の URL）で解決したページが非公開のとき、要約からパスを除く——少なくとも、投稿者が URL という形で既に知っている情報を超える内容を応答に含めない。
2. 「存在しない ID」と「存在するが非公開の ID」を、応答の観測可能な違い（種類・有無を問わず）から見分けられないようにする。
3. 通常のパス形式 URL については現状の挙動（要件6.3どおりパスを含める）を維持してよい——投稿者は既にそのパスを知っているため、これは新たな情報の漏えいにならない。

### 前提

- Gen 1（`apps/slackbot-proxy`、`packages/slack`）には手を入れない。本 amend の影響範囲は Gen 2（chat-integration ファミリー）のみ。
- `chat-integration-protocol`（`packages/chat`）・`chat-integration-proxy` への影響は未調査。`LinkPreviewResult`（`path`, `restricted`, `excerpt`, `updatedAt`, `commentCount`）の契約自体を変える必要があるかどうかは要件フェーズで判断する。

### まだ決めていないこと

- 固定リンクかどうかの判定と、パスを含めるかどうかの分岐をどの層に置くか（`chat-integration-app` 側の `resolvePageFromUrl`/`buildLinkPreview` に閉じるか、`@growi/chat` の契約自体に「固定リンク由来かどうか」のフラグを足すか）。
- existence-oracle を塞ぐ具体的な応答形——「存在しない」と「存在するが非公開」を同じ応答（例: 両方とも `restricted` 相当の1種類）に統合するか、両方とも一律で「何も添えない」（要件6.4に倣う）にするか。
- 通常のパス形式 URL で、そのパスが実在しない場合の応答も同様に扱うべきか（今回の変更範囲に含めるか、別問題として扱うか）。

## Requirements
<!-- Will be generated in /kiro-spec-requirements phase -->

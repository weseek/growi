# Research & Design Decisions

## Summary
- **Feature**: `inline-comment-edit-delete`
- **Discovery Scope**: Extension（既存の `inline-comment` フィーチャー、および既存の通常コメント編集・削除の仕組みを手本にする）
- **Key Findings**:
  - 通常コメントの編集・削除（`comments.update`／`comments.remove`、apiv1）と、インラインコメントの既存ルート群（`create`／`create-reply`／`list`／`resolve`、apiv3）は構造的に近く、新しい更新・削除ルートは *インラインコメント側の既存の apiv3 の作法* に従いつつ、権限判定の *ルール自体*（投稿者本人限定）とカスケード削除の *部品*（`prisma.comments.removeWithReplies`）は通常コメント側からそのまま流用できる。
  - `creatorId`（ただの文字列）は、どのエンドポイントが生成したオブジェクトであっても必ず入っている、投稿者を特定できる唯一のフィールドである。`creator`（populatedなユーザーオブジェクト）は `listByPageId()` の出力以外では `null` になる。権限判定（クライアント側の表示切り替えであれ、サーバー側の認可であれ）は必ず `creatorId` で比較し、`creator` では絶対に比較しない。
  - `prisma.comments.removeWithReplies(id)`（現在は通常コメントの削除だけが使っている）には `isInline` によるフィルタが一切なく、共有テーブル `comments` の任意の行を `id`／`replyToId` だけで操作する。したがって、起点インラインコメントとその返信の削除にそのまま流用できる。
  - `InlineCommentItem.tsx` にも `InlineCommentReplies.tsx` にも、現状リードオンリー利用者向けのガードユーティリティは一切importされていない — 新しい編集・削除操作のために `NotAvailableIfReadOnlyUserNotAllowedToComment` を新規に組み込む必要がある（既存の解決トグルには、本スペックの影響が及ばないため手を入れない）。

## Research Log

### 通常コメントの編集・削除の仕組み（真似る対象であり、そのまま使い回す対象ではない）
- **Context**: Requirement 3 が、通常コメントとまったく同じ権限モデルを求めている。
- **Sources Consulted**: `Comment.tsx`、`CommentControl.tsx`、`CommentEditor.tsx`、`DeleteCommentModal`／`DeleteCommentModalSubstance`、`PageComment.tsx`、`stores/comment.tsx`、`apps/app/src/server/routes/comment.js`。
- **Findings**:
  - 編集: `Comment.tsx` の `isReEdit` state が `CommentCard` を `CommentEditor` に切り替える（初期値は `codeMirrorEditor.initDoc(commentBody)` 経由）。送信は `updateComment(comment, revisionId, commentId)` → `apiPost('/comments.update', { commentForm: { comment, revision_id, comment_id } })`（apiv1）。
  - 削除: `CommentControl` の削除ボタン → `PageComment.tsx` が持つモーダルstate → `DeleteCommentModal`／`DeleteCommentModalSubstance`（コンテナ／中身に分離。確認画面では投稿者・日時・本文の抜粋400文字を表示する） → 確認で `apiPost('/comments.remove', { comment_id })`（apiv1）。
  - サーバー: どちらのルートも `prisma.comments.findUnique` → 未発見チェック → `Page.isAccessiblePageByViewer` → **投稿者本人チェック**（`req.user._id.toString() !== comment.creatorId.toString()` なら拒否）という順で処理する。更新は `{ comment, revision: {connect} }` を書き込み、削除は `removeWithReplies(commentId)` を呼ぶ（トランザクション内で `replyToId: commentId` の行をすべて削除してから本体を削除）。
  - どちらも apiv1 のプレーンな `Error` ベースのレスポンス（`ApiResponse.error`）を使っており、apiv3 の `ErrorV3`／`res.apiv3Err` とは違う作法である。
- **Implications**: *権限のルール*（投稿者本人限定、`creatorId` 比較、サーバー側が最終判断）と *カスケード削除の部品*（`removeWithReplies`）はそのまま持ってこられる。*通信の作法* は持ってこない — インラインコメント自身の既存ルートはすべて apiv3（`create.ts`／`create-reply.ts`／`list.ts`／`resolve.ts`）なので、新しい更新・削除ルートも apiv1 風のペアを別に持ち込むのではなく、この既存の apiv3 の作法（ファクトリ関数、`ErrorV3`、`res.apiv3Err`／`res.apiv3`）に従う。

### インラインコメントの既存のサーバー側の形（拡張する対象・衝突していないことの確認）
- **Context**: 更新・削除の仕組みがすでに存在していないか、あるいは衝突する既存実装がないかを確認する。
- **Sources Consulted**: `apps/app/src/features/inline-comment/server/routes/*.ts`、`inline-comment-service.ts`、`interfaces/dto/*.ts`、`interfaces/index.ts`、`apps/app/src/interfaces/activity.ts`。
- **Findings**:
  - `InlineComment`／`InlineCommentReply` は、通常コメントと*同じ* Prisma `comments` モデルの行であり、`isInline: true`（両方）と `replyToId`（起点は `null`、返信は値あり）で区別される。`resolve.ts`／`setResolved()` が、従うべきルート・サービスのパターンをすでに確立している：ルートは最初に `findUnique` を行い（404／400／権限判定に必要な最小限のフィールドだけ選択）、`findPageAndMetaDataByViewer` によるページ閲覧権限チェックを行い、このエンドポイントにとって形状が違う（起点／返信の取り違え）場合は400の `ErrorV3` を返し、その後サービスメソッドに処理を委ねる。サービス側は同じ前提条件を*再度検証*してから（多層防御）更新を行い、`prisma.activities.createByParameters` 経由でActivityを発行する（`addActivity` ミドルウェアは使わない。他3ルートと同じ既定の例外）。
  - 更新・削除のルート／サービスメソッド／DTOは現状まったく存在しない（ディレクトリ一覧で確認済み）— これは休眠中のコードではなく、正真正銘の新規能力である。
  - `IInlineComment` には `replyToId` フィールドが一切ない（値がnullなのではなく、構造的に存在しない）。`InlineCommentReply` には `anchor`／`resolvedAt`／`resolvedById` フィールドが一切ない（こちらも元スペックの要件1.9通り、構造的に存在しない）。`creator` は `listByPageId()` 以外のすべての生成元で `null` になる。
  - Activityアクションは `apps/app/src/interfaces/activity.ts` 内のフラットな文字列定数の並び（`ACTION_INLINE_COMMENT_CREATE`、`_REPLY`、`_RESOLVE`、`_UNRESOLVE`）になっており、これらを個別に参照する別のi18n／ラベル登録簿はどこにも存在しない — 新しいアクションを足すのは定数＋配列エクスポートの2行だけの変更で、他に更新すべきファイルはない。

### 解決済みコメントのハイライト・ポップオーバーの可視性（Requirement 4/5）
- **Context**: Requirement 4 は、解決済みコメントの本文中ハイライトを消しつつ一覧には残す必要がある。Requirement 5 は、開いたままのポップオーバーが解決すると閉じる必要があり、状態バッジも不要になる。
- **Sources Consulted**: `PageView.tsx`（`inlineCommentAnchors` の useMemo）、`InlineCommentBodyInteraction.tsx`、`InlineCommentPreviewPopover.tsx`（`inline-comment-popover-refinement` 適用後の現状）。
- **Findings**: `inlineCommentAnchors` は `inlineComments` に対する単純な `.map()` 1つだけで組み立てられており、状態によるフィルタは一切ない — これが、下流のすべての消費者（`useAnchorResolver` → `resolvedInlineCommentRanges` → `InlineCommentHighlight` → `InlineCommentBodyInteraction` の当たり判定）が読み取る唯一の絞り込みポイントである。この1箇所（`.map()`の前）で解決済みコメントを除外すれば、ハイライト・当たり判定・ポップオーバーのパイプライン*全体*から無料でまとめて除外できる — 下流のどのファイルも、自前の解決状態チェックを持つ必要がない。
- **Implications**: `PageView.tsx` の `inlineCommentAnchors` に、既存の `.map()` の前に `.filter((c) => c.resolvedAt == null)` を1つ加える（あるいは1回の呼び出しにまとめる）。`InlineCommentBodyInteraction` の `displayedId` は、すでにこの*同じ* `inlineComments` prop によって駆動されているため、対象コメントが解決した時点でポップオーバーを閉じる（Requirement 5.1）のは、「次の描画で `inlineComments` にそのidが含まれなくなる」ことの自然な帰結になる — 詳しい仕組みは下のDesign Decisionを参照（消えたことを検知する仕組みを新たに監視するのではなく、消えた結果に反応させる）。

## Design Decisions

### Decision: 「解決済みはハイライトしない」を、パイプラインの奥ではなくアンカー一覧そのものでフィルタする
- **Context**: 「解決済みコメントにはハイライトを付けない」をどこで実装するか？
- **Alternatives Considered**:
  1. 各消費者（`InlineCommentHighlight`、`InlineCommentBodyInteraction`）がそれぞれ独立にフィルタする。
  2. `PageView.tsx` の `inlineCommentAnchors`（すべての消費者が間接的に — `resolvedRanges` を介して — 読み取っている唯一の起点）で一度だけフィルタする。
- **Selected Approach**: (2)。
- **Rationale**: `resolvedRanges`（`useAnchorResolver` の出力）は、すでに `InlineCommentHighlight` と `InlineCommentBodyInteraction` の両方が消費している唯一の絞り込みポイントである — 解決済みコメントはそもそも `Range` が計算されないだけなので、両方の消費者は解決状態を自分で意識する必要が一切なくなる。これは `.claude/rules/coding-style.md` がすでに述べている「単一の情報源を持ち、消費者ごとに個別分岐しない」という原則と同じである。
- **Trade-offs**: 特になし。
- **Follow-up**: なし。

### Decision: ポップオーバーは `resolvedAt` を直接監視するのではなく、`inlineComments` からコメントが消えた次の描画で閉じる
- **Context**: Requirement 5.1 — ポップオーバーを開いたまま、そのコメントが（ポップオーバー自身の操作からでも、別タブ／別ウィンドウの一覧からの再取得前でも）解決された場合、ポップオーバーを閉じる必要がある。
- **Alternatives Considered**:
  1. `InlineCommentBodyInteraction` に、`comment?.resolvedAt` を監視して非nullに変わったら `handleClose()` を呼ぶ、明示的な `useEffect` を追加する。
  2. すでにある「`comment == null` ならなにも描画しない」というガード（再アンカリング失敗のケース、要件2.6ですでに使われている）に任せる。`InlineCommentBodyInteraction` はidで `inlineComments` を検索しているため、フィルタ後は解決済みコメントもこのガードに引っかかって自然に対象外になる。
- **Selected Approach**: (2)。ただし1点補足する: 表示中のidに対応するコメントが `inlineComments` から消えて `comment` が `null` になった時点で、`pinnedId`／`hoverPreviewId` もあわせてクリアする必要がある。そうしないと、消えたidを指したままのstateが残ってしまう（同じidが二度と現れなくなる以上実害はないが、`handleClose` がすでに保っている「`pinnedId` は表示中のコメントが存在することを含意する」という不変条件を、この経路でも保つため）。
- **Rationale**: `InlineCommentBodyInteraction` はすでに `inlineComments.find((c) => c.id === displayedId)` を行い、一致しなければ `null` を返している — これは要件2.6（再アンカリング失敗）がすでに使っている、まさにその仕組みである。要件5.1は構造的に同じ形（「このポップオーバーが表示していたidは、もうポップオーバー資格を持つ集合の中にいない」）であり、新しい監視effectを足す必要がない。
- **Trade-offs**: コメントがこの経路で単に消えた場合、ポップオーバー自身の `onClose`／`suppressedHit` の後始末は走らない（`handleClose` を経由したときだけ走る）— 問題ない。解決済みである限り当たり判定がそのidを二度と報告しないため、抑制すべきものが残らないため。
- **Follow-up**: `displayedId` のコメントがまだ存在するかどうかをキーにした小さなeffectで `pinnedId`／`hoverPreviewId` をクリアする（既存のnullガードと同じ考え方）。

### Decision: 更新・削除は操作ごとに1つの共有サービスメソッドとし、起点／返信で重複実装しない
- **Context**: 更新・削除は起点コメント・返信の両方に必要で、下回りのPrisma操作（`comment` フィールドの更新／行の削除）はどちらでもまったく同じだが、既存の慣習（`create.ts` と `create-reply.ts` の分離）に合わせると*ルート・DTOの形*は起点と返信で分ける方が筋が良い。
- **Alternatives Considered**:
  1. 「インラインコメントらしき任意の行を更新する」単一のルート・サービスメソッドにまとめ、レスポンスを判別可能なunion型にする。
  2. 操作ごとに起点用・返信用の2ルート・2DTOに分ける（`create`／`create-reply` の分離にならう）。共通のPrisma操作・Activity発行は、サービス内部の共有ヘルパーとして重複を避ける。
- **Selected Approach**: (2)。
- **Rationale**: `create.ts`／`create-reply.ts` がすでに「コメントの種類ごとに1ルート」という、この機能の慣習を確立している。判別可能なunionレスポンスは、この機能の中で最初にその慣習から外れることになるうえ、得られる利益がない（`{inlineComment}` と `{inlineCommentReply}` という2つのレスポンス形は、すでに別々のDTOとして存在している）。実際に重複を避けるべき箇所（Prisma呼び出しの形、Activity発行）は、共有の内部ヘルパーが担うべき仕事であり、公開されるルート・サービスの表面がそれを担うべきではない。
- **Trade-offs**: 操作ごとに2ファイルではなく4ファイルの新規ルートになるが、既存の「コメントの種類ごとに1ファイル」というパターン（`.claude/rules/coding-style.md` の「小さいファイルを多数」）に沿っている。
- **Follow-up**: なし。

### Decision: 編集モードには、新しい編集専用コンポーネントではなく、任意の初期値propを足した `MentionAwareCommentInput` を再利用する
- **Context**: Requirement 1.2 は、一覧側の編集フローとポップオーバー側の編集フローの両方で、現在の本文をあらかじめ入力欄に入れておく必要がある。
- **Alternatives Considered**:
  1. 編集専用の新しい入力コンポーネントを作る。
  2. `MentionAwareCommentInput` に任意の `initialValue` prop を足す（マウント時に一度だけ `codeMirrorEditor.initDoc(initialValue)` を適用する）。呼び出し側は `onSubmit` を、文脈に応じて `create` にも `update` にも配線できるようにする — コンポーネント自身はどちらなのかを知る必要がない。
- **Selected Approach**: (2)。
- **Rationale**: `MentionAwareCommentInput` はもともと永続化への依存を持たず（`onSubmit` は呼び出し側が注入する）— これはまさに「作成か編集か」の分岐が本来あるべき継ぎ目である（コンポーネント内部ではなく呼び出し側が決める）。これを再利用することで、作成時と編集時のメンション対応の編集体験（CodeMirror、メンション補完）が完全に一致し、見た目をあわせて保守すべき新規コンポーネントも増えない。
- **Trade-offs**: 編集モード用の新しい `editorKey` は、コメントidごとに区別できる値（例: `inline_comment_edit_${commentId}`）にする必要がある。そうしないと、あるコメントの編集がページの「新規コメント」用エディタや、別のコメントの編集セッションとCodeMirrorのstateを共有してしまう。
- **Follow-up**: なし。

## Risks & Mitigations
- Risk: クライアント側の `creatorId === currentUser._id` チェックはそれ自体では認可の境界にならない（クライアント側のstateは古い可能性・偽装される可能性がある）。— Mitigation: `comments.update`／`comments.remove` とまったく同じく、サーバー側のルート・サービスが変更前に投稿者本人であることを独立に再検証する。クライアント側のチェックはどのボタンを表示するかだけを決める。
- Risk: 返信を持つ起点コメントを削除したときに、返信行が孤立して残ってしまう。— Mitigation: すでにトランザクション化され、通常コメントの削除で実績のある `removeWithReplies` をそのまま再利用する。
- Risk: `MentionAwareCommentInput` に新しい `initialValue` prop を足すことが、既存の「新規コメント」呼び出し元に対して純粋な追加にならず退行を生む可能性。— Mitigation: 既定値を `undefined`／空にし、既存の呼び出し元（`InlineCommentForm`、`InlineCommentReplies` の返信入力欄）に影響が出ないようにする。「`initialValue` を渡さない場合は現状と変わらない」ことを確認する退行テストでカバーする。

## References
- `.kiro/specs/inline-comment/requirements.md`、`design.md` — amend対象（Non-Goals、Requirement 2、Requirement 15）。
- `apps/app/src/server/routes/comment.js` — 通常コメントの更新・削除ルート（パターン参照のみ。直接再利用はしない）。

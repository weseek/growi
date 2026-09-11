# Research & Design Decisions

## Summary
- **Feature**: `inline-comment-readonly-restriction`
- **Discovery Scope**: Extension（Light Discovery）
- **Key Findings**:
  - サーバー側：`create.ts`／`create-reply.ts`／`resolve.ts`はいずれも`update.ts`と同じミドルウェア構成規約（`accessTokenParser` → `loginRequired` → validator → `apiV3FormValidator`）に従っており、`excludeReadOnlyUserIfCommentNotAllowed`を`loginRequired`の直後に挿入するだけで既存パターンをそのまま複製できる
  - クライアント側：作成トリガー（`SelectionActionButton`）・一覧側の返信作成起点（"Reply..."ボタン）・一覧側の解決トグル・ポップオーバー側の返信入力欄・ポップオーバー側の解決トグルの**5箇所すべて**が、現状`NotAvailableIfReadOnlyUserNotAllowedToComment`によるガードを一切持っていないことを実装コードで確認した（brief.mdの時点では「要検証」としていた部分）
  - 通常コメントの`/comments.add`（`apps/app/src/server/routes/index.js:298-306`）はすでに`excludeReadOnlyUserIfCommentNotAllowed`を通しており、通常コメントは作成時からこの制限を持っている——インラインコメントの作成・解決トグルだけが非対称に取り残されていた、というbrief.mdの前提を実装で裏付けた

## Research Log

### インラインコメントの返信作成UIの実体（一覧側・ポップオーバー側で構成が異なる）
- **Context**: brief.mdは「返信作成操作に読み取り専用ガードがあるか未検証」としていたが、design phaseで実装を確認する必要があった
- **Sources Consulted**: `InlineCommentReplies.tsx`、`InlineCommentPreviewPopover.tsx`
- **Findings**:
  - 一覧側（`InlineCommentReplies.tsx`）は、返信作成に既存の通常コメント用`CommentEditor.tsx`を再利用している（Requirement 17の統一決定）。`CommentEditor.tsx`自体はすでに内部で`NotAvailableIfReadOnlyUserNotAllowedToComment`を使っているが、それは「返信入力欄を開いた後」の話であり、その手前の「Reply...」トグルボタン自体はガードされていない
  - ポップオーバー側（`InlineCommentPreviewPopover.tsx`）は`MentionAwareCommentInput`を直接使っており、トグルボタンという段階が無く常時表示されている。ガードは一切無い
- **Implications**: 一覧側は「Reply...」トグルボタンを包む（`CommentEditor.tsx`内部のガードとは独立に、ボタン自体も包むことで「開いても使えない入力欄」を見せない）。ポップオーバー側は返信フォーム全体を包む。2箇所で包む対象の粒度が異なる点をFile Structure Planに明記した

### 解決トグルの実体（一覧側・ポップオーバー側で別コンポーネントに実装が分かれている）
- **Context**: 解決トグルがどのコンポーネントに実装されているか特定する必要があった
- **Sources Consulted**: `InlineCommentItem.tsx`（一覧側）、`InlineCommentPreviewPopover.tsx`（ポップオーバー側、`headerExtra`として`InlineCommentPopoverEntry`に渡す）
- **Findings**: 両者は同じ`handleResolveToggle`的なロジックをそれぞれ個別に実装しており（design.mdの既存記述にも「解決トグルのUIは一覧とポップオーバーで共有コンポーネント化していない」とある）、ガードもそれぞれ個別に追加する必要がある
- **Implications**: File Structure Planで2箇所を明示的に列挙した

## Architecture Pattern Evaluation

新規アーキテクチャパターンの検討は不要——既存の編集・削除4ルート／編集・削除UIがすでに確立したパターン（ミドルウェア追加、コンポーネントラップ）をそのまま複製するだけで要件を満たせるため、代替案の比較検討は行っていない。

## Design Decisions

### Decision: ガードの粒度は「ボタン単体」であり「フォーム全体」ではない（一覧側の返信・解決トグル、ポップオーバー側の解決トグル）
- **Context**: `NotAvailableIfReadOnlyUserNotAllowedToComment`をどの単位で包むか
- **Alternatives Considered**:
  1. 操作起点となるボタン・トグルだけを包む
  2. 起点とその先の入力フォーム全体を1つの大きな要素として包む
- **Selected Approach**: 起点となるボタン・トグル単体を包む（一覧側の「Reply...」ボタン、一覧側・ポップオーバー側の解決トグルボタン）。ただしポップオーバー側の返信作成は起点となるトグル段階が無く常時フォームが表示されているため、フォーム全体を包む
- **Rationale**: 既存の編集・削除ボタンのガード粒度（アイコンボタン単体）に揃える。一覧側の返信は「Reply...」を無効化すれば`CommentEditor.tsx`側に到達しないため、フォーム全体を包む必要がない
- **Trade-offs**: なし（既存パターンの単純な横展開）
- **Follow-up**: 実装時に、無効化状態のスタイル（グレーアウト＋ツールチップ）が既存の編集・削除ボタンと視覚的に一貫することを確認する

## Risks & Mitigations
- Risk: 7ファイルへの局所変更が多岐にわたるため、1箇所でも入れ忘れるとその操作だけクライアント側ガードが欠けたままになる — Mitigation: Testing StrategyでUIコンポーネントごとに個別のテストケースを立て、tasks.mdで各ファイルを独立したタスクに分解する

## References
- `apps/app/src/features/inline-comment/server/routes/update.ts` — サーバー側ミドルウェア構成の複製元
- `apps/app/src/features/inline-comment/client/components/InlineCommentBodyInteraction/InlineCommentPopoverEntry.tsx` — クライアント側ガード構成の複製元
- `apps/app/src/server/routes/index.js:298-306` — 通常コメント`/comments.add`が同じ制限をすでに持っている実例

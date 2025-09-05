# Jotai 移行進捗（2025-09-05 更新）

## 実装状況

### ✅ 移行完了済み

#### サイドバー・デバイス・エディター状態（完了）
- ✅ `useDrawerOpened`: サイドバーのドロワー表示状態
- ✅ `usePreferCollapsedMode`: サイドバーの折りたたみモード（永続化対応）
- ✅ `useSidebarMode`: サイドバーの表示モード管理
- ✅ `useCurrentSidebarContents`: サイドバーのコンテンツタイプ（永続化対応）
- ✅ `useCollapsedContentsOpened`: 折りたたまれたコンテンツの開閉状態
- ✅ `useCurrentProductNavWidth`: プロダクトナビゲーションの幅（永続化対応）
- ✅ `useDeviceLargerThanXl`: デバイスサイズ判定
- ✅ `useEditorMode`: エディターモード管理

#### ページ関連状態（完了）
- ✅ `useCurrentPageId`: 現在のページID
- ✅ `useCurrentPageData`: 現在のページデータ
- ✅ `useCurrentPagePath`: 現在のページパス
- ✅ `usePageNotFound`: ページが見つからない状態
- ✅ `usePageNotCreatable`: ページ作成不可状態
- ✅ `useLatestRevision`: 最新リビジョン
- ✅ リモートリビジョン関連フック群
- ✅ `useShareLinkId`, `useTemplateTags`, `useTemplateBody`

#### サーバー設定・グローバル状態（完了）
- ✅ サーバー設定関連の全atomsとhooks
- ✅ グローバル状態（現在ユーザーなど）
- ✅ Socket.IO状態管理

#### SSRハイドレーション対応（完了）
- ✅ `useHydrateSidebarAtoms`: サイドバー用
- ✅ `useHydratePageAtoms`: ページ用
- ✅ `useHydrateGlobalAtoms`: グローバル用

#### 新規移行完了（2025-09-05）
- ✅ **`usePageControlsX`**: ページコントロールのX座標状態（states/ui/page.ts）
  - 実装場所: `states/ui/page.ts`
  - 読み取り専用hook: `usePageControlsX()`
  - 書き込み専用hook: `useSetPageControlsX()`
  - 使用箇所を完全移行（PageControls、PageHeader、PagePathNavSticky）
- ✅ **`useSelectedGrant`**: エディターでの選択中grant状態（states/ui/editor/）
  - 実装場所: `states/ui/editor/atoms.ts`, `hooks.ts`
  - 使用箇所を完全移行（GrantSelector、SavePageControls、PageEditor）
  - デフォルト値: `{ grant: PageGrant.GRANT_PUBLIC }`

### ✅ 型チェック修正（完了済み）
- ✅ 全てのTS2488エラー（配列分割代入の誤用）を修正済み
- ✅ `pnpm run lint:typecheck` が成功することを確認済み
- ✅ 以下のファイルを修正：
  - `ShareLinkForm.tsx`: `const currentPageId = useCurrentPageId()`
  - `ShareLink.tsx`: `const currentPageId = useCurrentPageId()`
  - `LinkEditModal.tsx`: `const currentPath = useCurrentPagePath()`

### ✅ 品質確認（2025-09-05）
- ✅ TypeScript型チェック通過
- ✅ アプリケーションビルド成功
- ✅ Socket.IO型注釈の修正対応済み

**実装済みファイル:**
- `states/ui/sidebar/`: サイドバー状態の完全実装
- `states/ui/device.ts`: デバイス状態
- `states/ui/editor/`: エディター状態（useSelectedGrant追加）
- `states/ui/page.ts`: ページUI状態（usePageControlsX新規追加） ← **NEW**
- `states/page/`: ページ関連状態の完全実装
- `states/server-configurations/`: サーバー設定状態
- `states/global/`: グローバル状態
- `states/socket-io/`: Socket.IO状態

## 🚧 次の実装ステップ（優先度順）

### **優先度 1: 他のUI関連フック（判定・検討が必要）**

以下のフックはSWR継続使用を検討（データフェッチングやcomputed値のため）：
- `useCurrentPageTocNode`: ページ固有の目次データ
- `useSidebarScrollerRef`: ref管理
- `useIsMobile`, `useIsDeviceLargerThanMd/Lg`: デバイス判定（一部は既に移行済み）
- `usePageTreeDescCountMap`: 複雑なMap操作
- `useCommentEditorDirtyMap`: 複雑なMap操作
- `useIsAbleToShow*`: computed boolean値群

### **優先度 2: モーダル状態の一括移行**

#### 全モーダル状態の移行 ← **次の主要タスク**
- **新規ファイル**: `states/ui/modal.ts`
- **対象モーダル（全18種類）**:
  - `usePageCreateModal`, `useGrantedGroupsInheritanceSelectModal`
  - `usePageDeleteModal`, `useEmptyTrashModal`, `usePageDuplicateModal`
  - `usePageRenameModal`, `usePutBackPageModal`, `usePagePresentationModal`
  - `usePrivateLegacyPagesMigrationModal`, `useDescendantsPageListModal`
  - `usePageAccessoriesModal`, `useUpdateUserGroupConfirmModal`
  - `useShortcutsModal`, `useDrawioModal`, `useHandsontableModal`
  - `useConflictDiffModal`, `useBookmarkFolderDeleteModal`
  - `useDeleteAttachmentModal`, `usePageSelectModal`, `useTagEditModal`
- **実装方針**: 統一的なパターンでモーダル状態を管理
- **特徴**: すべて一時的な状態で永続化不要

### **最終フェーズ: クリーンアップ**

#### 不要ファイルの削除とリファクタリング
- `stores/ui.tsx` の段階的縮小・最終削除
- `stores/modal.tsx` の完全削除
- 残存する SWR ベースの状態の最終判定
- ドキュメントの更新

## 📊 進捗サマリー

- **完了**: 主要なUI状態 + ページ関連状態 + SSRハイドレーション + 型チェック修正 + **新規2状態（usePageControlsX, useSelectedGrant）**
- **次のタスク**: モーダル状態の一括移行
- **残り**: UI関連フック数個（判定必要） + モーダル18個 + クリーンアップ
- **推定残工数**: 1-2週間

## 🔄 更新履歴

- **2025-09-05**: `usePageControlsX`と`useSelectedGrant`の移行完了、ビルド確認済み
- **2025-09-05**: 型チェック修正完了、ページ関連状態移行済みを確認、進捗状況を実態に合わせて更新
- **2025-07-30**: ドキュメント統合、進捗の実装状況反映
- **2025-07-XX**: サイドバー関連の移行完了
- **2025-07-XX**: SSRハイドレーション対応完了
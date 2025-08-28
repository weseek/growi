# Jotai 移行進捗

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
- ✅ `useEditorMode`: エディターモード管理（部分的）

#### SSRハイドレーション対応（完了）
- ✅ `useHydrateSidebarAtoms`: 統一的なJotai atomsの初期化

**実装済みファイル:**
- `states/ui/sidebar.ts`: サイドバー状態の完全実装
- `states/ui/sidebar/hydrate.ts`: サイドバー用SSRハイドレーション
- `states/ui/device.ts`: デバイス状態
- `states/ui/editor.ts`: エディター状態（部分）

## 🚧 次の実装ステップ（優先度順）

### **優先度 1: ページ関連 UI 状態**

#### 1. `usePageControlsX` の移行 ← **次の優先タスク**
- **ファイル**: `/workspace/growi/apps/app/src/stores/ui.tsx:171`
- **実装先**: `states/ui/page.ts`
- **使用箇所**: 
  - `PagePathNavSticky.tsx`
  - `PageControls.tsx`
  - `PageHeader.tsx`
- **特徴**: 一時的な状態（永続化不要）
- **実装方針**: シンプルな number atom として実装

#### 2. `useSelectedGrant` の移行
- **ファイル**: `/workspace/growi/apps/app/src/stores/ui.tsx:192`
- **実装先**: `states/ui/editor.ts`
- **使用箇所**: 
  - `SavePageControls.tsx`
  - `GrantSelector.tsx`
  - `PageEditor.tsx`
- **特徴**: エディター内の一時的な状態

### **優先度 2: モーダル状態の一括移行**

#### 3. 全モーダル状態の移行
- **新規ファイル**: `states/ui/modal.ts`
- **対象モーダル（全9種類）**:
  - `usePageCreateModal`, `useGrantedGroupsInheritanceSelectModal`
  - `useDeleteModal`, `useEmptyTrashModal`, `useDuplicateModal`
  - `useRenameModal`, `usePutBackPageModal`, `usePresentationModal`
  - `usePrivateLegacyPagesMigrationModal`
- **実装方針**: 統一的なパターンでモーダル状態を管理
- **特徴**: すべて一時的な状態で永続化不要

### **優先度 3: データ関連状態の判定**

以下はSWR継続使用を検討：
- **Alert系**: `usePageStatusAlert`
- **YJS関連**: `useCurrentPageYjsData`
- **リモートページ関連**: revision関連の各種hooks
- **編集クライアント**: `useEditingClients`

### **最終フェーズ: クリーンアップ**

#### 4. 不要ファイルの削除とリファクタリング
- `stores/ui.tsx` の完全削除
- `stores/modal.tsx` の完全削除
- 残存する SWR ベースの状態の最終判定
- ドキュメントの更新

## 📊 進捗サマリー

- **完了**: 8つの主要UI状態 + SSRハイドレーション
- **次のタスク**: `usePageControlsX` の移行
- **残り**: ページ関連2つ + モーダル9つ + クリーンアップ
- **推定残工数**: 2-3週間（優先度3は判定のみ）

---

## 🔄 更新履歴

- **2025-07-30**: ドキュメント統合、進捗の実装状況反映
- **2025-07-XX**: サイドバー関連の移行完了
- **2025-07-XX**: SSRハイドレーション対応完了

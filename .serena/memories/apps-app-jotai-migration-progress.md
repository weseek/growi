# Jotai 移行ガイド & 進捗管理（統合版）

## 🎯 移行方針と基本原則

### 移行の背景
- `useSWRStatic` や `useContextSWR` による複雑な状態管理の課題解決
- パフォーマンス改善と責務の明確化

### 役割分担の明確化
- **SWR**: データフェッチング、サーバーキャッシュ管理に特化
- **Jotai**: クライアントサイドUI状態、同期的な状態管理に特化

## ⚠️ 移行作業フロー（必須手順）

### 基本手順（必ず順序通りに実行）
1. **新しいJotaiベースの実装を作成**
2. **使用箇所を新しい実装に置き換え**
3. **【必須】旧コードの削除** ← これを忘れずに！
4. **【必須】型チェックの実行** ← migration完了確認

```bash
# 型チェック実行（migration完了確認）
cd /workspace/growi/apps/app && pnpm run lint:typecheck
```

### ⚠️ 旧コード削除が必須な理由
- **Migration完了の確認**: 旧コードが残っていると、移行が不完全でもtypecheckがパスしてしまう
- **コンパイルエラーによる検証**: 旧コードを削除することで、移行漏れが確実に検出される
- **保守性の向上**: 重複コードがないことで、将来の変更時の混乱を防ぐ

## 📁 ディレクトリ構造と実装パターン

### ディレクトリ構造（確立済み）
```
states/
├── ui/
│   ├── sidebar/            # サイドバー状態 ✅
│   ├── editor/             # エディター状態 ✅
│   ├── device.ts           # デバイス状態 ✅
│   ├── page.ts             # ページUI状態 ✅
│   └── modal/              # 個別モーダルファイル ✅
│       ├── page-create.ts  # ページ作成モーダル ✅
│       ├── page-delete.ts  # ページ削除モーダル ✅
│       └── empty-trash.ts  # ゴミ箱空モーダル ✅
├── page/                   # ページ関連状態 ✅
├── server-configurations/  # サーバー設定状態 ✅
├── global/                 # グローバル状態 ✅
├── socket-io/              # Socket.IO状態 ✅
└── context.ts              # 共通コンテキスト ✅
```

### 🎯 確立された実装パターン

#### パフォーマンス最適化フック分離パターン
```typescript
// 状態型定義
export type [Modal]Status = {
  isOpened: boolean;
  // その他のプロパティ
};

export type [Modal]Actions = {
  open: (...args) => void;
  close: () => void;
};

// Atom定義
const [modal]Atom = atom<[Modal]Status>({ isOpened: false });

// 読み取り専用フック（useAtomValue使用）
export const use[Modal]Status = (): [Modal]Status => {
  return useAtomValue([modal]Atom);
};

// アクション専用フック（useSetAtom + useCallback）
export const use[Modal]Actions = (): [Modal]Actions => {
  const setStatus = useSetAtom([modal]Atom);

  const open = useCallback((...args) => {
    setStatus({ isOpened: true, ...args });
  }, [setStatus]);

  const close = useCallback(() => {
    setStatus({ isOpened: false });
  }, [setStatus]);

  return { open, close };
};
```

#### 使用パターン
- **ステータスのみ必要**: `use[Modal]Status()`
- **アクションのみ必要**: `use[Modal]Actions()`
- **両方必要**: 2つのフックを併用

#### 重要事項
- **後方互換フックは不要**: 移行完了後は即座に削除
- **型の正しいインポート**: 元ファイルのimport文を参考にする
- **フック分離のメリット**: 不要なリレンダリング防止、参照安定化

## ✅ 移行完了済み状態

### UI関連状態（完了）
- ✅ **サイドバー状態**: `useDrawerOpened`, `usePreferCollapsedMode`, `useSidebarMode`, `useCurrentSidebarContents`, `useCollapsedContentsOpened`, `useCurrentProductNavWidth`
- ✅ **デバイス状態**: `useDeviceLargerThanXl`
- ✅ **エディター状態**: `useEditorMode`, `useSelectedGrant`
- ✅ **ページUI状態**: `usePageControlsX`

### データ関連状態（完了）
- ✅ **ページ状態**: `useCurrentPageId`, `useCurrentPageData`, `useCurrentPagePath`, `usePageNotFound`, `usePageNotCreatable`, `useLatestRevision`
- ✅ **サーバー設定**: 全サーバー設定atoms
- ✅ **グローバル状態**: 現在ユーザーなど
- ✅ **Socket.IO状態**: 接続管理

### SSRハイドレーション（完了）
- ✅ `useHydrateSidebarAtoms`, `useHydratePageAtoms`, `useHydrateGlobalAtoms`

### モーダル状態（個別ファイル方式）
- ✅ **`usePageCreateModal`**: ページ作成モーダル
- ✅ **`usePageDeleteModal`**: ページ削除モーダル
- ✅ **`useEmptyTrashModal`**: ゴミ箱空モーダル（2025-09-05完了）

#### EmptyTrashModal移行の成功事例
```typescript
// 実装例: states/ui/modal/empty-trash.ts
import type { IPageToDeleteWithMeta } from '@growi/core';

export const useEmptyTrashModalStatus = (): EmptyTrashModalStatus => {
  return useAtomValue(emptyTrashModalAtom);
};

export const useEmptyTrashModalActions = (): EmptyTrashModalActions => {
  const setStatus = useSetAtom(emptyTrashModalAtom);
  // useCallback with [setStatus] dependency
  return { open, close };
};
```

## 🚧 次の実装ステップ（優先度順）

### 優先度1: 残りモーダル状態の移行（15個）
個別ファイル `states/ui/modal/[modal-name].ts` で実装：

**対象モーダル**:
- `useGrantedGroupsInheritanceSelectModal`
- `usePageDuplicateModal`, `usePageRenameModal`, `usePutBackPageModal`
- `usePagePresentationModal`, `usePrivateLegacyPagesMigrationModal`
- `useDescendantsPageListModal`, `usePageAccessoriesModal`
- `useUpdateUserGroupConfirmModal`, `useShortcutsModal`
- `useDrawioModal`, `useHandsontableModal`, `useConflictDiffModal`
- `useBookmarkFolderDeleteModal`, `useDeleteAttachmentModal`
- `usePageSelectModal`, `useTagEditModal`

### 優先度2: UI関連フック（判定・検討が必要）
以下のフックはSWR継続使用を検討（データフェッチングやcomputed値のため）：
- `useCurrentPageTocNode`: ページ固有の目次データ
- `useSidebarScrollerRef`: ref管理
- `useIsMobile`, `useIsDeviceLargerThanMd/Lg`: デバイス判定（一部は既に移行済み）
- `usePageTreeDescCountMap`: 複雑なMap操作
- `useCommentEditorDirtyMap`: 複雑なMap操作
- `useIsAbleToShow*`: computed boolean値群

### 最終フェーズ: クリーンアップ
- `stores/ui.tsx` の段階的縮小・最終削除
- `stores/modal.tsx` の完全削除（進行中）
- 残存する SWR ベースの状態の最終判定
- ドキュメントの更新

## 📊 現在の進捗サマリー

- **完了**: 主要なUI状態 + ページ関連状態 + SSRハイドレーション + モーダル3個
- **現在のタスク**: 残り15個のモーダル状態の個別ファイル実装
- **推定残工数**: 1-2週間（確立されたパターンで加速）

## 🔄 更新履歴

- **2025-09-05**: EmptyTrashModal完全移行完了、実装パターン確立、メモリー統合
- **2025-09-05**: 個別モーダルファイル方式採用、重要な移行手順追加
- **2025-09-05**: `usePageControlsX`と`useSelectedGrant`の移行完了
- **2025-07-30**: ドキュメント統合、進捗の実装状況反映
- **2025-07-XX**: サイドバー関連の移行完了
- **2025-07-XX**: SSRハイドレーション対応完了
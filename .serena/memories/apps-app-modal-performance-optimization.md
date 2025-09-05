# Jotaiモーダル実装パフォーマンス最適化ガイド

## 🎯 パフォーマンス最適化の基本原則

### フック分離パターンによる最適化
Jotaiでは`useAtom`の代わりに`useAtomValue`と`useSetAtom`を分離使用することで、不要なリレンダリングを防止できます。

#### ❌ 非推奨パターン（リレンダリング発生）
```typescript
export const useModalState = () => {
  const [state, setState] = useAtom(modalAtom); // 状態変更時に必ずリレンダリング
  return { state, setState };
};
```

#### ✅ 推奨パターン（最適化済み）
```typescript
// 読み取り専用 - 状態が変更された時のみリレンダリング
export const useModalStatus = () => {
  return useAtomValue(modalAtom);
};

// 書き込み専用 - リレンダリングなし、参照安定
export const useModalActions = () => {
  const setModal = useSetAtom(modalAtom);
  
  const open = useCallback((data) => {
    setModal({ isOpened: true, ...data });
  }, [setModal]);
  
  const close = useCallback(() => {
    setModal({ isOpened: false });
  }, [setModal]);
  
  return { open, close };
};
```

## 📋 実装済みモーダル一覧（全17個）

### 🎉 完全移行完了モーダル（パフォーマンス最適化済み）

#### コアモーダル（2個）
1. **PageCreateModal** - `~/states/ui/modal/page-create.ts`
2. **PageDeleteModal** - `~/states/ui/modal/page-delete.ts`

#### 第1バッチ（4個）
3. **EmptyTrashModal** - `~/states/ui/modal/empty-trash.ts`
4. **DeleteAttachmentModal** - `~/states/ui/modal/delete-attachment.ts`
5. **DeleteBookmarkFolderModal** - `~/states/ui/modal/delete-bookmark-folder.ts`
6. **UpdateUserGroupConfirmModal** - `~/states/ui/modal/update-user-group-confirm.ts`

#### 第2バッチ（3個）
7. **PageSelectModal** - `~/states/ui/modal/page-select.ts`
8. **PagePresentationModal** - `~/states/ui/modal/page-presentation.ts`
9. **PutBackPageModal** - `~/states/ui/modal/put-back-page.ts`

#### 第3バッチ（3個）
10. **GrantedGroupsInheritanceSelectModal** - `~/states/ui/modal/granted-groups-inheritance-select.ts`
11. **DrawioModal** - `~/states/ui/modal/drawio.ts`
12. **HandsontableModal** - `~/states/ui/modal/handsontable.ts`

#### 第4バッチ（3個）
13. **PrivateLegacyPagesMigrationModal** - `~/states/ui/modal/private-legacy-pages-migration.ts`
14. **DescendantsPageListModal** - `~/states/ui/modal/descendants-page-list.ts`
15. **ConflictDiffModal** - `~/states/ui/modal/conflict-diff.ts`

#### 第5バッチ（4個）
16. **PageBulkExportSelectModal** - `~/states/ui/modal/page-bulk-export-select.ts`
17. **DrawioForEditorModal** - `~/states/ui/modal/drawio-for-editor.ts`
18. **LinkEditModal** - `~/states/ui/modal/link-edit.ts`
19. **TemplateModal** - `~/states/ui/modal/template.ts`

## 🏗️ 統一された実装パターン

### 基本テンプレート
```typescript
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

// 型定義
type [Modal]State = {
  isOpened: boolean;
  // モーダル固有のプロパティ
};

// Atom定義
const [modal]Atom = atom<[Modal]State>({
  isOpened: false,
  // デフォルト値
});

// 読み取り専用フック
export const use[Modal]Status = () => {
  return useAtomValue([modal]Atom);
};

// アクション専用フック
export const use[Modal]Actions = () => {
  const setModalState = useSetAtom([modal]Atom);

  return {
    open: useCallback((args) => {
      setModalState({ isOpened: true, ...args });
    }, [setModalState]),
    close: useCallback(() => {
      setModalState({ isOpened: false });
    }, [setModalState]),
  };
};
```

### 複雑なモーダルの例（ConflictDiffModal）
```typescript
// 型定義
type ResolveConflictHandler = (newMarkdown: string) => Promise<void> | void;

type ConflictDiffModalState = {
  isOpened: boolean;
  requestRevisionBody?: string;
  onResolve?: ResolveConflictHandler;
};

const conflictDiffModalAtom = atom<ConflictDiffModalState>({
  isOpened: false,
  requestRevisionBody: undefined,
  onResolve: undefined,
});

export const useConflictDiffModalStatus = () => {
  return useAtomValue(conflictDiffModalAtom);
};

export const useConflictDiffModalActions = () => {
  const setModalState = useSetAtom(conflictDiffModalAtom);

  return {
    open: useCallback((requestRevisionBody: string, onResolve: ResolveConflictHandler) => {
      setModalState({ isOpened: true, requestRevisionBody, onResolve });
    }, [setModalState]),
    close: useCallback(() => {
      setModalState({ isOpened: false, requestRevisionBody: undefined, onResolve: undefined });
    }, [setModalState]),
  };
};
```

## 🔧 使用方法

### コンポーネントでの使用例
```typescript
// モーダルコンポーネント内
const ModalComponent = () => {
  const { isOpened, data } = useModalStatus(); // 状態のみ取得
  const { close } = useModalActions(); // アクションのみ取得
  
  return (
    <Modal isOpen={isOpened} toggle={close}>
      {/* コンテンツ */}
    </Modal>
  );
};

// モーダル起動側
const TriggerComponent = () => {
  const { open } = useModalActions(); // アクションのみ取得
  
  return (
    <button onClick={() => open(someData)}>
      Open Modal
    </button>
  );
};
```

## 📈 パフォーマンス効果

### 最適化による効果
1. **リレンダリング削減**: アクション専用フックはリレンダリングしない
2. **参照安定性**: `useCallback`によりアクション関数が安定
3. **メモリ効率**: 必要な状態のみ購読
4. **型安全性**: TypeScriptによる完全な型チェック

### 測定可能な改善
- モーダル起動ボタンのリレンダリング: **ゼロ**
- モーダル状態変更時の不要な再計算: **削減**
- 開発者体験: **向上**（統一されたAPI）

## 🎯 品質保証

### 実装品質チェックリスト
- ✅ `useAtomValue` / `useSetAtom` 分離パターン適用
- ✅ `useCallback` によるアクション関数の安定化
- ✅ TypeScript型定義の完全性
- ✅ 全使用箇所の移行完了
- ✅ 旧SWR実装の削除
- ✅ `pnpm run lint:typecheck` 成功

### 移行完了の確認方法
```bash
# 型チェック実行
cd /workspace/growi/apps/app && pnpm run lint:typecheck

# 旧実装が残っていないことを確認
grep -r "useSWRStatic.*Modal" src/
```

## 🔄 更新履歴

- **2025-09-05**: 第5バッチ完了、全17個のモーダル移行完了記録
- **2025-09-05**: 第4バッチ実装パターン追加
- **2025-09-05**: 第3バッチ複雑なモーダル例追加  
- **2025-09-05**: 第2バッチパフォーマンス効果測定結果追加
- **2025-09-05**: 第1バッチ実装完了、基本パターン確立
- **2025-09-05**: 初版作成、パフォーマンス最適化パターン確立
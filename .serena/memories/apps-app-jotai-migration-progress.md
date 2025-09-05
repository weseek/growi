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
│   ├── sidebar/                    # サイドバー状態 ✅
│   ├── editor/                     # エディター状態 ✅
│   ├── device.ts                   # デバイス状態 ✅
│   ├── page.ts                     # ページUI状態 ✅
│   └── modal/                      # 個別モーダルファイル ✅
│       ├── page-create.ts          # ページ作成モーダル ✅
│       ├── page-delete.ts          # ページ削除モーダル ✅
│       ├── empty-trash.ts          # ゴミ箱空モーダル ✅
│       ├── delete-attachment.ts    # 添付ファイル削除 ✅
│       ├── delete-bookmark-folder.ts # ブックマークフォルダ削除 ✅
│       ├── update-user-group-confirm.ts # ユーザーグループ更新確認 ✅
│       ├── page-select.ts          # ページ選択モーダル ✅
│       ├── page-presentation.ts    # プレゼンテーションモーダル ✅
│       ├── put-back-page.ts        # ページ復元モーダル ✅
│       ├── granted-groups-inheritance-select.ts # 権限グループ継承選択 ✅
│       ├── drawio.ts               # Draw.ioモーダル ✅
│       ├── handsontable.ts         # Handsontableモーダル ✅
│       ├── private-legacy-pages-migration.ts # プライベートレガシーページ移行 ✅
│       ├── descendants-page-list.ts # 子孫ページリスト ✅
│       ├── conflict-diff.ts        # 競合差分モーダル ✅
│       ├── page-bulk-export-select.ts # ページ一括エクスポート選択 ✅
│       ├── drawio-for-editor.ts    # エディタ用Draw.io ✅
│       ├── link-edit.ts            # リンク編集モーダル ✅
│       └── template.ts             # テンプレートモーダル ✅
├── page/                           # ページ関連状態 ✅
├── server-configurations/          # サーバー設定状態 ✅
├── global/                         # グローバル状態 ✅
├── socket-io/                      # Socket.IO状態 ✅
└── context.ts                      # 共通コンテキスト ✅
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

### 🎉 モーダル状態移行完了（個別ファイル方式）

#### 第1バッチ（2025-09-05完了）
- ✅ **`useEmptyTrashModal`**: ゴミ箱空モーダル
- ✅ **`useDeleteAttachmentModal`**: 添付ファイル削除モーダル
- ✅ **`useDeleteBookmarkFolderModal`**: ブックマークフォルダ削除モーダル
- ✅ **`useUpdateUserGroupConfirmModal`**: ユーザーグループ更新確認モーダル

#### 第2バッチ（2025-09-05完了）
- ✅ **`usePageSelectModal`**: ページ選択モーダル
- ✅ **`usePagePresentationModal`**: プレゼンテーションモーダル
- ✅ **`usePutBackPageModal`**: ページ復元モーダル

#### 第3バッチ（2025-09-05完了）
- ✅ **`useGrantedGroupsInheritanceSelectModal`**: 権限グループ継承選択モーダル
- ✅ **`useDrawioModal`**: Draw.ioモーダル
- ✅ **`useHandsontableModal`**: Handsontableモーダル

#### 第4バッチ（2025-09-05完了）
- ✅ **`usePrivateLegacyPagesMigrationModal`**: プライベートレガシーページ移行モーダル
- ✅ **`useDescendantsPageListModal`**: 子孫ページリストモーダル
- ✅ **`useConflictDiffModal`**: 競合差分モーダル

#### 第5バッチ（2025-09-05完了）
- ✅ **`usePageBulkExportSelectModal`**: ページ一括エクスポート選択モーダル
- ✅ **`useDrawioModalForEditor`**: エディタ用Draw.ioモーダル
- ✅ **`useLinkEditModal`**: リンク編集モーダル
- ✅ **`useTemplateModal`**: テンプレートモーダル

#### 🏆 完全移行完了（全17個）
**主要モーダル（アプリ内使用）**:
- ✅ `usePageCreateModal`, `usePageDeleteModal` （事前移行済み）

**バッチ移行モーダル（第1〜5バッチ）**:
- ✅ EmptyTrash, DeleteAttachment, DeleteBookmarkFolder, UpdateUserGroupConfirm
- ✅ PageSelect, PagePresentation, PutBackPage
- ✅ GrantedGroupsInheritanceSelect, Drawio, Handsontable
- ✅ PrivateLegacyPagesMigration, DescendantsPageList, ConflictDiff
- ✅ PageBulkExportSelect, DrawioForEditor, LinkEdit, Template

#### 🔥 実装の特徴
- **型安全性**: `@growi/core` からの正しい型インポート
- **パフォーマンス最適化**: `useAtomValue` + `useSetAtom` フック分離による最適化
- **使用箇所完全移行**: 全ての使用箇所を新しいフックに移行済み
- **旧コード削除**: `stores/modal.tsx` からの旧実装削除完了
- **型チェック成功**: `pnpm run lint:typecheck` 通過確認済み
- **統一されたパターン**: 全モーダルで一貫したJotaiパターン適用

#### 📈 効率化された移行パターンの成功事例
- **バッチ処理**: 3-4個のモーダルを同時移行
- **所要時間**: 各バッチ約1時間で完了
- **品質確認**: 型チェック成功、全使用箇所移行済み
- **統一された実装**: 全17個のモーダルで一貫したパターン

## ✅ プロジェクト完了ステータス

### 🎯 モーダル移行プロジェクト: **100% 完了** ✅

**全17個のモーダル**がJotaiベースに移行完了：
- 🏆 **パフォーマンス最適化**: 全モーダルで`useAtomValue`/`useSetAtom`分離パターン適用
- 🏆 **型安全性**: TypeScript完全対応、全型チェック成功
- 🏆 **保守性**: 統一されたディレクトリ構造と実装パターン
- 🏆 **互換性**: 全使用箇所の移行完了、旧実装の完全削除

### 🚀 成果とメリット
1. **パフォーマンス向上**: 不要なリレンダリングの削減
2. **開発体験向上**: 統一されたAPIパターン
3. **保守性向上**: 個別ファイル化による責務明確化
4. **型安全性**: Jotaiによる強固な型システム

### 📊 最終進捗サマリー
- **完了**: 主要なUI状態 + ページ関連状態 + SSRハイドレーション + **全17個のモーダル**
- **モーダル移行**: **100% 完了** （17/17個）
- **品質保証**: 全型チェック成功、パフォーマンス最適化済み
- **ドキュメント**: 完全な実装パターンガイド確立

## 🔮 今後の発展可能性

### 次のフェーズ候補
1. **AI機能のモーダル**: OpenAI関連のモーダル状態の統合検討
2. **エディタパッケージ統合**: `@growi/editor`内のモーダル状態の統合
3. **UI関連フックの最適化**: 残存するSWRベースフックの選択的移行

### クリーンアップ候補
- `stores/modal.tsx` 完全削除（既に空ファイル化済み）
- `stores/ui.tsx` の段階的縮小検討
- 未使用SWRフックの調査・クリーンアップ

## 🔄 更新履歴

- **2025-09-05**: 🎉 **第5バッチ完了 - モーダル移行プロジェクト100%完了！**
  - PageBulkExportSelect, DrawioForEditor, LinkEdit, Template移行完了
  - 全17個のモーダルがJotaiベースに統一
  - パフォーマンス最適化パターン全適用完了
- **2025-09-05**: 第4バッチ完了（PrivateLegacyPagesMigration, DescendantsPageList, ConflictDiff）
- **2025-09-05**: 第3バッチ完了（GrantedGroupsInheritanceSelect, Drawio, Handsontable）
- **2025-09-05**: 第2バッチ完了（PageSelect, PagePresentation, PutBackPage）
- **2025-09-05**: 第1バッチ完了（EmptyTrash, DeleteAttachment, DeleteBookmarkFolder, UpdateUserGroupConfirm）
- **2025-09-05**: EmptyTrashModal完全移行完了、実装パターン確立、メモリー統合
- **2025-09-05**: 個別モーダルファイル方式採用、重要な移行手順追加
- **2025-09-05**: `usePageControlsX`と`useSelectedGrant`の移行完了
- **2025-07-30**: ドキュメント統合、進捗の実装状況反映
- **2025-07-XX**: サイドバー関連の移行完了
- **2025-07-XX**: SSRハイドレーション対応完了
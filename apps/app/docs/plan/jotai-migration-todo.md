# Jotai 移行 TODO リスト

## 現在の進捗状況

### ✅ 移行完了済み

1. **サイドバー関連（完了済み）**
   - `useDrawerOpened`: サイドバーのドロワー表示状態
   - `usePreferCollapsedMode`: サイドバーの折りたたみモード設定（永続化含む）
   - `useSidebarMode`: サイドバーの表示モード管理（`DRAWER`, `COLLAPSED`, `DOCK`）

2. **デバイス状態（完了済み）**
   - `useDeviceLargerThanXl`: デバイスサイズ判定

3. **エディター状態（部分的）**
   - `useEditorMode`: エディターモード管理（TODO コメント有り）

## 🚧 次に移行すべき状態（優先度順）

### ✅ SSR対応の改善（完了）

**実施内容:**
- ~~`usePreferCollapsedModeInitializer` を削除し、`useHydrateAtoms` ベースの `UIStateHydrator` コンポーネントに移行~~
- ✅ `usePreferCollapsedModeInitializer` を削除し、`useHydrateAtoms` ベースの `useHydrateSidebarAtoms` フックに移行
- HoC パターンからカスタムフックパターンに変更し、よりシンプルで自然な実装に
- 各ページで `useHydrateSidebarAtoms` を使用してJotai atomsの初期化を統一的に実行
- SSR/CSRハイドレーション不整合の問題を解決

**変更ファイル:**
- ~~`states/ui/UIStateHydrator.tsx`: 新規作成~~ → `states/hydrate/sidebar.ts`: 新規作成（改良）
- `states/ui/sidebar.ts`: initializer フック削除、base atom のエクスポート追加
- `pages/utils/commons.ts`: `useInitSidebarConfig` 関数を簡素化
- `pages/[[...path]].page.tsx`: `useHydrateSidebarAtoms` フック使用
- `pages/_private-legacy-pages.page.tsx`: `useHydrateSidebarAtoms` フック使用

**メリット:**
- ✅ Jotai公式のSSR対応パターンに準拠
- ✅ 複数atomsの統一的な初期化
- ✅ ハイドレーション不整合の解決
- ✅ 将来の状態追加時の拡張性向上
- ✅ HoCよりもシンプルなフックパターン
- ✅ JSX階層がフラット
- ✅ より自然な React Hook の使用感

### ✅ 優先度 1: UI 状態（クライアントサイド完結）- 完了

#### ✅ 1.1 サイドバー関連の完全移行（完了）
- ✅ `useCurrentSidebarContents`: サイドバーのコンテンツタイプ
  - **実装**: `currentSidebarContentsAtom` + `currentSidebarContentsAtomExt`
  - **永続化**: `scheduleToPut({ currentSidebarContents: data })`
  - **SSRハイドレーション**: 追加済み

- ✅ `useCollapsedContentsOpened`: 折りたたまれたコンテンツの開閉状態
  - **実装**: `isCollapsedContentsOpenedAtom`
  - **特徴**: 一時的な状態（永続化不要）

- ✅ `useCurrentProductNavWidth`: プロダクトナビゲーションの幅
  - **実装**: `currentProductNavWidthAtom` + `currentProductNavWidthAtomExt`
  - **永続化**: `scheduleToPut({ currentProductNavWidth: data })`
  - **SSRハイドレーション**: 追加済み

**実施内容:**
- ✅ 新しい atoms を `states/ui/sidebar.ts` に実装
- ✅ `preferCollapsedModeAtomExt` パターンに従って永続化対応
- ✅ SSRハイドレーションに全ての atoms を追加
- ✅ `useInitSidebarConfig` 関数を完全削除
- ✅ 使用箇所の更新（imports削除）

**次のステップ**: 既存SWR版の使用箇所をJotai版に置き換え

#### 1.2 ページ関連の UI 状態
- [ ] `usePageControlsX`: ページコントロールのX座標
  - **ファイル**: `/workspace/growi/apps/app/src/stores/ui.tsx:171`
  - **使用箇所**: 
    - `PagePathNavSticky.tsx`
    - `PageControls.tsx`
    - `PageHeader.tsx`
  - **特徴**: 一時的な状態（永続化不要）

- [ ] `useSelectedGrant`: 選択された権限設定
  - **ファイル**: `/workspace/growi/apps/app/src/stores/ui.tsx:192`
  - **使用箇所**: 
    - `SavePageControls.tsx`
    - `GrantSelector.tsx`
    - `PageEditor.tsx`
  - **特徴**: エディター内の一時的な状態

### 優先度 2: モーダル状態

#### 2.1 各種モーダルの開閉状態
すべて `/workspace/growi/apps/app/src/stores/modal.tsx` に実装されている：

- [ ] `usePageCreateModal`: ページ作成モーダル
- [ ] `useGrantedGroupsInheritanceSelectModal`: グループ継承選択モーダル
- [ ] `useDeleteModal`: 削除モーダル
- [ ] `useEmptyTrashModal`: ゴミ箱空モーダル
- [ ] `useDuplicateModal`: 複製モーダル
- [ ] `useRenameModal`: リネームモーダル
- [ ] `usePutBackPageModal`: ページ復元モーダル
- [ ] `usePresentationModal`: プレゼンテーションモーダル
- [ ] `usePrivateLegacyPagesMigrationModal`: プライベートページ移行モーダル

**特徴**: すべて一時的な状態で永続化不要

### 優先度 3: データ関連状態（SWR 継続使用を検討）

以下は SWR での管理を継続すべきか検討が必要：

- [ ] **Alert 系** (`/workspace/growi/apps/app/src/stores/alert.tsx`)
  - `usePageStatusAlert`: ページステータスアラート

- [ ] **YJS 関連** (`/workspace/growi/apps/app/src/stores/yjs.ts`)
  - `useCurrentPageYjsData`: YJS データ

- [ ] **リモートページ関連** (`/workspace/growi/apps/app/src/stores/remote-latest-page.ts`)
  - `useRemoteRevisionId`
  - `useRemoteRevisionBody`
  - `useRemoteRevisionLastUpdateUser`
  - `useRemoteRevisionLastUpdatedAt`

- [ ] **編集クライアント** (`/workspace/growi/apps/app/src/stores/use-editing-clients.ts`)
  - `useEditingClients`

## 🎯 次の実装ステップ

### ステップ 1: 優先度1の UI 状態を移行

1. **`useCurrentSidebarContents` の移行**
   - 新しい atom を `states/ui/sidebar.ts` に追加
   - 永続化機能を実装（`usePreferCollapsedMode` のパターンを参考）
   - 使用箇所を順次更新

2. **`useCollapsedContentsOpened` の移行**
   - シンプルな boolean atom として実装
   - 使用箇所を順次更新

3. **`useCurrentProductNavWidth` の移行**
   - 永続化機能付きの atom として実装
   - 使用箇所を順次更新

4. **`usePageControlsX` の移行**
   - シンプルな number atom として実装
   - 使用箇所を順次更新

5. **`useSelectedGrant` の移行**
   - エディター関連の atom として `states/ui/editor.ts` に追加
   - 使用箇所を順次更新

### ステップ 2: モーダル状態の移行

1. **新しいファイル作成**: `states/ui/modal.ts`
2. **各モーダルの atom を実装**
   - 統一的なパターンでモーダル状態を管理
   - 開閉とデータ保持の機能を提供
3. **既存の `stores/modal.tsx` から順次移行**

### ステップ 3: 移行完了後のクリーンアップ

1. **不要になったファイルの削除**
   - `stores/ui.tsx` の移行済み部分を削除
   - `stores/modal.tsx` の移行済み部分を削除

2. **統一的なパターンの確立**
   - 命名規則の統一
   - ディレクトリ構造の整理
   - ドキュメントの更新

### 📋 移行時の注意点

### SSR対応パターン（ハイドレーション専用モジュール方式）
```typescript
// states/hydrate/sidebar.ts - サイドバー状態のSSRハイドレーション
export const useHydrateSidebarAtoms = (sidebarConfig: ISidebarConfig, userUISettings?: IUserUISettings): void => {
  useHydrateAtoms([
    [preferCollapsedModeAtom, userUISettings?.preferCollapsedModeByUser ?? sidebarConfig.isSidebarCollapsedMode],
    // 他のサイドバー関連 atom も同様に追加
  ]);
};

// 各ページでの使用（シンプル！）
const MyPage = (props) => {
  useHydrateSidebarAtoms(props.sidebarConfig, props.userUISettings);
  // 他のロジック...
  return <div>...</div>;
};

// 将来の拡張例
// states/hydrate/modal.ts
// states/hydrate/editor.ts
```

**ディレクトリ構造:**
```
states/
├── ui/
│   ├── sidebar.ts      # サイドバー状態の定義・操作
│   ├── modal.ts        # モーダル状態の定義・操作
│   └── editor.ts       # エディター状態の定義・操作
└── hydrate/
    ├── sidebar.ts      # サイドバー状態のSSRハイドレーション
    ├── modal.ts        # モーダル状態のSSRハイドレーション (将来)
    └── editor.ts       # エディター状態のSSRハイドレーション (将来)
```

### 永続化パターン
```typescript
// 永続化が必要な状態の実装パターン
const someSettingAtom = atom(defaultValue);
const someSettingAtomExt = atom(
  get => get(someSettingAtom),
  (get, set, update: ValueType) => {
    set(someSettingAtom, update);
    scheduleToPut({ settingKey: update });
  },
);
```

### 初期化パターン
```typescript
// サーバーサイドデータでの初期化パターン
const initializedAtom = atom(false);
export const useSomeSettingInitializer = (initialData: ValueType): void => {
  const [isInitialized, setIsInitialized] = useAtom(initializedAtom);
  const [, setSomeSetting] = useSomeSetting();

  useEffect(() => {
    if (!isInitialized) {
      setSomeSetting(initialData);
      setIsInitialized(true);
    }
  }, [isInitialized, setSomeSetting, setIsInitialized, initialData]);
};
```

### テスト戦略
- 各 atom の単体テスト
- 永続化機能のテスト
- コンポーネント結合テスト
- E2E テストでの動作確認

## 🔍 判断基準

### Jotai に移行すべき状態
- ✅ クライアントサイド完結の UI 状態
- ✅ 同期的な状態更新
- ✅ シンプルなデータ構造
- ✅ コンポーネント間での状態共有が必要

### SWR を継続使用すべき状態
- ❌ サーバーからのデータフェッチが必要
- ❌ 非同期的な状態更新
- ❌ キャッシュ機能が重要
- ❌ リアルタイム更新が必要

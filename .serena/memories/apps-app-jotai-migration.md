# Jotai 移行ガイド（更新版）

> **📊 最新の進捗状況**: [`jotai-migration-progress.md`](jotai-migration-progress.md) を参照

## 1. 背景と移行方針

### 課題
- `useSWRStatic` や `useContextSWR` による複雑な状態管理
- パフォーマンスの問題と潜在的なバグ
- 責務の不明確性

### 解決方針
**役割分担の明確化:**
- **SWR**: データフェッチング、サーバーキャッシュ管理に特化
- **Jotai**: クライアントサイドUI状態、同期的な状態管理に特化

## 2. 実装ガイド

### ディレクトリ構造（実装済み）

```
states/
├── ui/
│   ├── sidebar/
│   │   ├── sidebar.ts      # サイドバー状態 ✅
│   │   ├── index.ts        # エクスポート統合 ✅
│   │   └── hydrate.ts      # SSRハイドレーション ✅
│   ├── editor/
│   │   ├── index.ts        # エクスポート統合 ✅
│   │   ├── atoms.ts        # エディターatoms ✅
│   │   ├── hooks.ts        # エディターhooks ✅
│   │   ├── types.ts        # 型定義 ✅
│   │   └── utils.ts        # ユーティリティ ✅
│   ├── device.ts           # デバイス状態 ✅
│   └── modal.ts            # モーダル状態（未作成）
├── page/
│   ├── index.ts            # ページ状態エクスポート ✅
│   ├── hooks.ts            # ページ関連hooks ✅
│   ├── internal-atoms.ts   # 内部atoms ✅
│   ├── hydrate.ts          # SSRハイドレーション ✅
│   └── *.spec.tsx          # テストファイル ✅
├── server-configurations/
│   ├── index.ts            # サーバー設定エクスポート ✅
│   └── server-configurations.ts  # 設定atoms ✅
├── global/
│   ├── index.ts            # グローバル状態エクスポート ✅
│   ├── global.ts           # グローバルatoms ✅
│   └── hydrate.ts          # SSRハイドレーション ✅
├── socket-io/
│   ├── index.ts            # Socket.IOエクスポート ✅
│   └── socket-io.ts        # Socket.IO atoms ✅
└── context.ts              # 共通コンテキスト ✅
```

### 実装パターン

#### 永続化対応パターン
```typescript
// 永続化が必要な状態
const someSettingAtom = atom(defaultValue);
const someSettingAtomExt = atom(
  get => get(someSettingAtom),
  (get, set, update: ValueType) => {
    set(someSettingAtom, update);
    scheduleToPut({ settingKey: update });
  },
);

export const useSomeSetting = () => useAtom(someSettingAtomExt);
```

#### 一時的な状態パターン
```typescript
// 永続化不要な一時的な状態
const temporaryStateAtom = atom(defaultValue);

export const useTemporaryState = () => useAtom(temporaryStateAtom);
```

#### 読み取り専用パターン
```typescript
// 読み取り専用の状態
const readOnlyAtom = atom(defaultValue);

export const useReadOnlyState = () => useAtomValue(readOnlyAtom);
```

#### SSRハイドレーションパターン
```typescript
// states/hydrate/feature.ts
export const useHydrateFeatureAtoms = (initialData: InitialData) => {
  useHydrateAtoms([
    [featureAtom, initialData.feature],
    // 他のatoms...
  ]);
};
```

### 命名規則
- **Atom**: `{feature}Atom`
- **Hook**: `use{Feature}`
- **永続化対応**: `{feature}AtomExt`
- **読み取り専用Hook**: `use{Feature}` (useAtomValue を使用)
- **書き込み専用Hook**: `useSet{Feature}` (useSetAtom を使用)

## 3. 移行時の注意点

### フックの返り値の変更
- **従来**: `const [value, setValue] = useHook();` (tuple)
- **Jotai**: `const value = useHook();` (単一値) または `const [value, setValue] = useHook();` (tuple)

### 型チェックエラーの修正
移行時に発生するTS2488エラーは、配列分割代入の誤用が原因：

```typescript
// ❌ エラーの例
const [value] = useAtomValueHook(); // useAtomValue を使った hook

// ✅ 修正
const value = useAtomValueHook();
```

## 4. 判断基準

### Jotai移行対象
- ✅ クライアントサイド完結のUI状態
- ✅ 同期的な状態更新
- ✅ シンプルなデータ構造
- ✅ コンポーネント間での状態共有が必要

### SWR継続使用対象
- ❌ サーバーからのデータフェッチが必要
- ❌ 非同期的な状態更新
- ❌ キャッシュ機能が重要
- ❌ リアルタイム更新が必要
- ❌ 複雑な computed値（パフォーマンス重視）

## 5. 移行の成果

### 技術的改善
- **コードの簡潔化**: 複雑なSWRベースのカスタムフックがシンプルなatomsに
- **責務の分離**: データフェッチングとクライアント状態管理の明確な分離
- **TypeScript親和性**: 優れた型推論とタイプセーフティ
- **パフォーマンス改善**: 必要な箇所のみの再レンダリング
- **保守性向上**: 状態の依存関係が明確化

### 開発体験の向上
- **直感的なAPI**: React の `useState` に近い使用感
- **デバッグの容易さ**: 状態の変更が追跡しやすい
- **テストの簡素化**: モックやテストデータの管理が簡単
- **型安全性**: TS2488エラーの原因となる誤用を防止

---

## 6. 技術スタック

- **Jotai**: v2.x（アトミックな状態管理）
- **SSR対応**: `useHydrateAtoms`（公式パターン）
- **永続化**: 既存の`scheduleToPut`機構と連携
- **TypeScript**: 型推論とタイプセーフティ

---

## 7. 現在の課題と今後の対応

### 動的ルーティング時の状態管理
以下の値は Next.js の dynamic routing によるページ遷移時に適切に管理されています：

- **currentPagePath** - `useCurrentPagePath()` で適切に管理済み ✅
- **currentPageId** - `useCurrentPageId()` で適切に管理済み ✅
- **pageNotFound** - `usePageNotFound()` で適切に管理済み ✅
- **isNotCreatable** - `usePageNotCreatable()` で適切に管理済み ✅

### 次のステップ
1. **残りのUI状態の移行**: `usePageControlsX`, `useSelectedGrant`
2. **モーダル状態の移行**: 統一的なパターンでの実装
3. **レガシーファイルのクリーンアップ**: `stores/ui.tsx`, `stores/modal.tsx`

---

## 8. トラブルシューティング

### よくある移行エラー

#### TS2488: Type must have a '[Symbol.iterator]()' method
```typescript
// ❌ 問題のあるコード
const [value] = useAtomValueHook();

// ✅ 修正版
const value = useAtomValueHook();
```

#### TS2724: no exported member
```typescript
// ❌ 削除されたfook
import { useOldHook } from '~/states/somewhere';

// ✅ 新しいatom-based hook
import { useNewHook } from '~/states/somewhere';
const value = useNewHook(); // または [value, setValue]
```